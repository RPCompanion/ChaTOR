
use chrono::prelude::*;
use regex::Regex;
use serde::{Deserialize, Serialize};

use crate::dal::characters::Color;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SwtorMessage {
    pub player_id: Option<String>,
    pub timestamp: Option<NaiveTime>,
    pub color: Color,
    pub message: String
}

impl SwtorMessage {

    pub fn from(message: String) -> Result<SwtorMessage, &'static str> {

        Ok(SwtorMessage {
            player_id: SwtorMessage::get_player_id(&message),
            timestamp: SwtorMessage::get_timestamp(&message),
            color: SwtorMessage::get_color(&message)?,
            message: SwtorMessage::get_message(&message)?
        })

    }

    fn get_timestamp(message: &str) -> Option<NaiveTime> {

        let re = Regex::new(r"\[(\d{1,2}:\d{2}:\d{2} [AP]M)\]").unwrap();
        if let Some(captures) = re.captures(message) {

            let timestamp = captures.get(1).unwrap().as_str();
            let timestamp = timestamp.replace("AM", "am").replace("PM", "pm");
            return Some(NaiveTime::parse_from_str(&timestamp, "%I:%M:%S %P").unwrap())

        }
        None

    }

    fn get_color(message: &str) -> Result<Color, &'static str> {

        let re = Regex::new(r"color='(#[0-9a-fA-F]{6})'").unwrap();
        if let Some(captures) = re.captures(message) {

            let color = captures.get(1).unwrap().as_str();
            return Ok(Color::from_hex(color));

        }
        return Err("No color found");

    }

    fn get_player_id(message: &str) -> Option<String> {

        let re = Regex::new(r"BBB.\s*([\w']+(?:\s+[\w']+)*)").unwrap();
        if let Some(captures) = re.captures(message) {
            return Some(captures.get(1).unwrap().as_str().to_string());
        }
        None

    }

    fn get_message(message: &str) -> Result<String, &'static str> {
            
        let re = Regex::new(r#"<hl lid="BBB.{4}[^"]+" >(.+?)<\/font>"#).unwrap();
        if let Some(captures) = re.captures(message) {
            let temp = captures.get(1).unwrap().as_str()
                .replace("] whispers:", "")
                .replace("] says:", "")
                .replace("] yells:", "")
                .replace("]:", "")
                .trim()
                .to_string();
            
            return Ok(temp);
        }
        return Err("No message found");
    
    }

    pub fn as_json_str(&self) -> String {
        serde_json::to_string(self).unwrap()
    }

}

#[test]
fn test_timestamp_parser() {

    const TIME_STRING: &str = "<font>[1:30:20 PM]</font>";
    let time = SwtorMessage::get_timestamp(TIME_STRING).unwrap();
    assert_eq!(time.hour(), 13);
    assert_eq!(time.minute(), 30);
    assert_eq!(time.second(), 20);

}

#[test]
fn test_color_parser() {

    const COLOR_STRING: &str = "<font color='#ff8022'>Test</font>";
    let color = SwtorMessage::get_color(COLOR_STRING).unwrap();
    assert_eq!(color.r, 255);
    assert_eq!(color.g, 128);
    assert_eq!(color.b, 34);

}

#[test]
fn test_player_id_with_apostraphe() {
    const PLAYER_ID_STRING: &str = "<font color='#ff8022'>[3:56:03 PM] <hl lid=\"BBBJNiufi'ren\" > holds out the datapad back to Nistra.</font>";
    let player_id = SwtorMessage::get_player_id(PLAYER_ID_STRING).unwrap();
    assert_eq!(player_id, "Niufi'ren");
}

#[test]
fn test_player_id() {
    const PLAYER_ID_STRING: &str = "<font color='#ff8022'>[3:44:14 PM] <hl lid=\"BBBIShiatara\" > nods to Keleeni: &quot;Bye.&quot;</font>";
    let player_id = SwtorMessage::get_player_id(PLAYER_ID_STRING).unwrap();
    assert_eq!(player_id, "Shiatara");
}

#[test]
fn test_message() {

    const MESSAGE_STRING: &str = "<font color='#ff8022'>[3:44:14 PM] <hl lid=\"BBBIShiatara\" > nods to Keleeni: &quot;Bye.&quot;</font>";
    let message = SwtorMessage::from(MESSAGE_STRING.to_string()).unwrap();
    assert_eq!(message.message, "nods to Keleeni: &quot;Bye.&quot;");

}