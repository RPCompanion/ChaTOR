
use std::fs;
use std::path::Path;
use std::os::windows::fs::MetadataExt;

use chrono::prelude::*;
use tracing_subscriber::{self, fmt, prelude::*};
use tracing_appender::{self, non_blocking::WorkerGuard};

const WINDOWS_TICK: u64      = 10000000;
const SEC_TO_UNIX_EPOCH: u64 = 11644473600;

pub fn init() -> WorkerGuard {

    let path = Path::new("./logs");
    if !path.exists() {

        fs::create_dir("./logs")
            .expect("error while creating logs directory");

    }
    delete_stale_files();

    let file_appender = tracing_appender::rolling::daily("./logs", "chator.log");
    let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);

    tracing_subscriber::registry()
        .with(fmt::layer()
            .with_writer(non_blocking)
            .with_level(true)
            .with_ansi(false)
        )
        .init();

    guard

}

fn delete_stale_files() {

    let path = Path::new("./logs");
    let files = fs::read_dir(path)
        .expect("error while reading logs directory");

    for file in files {

        let file = file
            .expect("error while reading file")
            .path();

        if !file.is_file() {
            continue;
        }

        let metadata = fs::metadata(&file)
            .expect("error while reading file metadata");

        let date_time = DateTime::from_timestamp(metadata.last_write_unix_epoch(), 0).unwrap();
        let current_time = Utc::now();
        if (current_time - date_time).num_days() >= 7 {

            fs::remove_file(&file)
                .expect("error while removing file");

        }

    }

}

trait WinToUnix {
    fn last_write_unix_epoch(&self) -> i64;
}

impl<T: MetadataExt> WinToUnix for T {

    fn last_write_unix_epoch(&self) -> i64 {
        ((self.last_write_time() / WINDOWS_TICK) - SEC_TO_UNIX_EPOCH) as i64
    }

}