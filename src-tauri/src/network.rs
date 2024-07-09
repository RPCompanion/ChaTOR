
use reqwest::Client;

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