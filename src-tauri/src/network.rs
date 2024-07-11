
use scraper::{Html, Selector};
use reqwest::Client;
use reqwest::blocking::Client as BlockingClient;

use base64::prelude::{Engine as _, BASE64_STANDARD};

use crate::dal::db::cache::CacheJediapedia;

#[tauri::command]
pub async fn fetch_content(url: String) -> Result<String, &'static str> {

    let client = Client::new();
    let response = client.get(&url).send().await;

    match response {

        Ok(response) => {

            match response.text().await {
                Ok(text) => Ok(text),
                Err(_) => Err("Error reading response text")
            }

        },
        Err(_) => Err("Error fetching content")

    }

}

pub fn fetch_content_blocking(url: String) -> Result<Vec<u8>, &'static str> {

    let client = BlockingClient::new();
    let response = client.get(&url).send();

    match response {

        Ok(response) => {

            match response.bytes() {
                Ok(text) => Ok(text.to_vec()),
                Err(_) => Err("Error reading response text")
            }

        },
        Err(_) => Err("Error fetching content")

    }

}

/// Fetches the content of a Jediapedia page if not already cached
#[tauri::command]
pub async fn fetch_jediapedia_content(global_id: String, url: String) -> Result<String, &'static str> {

    let global_id: u64 = global_id.parse().unwrap();
    if let Some(content) = CacheJediapedia::new(global_id).get() {
        return Ok(content);
    }

    tokio::task::spawn_blocking(move || {

        let content = String::from_utf8(fetch_content_blocking(url)?).unwrap();
        let content = parse_content(content)?;
        CacheJediapedia::new(global_id).save(&content);
        Ok(content)

    }).await.unwrap()


}

fn parse_content(content: String) -> Result<String, &'static str> {

    let doc = Html::parse_document(&content);

    let sect = doc.select(&Selector::parse(r#"section[class="con-inv"]"#).unwrap())
        .next()
        .ok_or("Error selecting section")?;

    let mut fragment    = sect.html();
    let image_container = sect.select(&Selector::parse("div").unwrap())
        .nth(0)
        .ok_or("Error selecting div")?;

    let img_selector = Selector::parse("img").unwrap();
    for image in image_container.select(&img_selector) {

        let src = image.value().attr("src").ok_or("Error getting src")?;
        let image_bytes = fetch_content_blocking(format!("https:{}", src))?;
        let base_64 = format!("data:image/png;base64,{}", BASE64_STANDARD.encode(&image_bytes));
        fragment = fragment.replace(&src, &base_64);

    }

    Ok(fragment)

}