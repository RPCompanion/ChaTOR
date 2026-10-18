"""Release packaging checks; run with python3 -m unittest test_build."""
import tempfile
import tomllib
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

import build


class WindowsPackagingTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        root = Path(temp.name)
        self.app = root / "ChaTOR"
        self.tauri = self.app / "src-tauri"
        self.launcher = root / "blauncher"
        for name, value in (("APP", self.app), ("TAURI", self.tauri),
                            ("BLAUNCHER_CRATE", self.launcher), ("DRY_RUN", False)):
            patcher = patch.object(build, name, value)
            patcher.start()
            self.addCleanup(patcher.stop)

    def write(self, path, data=b"fixture"):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)

    @patch.object(build, "require_tools")
    def test_windows_zip_contains_itch_launcher_and_includes_it_for_signing(self, _tools):
        self.write(self.launcher / "Cargo.toml")
        launcher_exe = self.launcher / "target" / build.WIN_TARGET / "release" / "blauncher.exe"
        self.write(self.tauri / "target" / build.WIN_TARGET / "release" / "ChaTOR.exe")
        for name in ("config.toml", "offsets.json", "sql/schema.sql", "gamedata/data.json"):
            self.write(self.tauri / name)
        for name in build.SERVICE_FILES:
            self.write(self.tauri / "service" / name)
        manifest = Path(__file__).parent / "src-tauri" / "misc" / ".itch.toml"
        self.write(self.tauri / "misc" / ".itch.toml", manifest.read_bytes())

        def compile_launcher(cmd, **_kwargs):
            if cmd[:3] == ["cargo", "xwin", "build"]:
                self.write(launcher_exe, b"fresh launcher")

        with patch.object(build, "run", side_effect=compile_launcher) as run:
            folder, sign_files = build.build_windows("1.2.3")
        run.assert_any_call(
            ["cargo", "xwin", "build", "--release", "--locked", "--target", build.WIN_TARGET,
             "--target-dir", str(self.launcher / "target")], cwd=self.launcher)
        self.assertIn(folder / "blauncher.exe", sign_files)
        action = tomllib.loads((folder / ".itch.toml").read_text())["actions"][0]
        self.assertEqual(action["path"], "blauncher.exe")
        archive = build.zip_folder(folder, folder.parent / "release.zip")
        with zipfile.ZipFile(archive) as package:
            self.assertEqual(package.read(f"ChaTOR/{action['path']}"), b"fresh launcher")
            self.assertIn("ChaTOR/ChaTOR.exe", package.namelist())

    def test_missing_launcher_repo_has_actionable_error(self):
        with self.assertRaisesRegex(build.BuildError, "CHATOR_BLAUNCHER_DIR"):
            build.build_blauncher()

    @patch.object(build, "require_tools")
    @patch.object(build, "run")
    def test_missing_launcher_output_fails_before_packaging(self, _run, _tools):
        self.write(self.launcher / "Cargo.toml")
        with self.assertRaisesRegex(build.BuildError, "no blauncher executable"):
            build.build_windows("1.2.3")
        self.assertFalse((self.app / "release").exists())

    @patch.object(build, "require_tools")
    def test_windows_dry_run_does_not_write_files(self, _tools):
        self.write(self.launcher / "Cargo.toml")
        with patch.object(build, "DRY_RUN", True):
            folder, sign_files = build.build_windows("1.2.3")
        self.assertFalse(folder.exists())
        self.assertFalse((self.launcher / "target").exists())
        self.assertIn(folder / "blauncher.exe", sign_files)


if __name__ == "__main__":
    unittest.main()
