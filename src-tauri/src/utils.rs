
use std::fs::File;
use std::io::prelude::*;

use sha2::{Sha256, Digest};

pub trait StringUtils {

	fn as_i32_hash(&self) -> i32;
	fn as_u64_hash(&self) -> u64;

}

impl StringUtils for String {

	fn as_i32_hash(&self) -> i32 {

		let mut hasher = Sha256::new();
		hasher.update(self.as_bytes());
		let result = hasher.finalize();
		u32::from_str_radix(&result[..4].iter().map(|b| format!("{:02x}", b)).collect::<String>(), 16).unwrap() as i32

	}

	fn as_u64_hash(&self) -> u64 {

		let mut hasher = Sha256::new();
		hasher.update(self.as_bytes());
		let result = hasher.finalize();
		u64::from_str_radix(&result[..8].iter().map(|b| format!("{:02x}", b)).collect::<String>(), 16).unwrap()

	}

}

impl StringUtils for &str {

	fn as_i32_hash(&self) -> i32 {

		let mut hasher = Sha256::new();
		hasher.update(self.as_bytes());
		let result = hasher.finalize();
		u32::from_str_radix(&result[..4].iter().map(|b| format!("{:02x}", b)).collect::<String>(), 16).unwrap() as i32

	}

	fn as_u64_hash(&self) -> u64 {

		let mut hasher = Sha256::new();
		hasher.update(self.as_bytes());
		let result = hasher.finalize();
		u64::from_str_radix(&result[..8].iter().map(|b| format!("{:02x}", b)).collect::<String>(), 16).unwrap()

	}

}

pub fn get_file(path: &str) -> String {

	let mut file = File::open(path).unwrap();
	let mut contents = String::new();
	file.read_to_string(&mut contents).unwrap();
	contents

}