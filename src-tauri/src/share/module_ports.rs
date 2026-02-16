
#[repr(C)]
#[derive(Copy, Clone)]
pub struct ModulePorts {
    pub chator_port: u16,
    pub local_port: u16
}

impl ModulePorts {

    pub fn new(chator_port: u16, local_port: u16) -> Self {

        Self {
            chator_port,
            local_port
        }

    }

}