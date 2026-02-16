
use dll_syringe::{Syringe, error::EjectError, process::{BorrowedProcess, ProcessModule}, rpc::RemoteRawProcedure};
use tracing::{info, error};

use crate::share::module_ports::ModulePorts;

struct RemoteFunctions {
    capture_module_initalized: RemoteRawProcedure<extern "system" fn() -> bool>,
    get_module_ports: RemoteRawProcedure<extern "system" fn() -> ModulePorts>,
    set_chator_port: RemoteRawProcedure<extern "system" fn(u16)>,
    init_capture_module: RemoteRawProcedure<extern "system" fn(u16) -> u16>
}

impl RemoteFunctions {

    pub fn new(syringe: &Syringe, injected_payload: ProcessModule<BorrowedProcess>) -> RemoteFunctions {

        RemoteFunctions {
            capture_module_initalized: unsafe { syringe.get_raw_procedure::<extern "system" fn() -> bool>(injected_payload, "capture_module_initalized") }.unwrap().unwrap(),
            get_module_ports: unsafe { syringe.get_raw_procedure::<extern "system" fn() -> ModulePorts>(injected_payload, "get_module_ports") }.unwrap().unwrap(),
            set_chator_port: unsafe { syringe.get_raw_procedure::<extern "system" fn(u16)>(injected_payload, "set_chator_port") }.unwrap().unwrap(),
            init_capture_module: unsafe { syringe.get_raw_procedure::<extern "system" fn(u16) -> u16>(injected_payload, "init_capture_module") }.unwrap().unwrap()
        }

    }

}

pub struct SyringeContainer<'a> {
    syringe: &'a Syringe,
    injected_payload: ProcessModule<BorrowedProcess<'a>>,
    remote_functions: RemoteFunctions
}

impl<'a> SyringeContainer<'a> {

    pub fn inject(syringe: &'a Syringe) -> Result<SyringeContainer<'a>, &'static str> {

        let injected_payload = if cfg!(debug_assertions) {
            syringe.find_or_inject("./target/debug/swtor_chat_capture.dll")
        } else {
            syringe.find_or_inject("./swtor_chat_capture.dll")
        };

        match injected_payload {
            Ok(_) => {
                info!("Payload injected");
            },
            Err(err) => {
                error!("Error injecting payload: {:?}", err);
                return Err("Error injecting payload");
            }
        }

        let injected_payload = injected_payload.unwrap();

        Ok(SyringeContainer {
            syringe: syringe,
            injected_payload,
            remote_functions: RemoteFunctions::new(syringe, injected_payload)
        })

    }

    pub fn eject(&self) -> Result<(), EjectError> {
        self.syringe.eject(self.injected_payload)
    }

    /// Gets the ports that the module is listening on.
    pub fn get_module_ports(&self) -> ModulePorts {
        self.remote_functions.get_module_ports.call().unwrap()
    }

    /// Sets the port that the chator client is listening on.
    pub fn set_chator_port(&self, port: u16) {
        self.remote_functions.set_chator_port.call(port).unwrap();
    }

    /// Checks if the capture module has been initialized.
    pub fn capture_module_initalized(&self) -> bool {
        self.remote_functions.capture_module_initalized.call().unwrap()
    }

    /// Initializes the capture module.
    pub fn init_capture_module(&self, chator_port: u16) -> u16 {
        self.remote_functions.init_capture_module.call(chator_port).unwrap()
    }

}