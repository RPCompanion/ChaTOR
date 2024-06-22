
use crate::dal::db::settings;
use crate::share::*;
use crate::swtor::SwtorChannel;
use crate::swtor_hook::post;
use crate::utils::StringUtils;

use crate::dal::db::swtor_message::SwtorMessage;

pub struct SwtorMessageContainer {
    pub unstored_messages: Vec<SwtorMessage>
}

impl SwtorMessageContainer {

    pub fn new() -> SwtorMessageContainer {

        SwtorMessageContainer {
            unstored_messages: Vec::new()
        }

    }

    pub fn push(&mut self, capture_message: CaptureMessage) {

        if let CaptureMessage::Chat(swtor_message) = capture_message {

            if settings::get_settings().chat_log.retry_message_submission {

                let channel = match SwtorChannel::try_from(swtor_message.channel) {
                    Ok(channel) => channel,
                    Err(_) => SwtorChannel::EMOTE
                };

                post::push_incoming_message_hash(channel, swtor_message.get_parsed_message().as_u64_hash());

            }

            self.unstored_messages.push(swtor_message);

        }

    }

    pub fn drain_unstored(&mut self) -> Vec<SwtorMessage> {

        self.unstored_messages
            .drain(..)
            .collect()

    }

}