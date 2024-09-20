
use sysinfo::System;

use serde::{Deserialize, Serialize};

use crate::share::AsJson;

#[derive(Serialize, Deserialize)]
pub struct SysInfo {
    pub app_version: String,
    pub name: Option<String>,
    pub kernel_version: Option<String>,
    pub os_version: Option<String>,
    pub num_cpus: usize,
    pub total_memory: u64,
    pub used_memory: u64,
}

impl AsJson for SysInfo {}

impl Default for SysInfo {

    fn default() -> Self {

        let mut system = System::new_all();
        system.refresh_all();
        
        Self {
            app_version: env!("CARGO_PKG_VERSION").to_string(),
            name: System::name(),
            kernel_version: System::kernel_version(),
            os_version: System::os_version(),
            num_cpus: system.cpus().len(),
            total_memory: system.total_memory(),
            used_memory: system.used_memory()
        }

    }

}