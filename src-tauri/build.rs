fn main() {

    let mut windows = tauri_build::WindowsAttributes::new();
    if cfg!(debug_assertions) {

        tauri_build::build()

    } else {

        windows = windows.app_manifest(r#"
            <assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
                <dependency>
                <dependentAssembly>
                    <assemblyIdentity
                    type="win32"
                    name="Microsoft.Windows.Common-Controls"
                    version="6.0.0.0"
                    processorArchitecture="*"
                    publicKeyToken="6595b64144ccf1df"
                    language="*"
                    />
                </dependentAssembly>
                </dependency>
                <trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
                    <security>
                        <requestedPrivileges>
                            <requestedExecutionLevel level="requireAdministrator" uiAccess="false" />
                        </requestedPrivileges>
                    </security>
                </trustInfo>
            </assembly>
        "#);
        let attrs = tauri_build::Attributes::new().windows_attributes(windows);
        tauri_build::try_build(attrs).expect("error while building tauri application");
        finalize_release();
        
    }
    
}

fn finalize_release() {
    
    copy_blauncher();
    
}

/*
    blauncher is only needed for builds that are released on itch.io, and not needed for builds that are
    built through github actions.
*/
fn copy_blauncher() {

    match std::fs::copy("./misc/blauncher.exe", "./target/release/misc/blauncher.exe") {
        Ok(_) => println!("blauncher.exe copied successfully"),
        Err(e) => println!("Error while copying blauncher.exe: {}", e)
    }

}