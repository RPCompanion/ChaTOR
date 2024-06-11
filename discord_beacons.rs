
use serde::Serialize;
use chrono::prelude::*;

use actix_web::{get, HttpResponse, Responder};
use web_base::db;
use web_base::api::GenericAPIError;

#[derive(Serialize)]
pub struct StarForgeBeacon {
    avatar_url: Option<String>,
    name: String,
    global_name: Option<String>,
    create_time: String,
    message: String,
    attachments: Vec<String>,
}

#[get("/star_forge")]
pub async fn star_forge() -> impl Responder {
    
    let beacons = match get_star_forge_beacons().await {
        Ok(beacons) => beacons,
        Err(e) => return HttpResponse::InternalServerError().body(GenericAPIError::new(e).as_json()),
    };

    HttpResponse::Ok()
        .body(serde_json::to_string(&beacons).unwrap())

}

async fn get_star_forge_beacons() -> Result<Vec<StarForgeBeacon>, &'static str> {

    const GET_STAR_FORGE_BEACONS: &str =
    "
        SELECT
            sfd.avatar_url,
            sfd.name,
            sfd.global_name,
            sfb.create_time,
            sfb.message,
            sfb.attachments
        FROM
            third_party.star_forge_beacons as sfb
        INNER JOIN third_party.star_forge_discord_users as sfd
            ON sfb.star_forge_discord_user_id = sfd.star_forge_discord_user_id
        ORDER BY sfb.star_forge_beacon_id DESC
        LIMIT 10;
    ";

    let client = db::get_async_connection(None)
        .await
        .map_err(|_| "Unable to fetch beacons at this time")?;

    let mut beacons = Vec::new();
    for row in client.query(GET_STAR_FORGE_BEACONS, &[]).await.unwrap() {

        let create_time = row.get::<usize, DateTime<Utc>>(3);
        beacons.push(StarForgeBeacon {
            avatar_url: row.get(0),
            name: row.get(1),
            global_name: row.get(2),
            create_time: create_time.to_rfc3339(),
            message: row.get(4),
            attachments: row.get(5),
        });

    }

    Ok(beacons)

}