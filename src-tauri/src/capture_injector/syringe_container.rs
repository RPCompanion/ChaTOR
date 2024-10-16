
use dll_syringe::{error::EjectError, process::{BorrowedProcess, ProcessModule}, rpc::RemotePayloadProcedure, Syringe};
use tracing::{info, error};

struct RemoteFunctions {
    init_capture_module: RemotePayloadProcedure<fn(u16) -> u16>
}

impl RemoteFunctions {

    pub fn new(syringe: &Syringe, injected_payload: ProcessModule<BorrowedProcess>) -> RemoteFunctions {

        RemoteFunctions {
            init_capture_module: unsafe { syringe.get_payload_procedure::<fn(u16) -> u16>(injected_payload, "init_capture_module") }.unwrap().unwrap()
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

    /// Initializes the capture module.
    pub fn init_capture_module(&self, chator_port: u16) -> u16 {
        self.remote_functions.init_capture_module.call(&chator_port).unwrap()
    }

}