
use int_enum::IntEnum;

#[repr(i32)]
#[derive(IntEnum)]
pub enum SwtorChannel {
    SAY = 1,
    YELL = 2,
    EMOTE = 3,
    WHISPER = 4,
    GLOBAL = 51,
    PVP = 52,
    TRADE = 53,
    GROUP = 54,
    GUILD = 57
}