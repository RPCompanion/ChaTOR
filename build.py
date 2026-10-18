#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""
ChaTOR release builder (local, Linux host, no VM).

Lives in the ChaTOR repo; expects sibling chator-service and blauncher repos
(override with CHATOR_SERVICE_DIR and CHATOR_BLAUNCHER_DIR). blauncher is needed
only for Windows builds. CI runs this same script (.github/workflows/build.yml).

    uv run build.py all                 service + Linux bundles + Windows portable zip
    uv run build.py linux               Linux only (deb / rpm / AppImage)
    uv run build.py windows             Windows only (cargo-xwin cross-compile, portable folder + zip)
    uv run build.py service             just chator-service.exe + swtor_chat_capture.dll
    uv run build.py all --sign          also sign artifacts per release.toml
    uv run build.py windows --dry-run   print the commands without running them

Pipeline
  service   chator-service/build.sh --release  ->  ChaTOR/src-tauri/service/{chator-service.exe, swtor_chat_capture.dll}
  frontend  npm install + (tauri build runs `npm run build` itself)
  linux     tauri build                                   -> src-tauri/target/release/bundle/** (deb/rpm/AppImage)
            then assemble ChaTOR/release/<version>/linux/ChaTOR/ (portable folder, same layout as Windows) + zip
  blauncher cargo xwin build --release (Windows only, for itch.io's launch action)
  windows   tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc --no-bundle
            then assemble ChaTOR/release/<version>/windows/ChaTOR/ (exe, blauncher.exe, config, offsets, sql, gamedata, service, .itch.toml) + zip
  sign      optional; see release.example.toml (osslsigncode for Windows PE files, gpg for Linux artifacts)
  collect   copy every artifact into ChaTOR/release/<version>/ and write SHA256SUMS

Secrets never live in release.toml: it names environment variables that hold them.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
import tomllib
import zipfile
from dataclasses import dataclass, field
from pathlib import Path

APP = Path(__file__).resolve().parent
ROOT = APP.parent
TAURI = APP / "src-tauri"
SERVICE_CRATE = Path(os.environ.get("CHATOR_SERVICE_DIR", ROOT / "chator-service")).resolve()
BLAUNCHER_CRATE = Path(os.environ.get("CHATOR_BLAUNCHER_DIR", ROOT / "blauncher")).resolve()
SERVICE_DIR = TAURI / "service"
WIN_TARGET = "x86_64-pc-windows-msvc"
RELEASE_CONFIG = APP / "release.toml"
IN_CI = os.environ.get("CI", "").strip().lower() not in ("", "0", "false", "no")
if IN_CI:
    # The Tauri CLI parses CI as a strict boolean ("1" is rejected).
    os.environ["CI"] = "true"

DRY_RUN = False


# --------------------------------------------------------------------------- utils
class BuildError(RuntimeError):
    pass


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def step(title: str) -> None:
    print(f"\n\033[1;36m==> {title}\033[0m", flush=True)


def note(msg: str) -> None:
    print(f"    {msg}", flush=True)


def run(cmd: list[str], *, cwd: Path | None = None, env: dict[str, str] | None = None, capture: bool = False) -> str:
    shown = " ".join(str(c) for c in cmd)
    note(f"$ {shown}" + (f"   (in {cwd})" if cwd else ""))
    if DRY_RUN:
        return ""
    full_env = {**os.environ, **(env or {})}
    try:
        if capture:
            return subprocess.run(cmd, cwd=cwd, env=full_env, check=True, text=True, capture_output=True).stdout
        subprocess.run(cmd, cwd=cwd, env=full_env, check=True)
        return ""
    except subprocess.CalledProcessError as e:
        raise BuildError(f"command failed ({e.returncode}): {shown}") from e
    except FileNotFoundError as e:
        raise BuildError(f"tool not found: {cmd[0]} ({e})") from e


def require_tools(*tools: str) -> None:
    missing = [t for t in tools if shutil.which(t) is None]
    if missing:
        raise BuildError(f"missing tools on PATH: {', '.join(missing)}")


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def app_version() -> str:
    return json.loads((TAURI / "tauri.conf.json").read_text())["version"]


# --------------------------------------------------------------------------- config
@dataclass
class WindowsSigning:
    tool: str = "osslsigncode"          # or "signtool" when running on Windows
    certificate: str = ""               # .pfx/.p12 path (osslsigncode) or thumbprint (signtool)
    password_env: str = ""              # env var holding the certificate password
    timestamp_url: str = "http://timestamp.digicert.com"
    description: str = "ChaTOR"
    url: str = ""


@dataclass
class LinuxSigning:
    gpg_key: str = ""                   # key id / fingerprint for detached .asc signatures


@dataclass
class ReleaseConfig:
    windows: WindowsSigning = field(default_factory=WindowsSigning)
    linux: LinuxSigning = field(default_factory=LinuxSigning)

    @staticmethod
    def load() -> "ReleaseConfig":
        if not RELEASE_CONFIG.exists():
            return ReleaseConfig()
        data = tomllib.loads(RELEASE_CONFIG.read_text())
        signing = data.get("signing", {})
        return ReleaseConfig(
            windows=WindowsSigning(**signing.get("windows", {})),
            linux=LinuxSigning(**signing.get("linux", {})),
        )


# --------------------------------------------------------------------------- steps
def build_service() -> None:
    step("chator-service (release)")
    if not (SERVICE_CRATE / "build.sh").is_file():
        raise BuildError(f"chator-service not found at {SERVICE_CRATE} (set CHATOR_SERVICE_DIR)")
    require_tools("cargo-xwin")
    run([str(SERVICE_CRATE / "build.sh"), "--release"], env={"CHATOR_APP_DIR": str(APP)})


SERVICE_FILES = ("chator-service.exe", "swtor_chat_capture.dll")


def stage_release_service() -> None:
    """Put the *release* service into src-tauri/service before bundling.

    chator-service/build.sh (debug, for development) copies into the same folder,
    so never trust what is there: copy from the service's release output."""
    src = SERVICE_CRATE / "target" / WIN_TARGET / "release"
    note(f"bundling release service from {rel(src)}")
    if DRY_RUN:
        return
    SERVICE_DIR.mkdir(parents=True, exist_ok=True)
    for name in SERVICE_FILES:
        if not (src / name).is_file():
            raise BuildError(f"{src / name} missing; run without --skip-service (or `uv run build.py service`)")
        shutil.copy2(src / name, SERVICE_DIR / name)


def frontend_deps() -> None:
    step("frontend dependencies")
    require_tools("npm", "npx")
    verb = "ci" if IN_CI else "install"   # CI: exact lockfile, fail on drift
    run(["npm", verb, "--legacy-peer-deps", "--no-audit", "--no-fund"], cwd=APP)


LINUX_ITCH_MANIFEST = """
[[actions]]
name = "launch"
path = "ChaTOR"
platforms = "linux"
"""


def assemble_portable(out: Path, binary: Path, binary_name: str) -> None:
    """Portable folder: app binary + config, offsets, sql, gamedata and the bundled service."""
    note(f"assembling portable folder {rel(out)}")
    if DRY_RUN:
        return
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    shutil.copy2(binary, out / binary_name)
    for f in ("config.toml", "offsets.json"):
        shutil.copy2(TAURI / f, out / f)
    for d in ("sql", "gamedata", "service"):
        shutil.copytree(TAURI / d, out / d)


def build_linux(version: str) -> tuple[list[Path], Path]:
    step("ChaTOR for Linux (tauri build)")
    run(["npx", "tauri", "build"], cwd=APP)
    bundle = TAURI / "target" / "release" / "bundle"
    bundles = [p for ext in ("*.deb", "*.rpm", "*.AppImage") for p in bundle.rglob(ext)]
    for a in bundles:
        note(f"built {rel(a)}  ({a.stat().st_size // 1024} KiB)")
    if not DRY_RUN and not bundles:
        raise BuildError("tauri build produced no Linux bundles")

    target = TAURI / "target" / "release"
    binary = next((target / n for n in ("ChaTOR", "chator") if (target / n).is_file()), None)
    if not DRY_RUN and binary is None:
        raise BuildError(f"no Linux executable found in {target}")
    out = APP / "release" / version / "linux" / "ChaTOR"
    assemble_portable(out, binary or target / "ChaTOR", "ChaTOR")
    if not DRY_RUN:
        (out / "ChaTOR").chmod(0o755)
        (out / ".itch.toml").write_text(LINUX_ITCH_MANIFEST.lstrip())
    return bundles, out


def build_blauncher() -> Path:
    step("blauncher for Windows (release)")
    if not (BLAUNCHER_CRATE / "Cargo.toml").is_file():
        raise BuildError(f"blauncher not found at {BLAUNCHER_CRATE} (set CHATOR_BLAUNCHER_DIR)")
    require_tools("cargo-xwin", "clang-cl", "lld-link")
    target = BLAUNCHER_CRATE / "target"
    run(["cargo", "xwin", "build", "--release", "--locked", "--target", WIN_TARGET,
         "--target-dir", str(target)], cwd=BLAUNCHER_CRATE)
    exe = target / WIN_TARGET / "release" / "blauncher.exe"
    if not DRY_RUN and not exe.is_file():
        raise BuildError(f"no blauncher executable found at {exe}")
    return exe


def build_windows(version: str) -> tuple[Path, list[Path]]:
    launcher = build_blauncher()
    step(f"ChaTOR for Windows ({WIN_TARGET} via cargo-xwin)")
    require_tools("cargo-xwin", "clang-cl", "lld-link", "llvm-rc")
    run(["npx", "tauri", "build", "--runner", "cargo-xwin", "--target", WIN_TARGET, "--no-bundle"], cwd=APP)

    out = APP / "release" / version / "windows" / "ChaTOR"
    target = TAURI / "target" / WIN_TARGET / "release"
    exe = next((target / n for n in ("ChaTOR.exe", "chator.exe") if (target / n).is_file()), None)
    if not DRY_RUN and exe is None:
        raise BuildError(f"no Windows executable found in {target}")
    assemble_portable(out, exe or target / "ChaTOR.exe", "ChaTOR.exe")
    if not DRY_RUN:
        shutil.copy2(launcher, out / "blauncher.exe")
        shutil.copy2(TAURI / "misc" / ".itch.toml", out / ".itch.toml")
    pe_files = [out / "ChaTOR.exe", out / "blauncher.exe",
                out / "service" / "chator-service.exe", out / "service" / "swtor_chat_capture.dll"]
    return out, pe_files


def zip_folder(folder: Path, zip_path: Path) -> Path:
    note(f"zipping -> {rel(zip_path)}")
    if DRY_RUN:
        return zip_path
    zip_path.unlink(missing_ok=True)
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(folder.rglob("*")):
            z.write(p, p.relative_to(folder.parent))
    return zip_path


# --------------------------------------------------------------------------- signing
def sign_windows(files: list[Path], cfg: WindowsSigning) -> None:
    step("signing Windows binaries")
    if not cfg.certificate:
        note("no [signing.windows].certificate in release.toml; skipping")
        return
    password = os.environ.get(cfg.password_env, "") if cfg.password_env else ""
    if cfg.password_env and not password:
        raise BuildError(f"environment variable {cfg.password_env} (certificate password) is not set")

    for f in files:
        if cfg.tool == "osslsigncode":
            require_tools("osslsigncode")
            tmp = f.with_suffix(f.suffix + ".signed")
            cmd = ["osslsigncode", "sign", "-pkcs12", cfg.certificate, "-h", "sha256",
                   "-n", cfg.description, "-ts", cfg.timestamp_url, "-in", str(f), "-out", str(tmp)]
            if cfg.url:
                cmd += ["-i", cfg.url]
            if password:
                cmd += ["-pass", password]
            shown = [c if c != password else "******" for c in cmd]
            note(f"$ {' '.join(shown)}")
            if not DRY_RUN:
                subprocess.run(cmd, check=True)
                tmp.replace(f)
                run(["osslsigncode", "verify", "-in", str(f)], capture=True)
        elif cfg.tool == "signtool":
            require_tools("signtool")
            run(["signtool", "sign", "/fd", "sha256", "/tr", cfg.timestamp_url, "/td", "sha256",
                 "/sha1", cfg.certificate, "/d", cfg.description, str(f)])
            run(["signtool", "verify", "/pa", str(f)], capture=True)
        else:
            raise BuildError(f"unknown Windows signing tool: {cfg.tool}")
        note(f"signed {f.name}")


def sign_linux(files: list[Path], cfg: LinuxSigning) -> list[Path]:
    step("signing Linux artifacts (gpg detached signatures)")
    if not cfg.gpg_key:
        note("no [signing.linux].gpg_key in release.toml; skipping")
        return []
    require_tools("gpg")
    sigs = []
    for f in files:
        sig = f.with_suffix(f.suffix + ".asc")
        run(["gpg", "--batch", "--yes", "--local-user", cfg.gpg_key, "--armor", "--detach-sign", "--output", str(sig), str(f)])
        sigs.append(sig)
    return sigs


# --------------------------------------------------------------------------- collect
def collect(version: str, artifacts: list[Path]) -> None:
    step(f"collecting artifacts -> ChaTOR/release/{version}/")
    dest = APP / "release" / version
    if DRY_RUN:
        return
    dest.mkdir(parents=True, exist_ok=True)
    for a in artifacts:
        target = a if a.is_relative_to(dest) else dest / a.name
        if target != a:
            shutil.copy2(a, target)
        note(f"{rel(target)}")
    # Checksum every artifact in the version folder, not just this run's, so a
    # single-platform rebuild keeps the other platform's entries.
    patterns = ("*.deb", "*.rpm", "*.AppImage", "*.asc", "windows/*.zip", "linux/*.zip", "windows/*.asc", "linux/*.asc")
    files = sorted({p for pat in patterns for p in dest.glob(pat) if p.is_file()})
    lines = [f"{sha256(p)}  {p.relative_to(dest)}" for p in files]
    (dest / "SHA256SUMS").write_text("\n".join(lines) + "\n")
    note(f"SHA256SUMS written ({len(files)} files)")


# --------------------------------------------------------------------------- main
def main(argv: list[str]) -> int:
    global DRY_RUN
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("what", choices=["all", "linux", "windows", "service"])
    ap.add_argument("--skip-service", action="store_true", help="reuse the service already in src-tauri/service/")
    ap.add_argument("--sign", action="store_true", help="sign artifacts as configured in release.toml")
    ap.add_argument("--no-zip", action="store_true", help="Windows: keep only the portable folder")
    ap.add_argument("--no-install", action="store_true", help="skip npm install (node_modules already set up)")
    ap.add_argument("--dry-run", action="store_true", help="print commands without running them")
    args = ap.parse_args(argv)
    DRY_RUN = args.dry_run

    started = time.time()
    version = app_version()
    cfg = ReleaseConfig.load()
    print(f"ChaTOR {version}  |  config: {'release.toml' if RELEASE_CONFIG.exists() else 'none (unsigned)'}"
          f"{'  |  DRY RUN' if DRY_RUN else ''}")

    try:
        if args.what == "service":
            build_service()
            return 0

        if not args.skip_service:
            build_service()
        stage_release_service()
        if not args.no_install:
            frontend_deps()

        artifacts: list[Path] = []
        if args.what in ("all", "linux"):
            bundles, folder = build_linux(version)
            linux = list(bundles)
            if not args.no_zip:
                linux.append(zip_folder(folder, folder.parent / f"ChaTOR-{version}-linux-x64.zip"))
            if args.sign:
                linux += sign_linux(linux, cfg.linux)
            artifacts += linux

        if args.what in ("all", "windows"):
            folder, pe_files = build_windows(version)
            if args.sign:
                sign_windows(pe_files, cfg.windows)
            if not args.no_zip:
                artifacts.append(zip_folder(folder, folder.parent / f"ChaTOR-{version}-windows-x64.zip"))

        collect(version, artifacts)
    except BuildError as e:
        print(f"\n\033[1;31mBUILD FAILED:\033[0m {e}", file=sys.stderr)
        return 1

    print(f"\nDone in {time.time() - started:.0f}s.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
