
use std::io;
use std::fs::{self, DirEntry};

use tracing::error;
use rusqlite::{Row, Batch, params, Connection};

mod chat_tab_migration;

use self::chat_tab_migration::OldChatTab;
use crate::utils::get_file;

static VERSION: &str = env!("CARGO_PKG_VERSION");

#[derive(Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct DatabaseVersion {
	pub major: u16,
	pub minor: u16,
	pub patch: u16
}

impl DatabaseVersion {

	pub fn new(major: u16, minor: u16, patch: u16) -> DatabaseVersion {

		DatabaseVersion {
			major,
			minor,
			patch
		}

	}

}

lazy_static! {
	static ref VERSIONS: Vec<(DatabaseVersion, String)> = get_migration_scripts();
}

fn get_migration_script(path: DirEntry) -> (DatabaseVersion, String) {

	let file_name = path.file_name();

	let version = file_name
		.to_str()
		.unwrap()
		.split("-")
		.collect::<Vec<&str>>()[1];

	let version: Vec<u16> = version
		.replace(".sql", "")
		.split(".")
		.map(|v| v.parse::<u16>().unwrap())
		.collect();

	(DatabaseVersion::new(version[0], version[1], version[2]), get_file(path.path().to_str().unwrap()))

}

fn get_migration_scripts() -> Vec<(DatabaseVersion, String)> {

	let mut scripts = fs::read_dir("./sql/migration/").unwrap().map(|f| f.map(|e| {
		get_migration_script(e)
	})) 
	.collect::< Result<Vec<(DatabaseVersion, String)>, io::Error>>()
	.unwrap();

	scripts.sort_by(|a, b| a.0.cmp(&b.0));
	scripts

}

/// Run non-SQL migrations. To be deleted in the future.
pub fn run_non_sql_migrations() {

	if let Err(err) = OldChatTab::migrate() {
		error!("Error migrating chat tabs: {}", err);
	}

}

pub struct Migration {

	conn: Connection,
	pub from: DatabaseVersion

}

impl Migration {

	pub fn new(conn: Connection) -> Migration {

		const QUERY: &str = 
		"
			SELECT 
				major, 
				minor, 
				patch 
			FROM 
				DB_Version
			ORDER BY major DESC, minor DESC, patch DESC
			LIMIT 1;
		";

		let db_v: DatabaseVersion = match conn.prepare(QUERY) {

			Ok(mut stmt) => {

				match stmt.query_row(params![], |row| Ok(get_db_version(row))) {
					Ok(v) => v,
					Err(_) => DatabaseVersion::new(0, 1, 0)
				}

			},
			Err(_) => DatabaseVersion::new(0, 1, 0)

		};

		Migration {
			conn,
			from: db_v
		}

	}

	pub fn insert_game_version(&self) {

		let mut stmt = self.conn.prepare("INSERT INTO DB_Version (major, minor, patch) VALUES (?, ?, ?)").unwrap();

		let game_v = get_app_version();
		stmt.execute(params![game_v.major, game_v.minor, game_v.patch]).unwrap();

	}

	pub fn should_migrate(&self) -> bool {

		let latest_migration = VERSIONS.last().unwrap();
		return self.from < latest_migration.0;

	}

	pub fn migrate(&self) -> Result<(), rusqlite::Error> {

		let migration_list = self.get_migration_list();
		for migration in migration_list {
			self.run_batch(migration)?;
		}
		Ok(())

	}

	fn run_batch(&self, batch: &str) -> Result<(), rusqlite::Error> {

		let mut batch = Batch::new(&self.conn, &batch);

		while let Some(mut stmt) = batch.next().unwrap() {
			stmt.execute([])?;
		}

		Ok(())

	}

	fn get_migration_list(&self) -> Vec<&str> {

		let mut migration_list: Vec<&'static str> = Vec::new();
		for migration in VERSIONS.iter() {

			if self.from < migration.0 {
				migration_list.push(&migration.1);
			}

		}
		migration_list

	}

}

fn get_db_version(row: &Row<'_>) -> DatabaseVersion {

	let major: u16;
	match row.get::<usize, u16>(0) {
		Ok(t_major) => {
			major = t_major;
		},
		Err(_) => {
			panic!("Returned no rows, yet there is no Major version?");
		}
	}

	let minor = row.get(1).unwrap();
	let patch = row.get(2).unwrap();

	DatabaseVersion::new(major, minor, patch)

}

fn get_app_version() -> DatabaseVersion {

	let mut version = VERSION.split(".");
	let major = version.next().unwrap().parse::<u16>().unwrap();
	let minor = version.next().unwrap().parse::<u16>().unwrap();
	let patch = version.next().unwrap().parse::<u16>().unwrap();

	DatabaseVersion::new(major, minor, patch)

}