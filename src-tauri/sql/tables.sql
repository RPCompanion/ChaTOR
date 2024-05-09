
CREATE TABLE IF NOT EXISTS CustomEmotes
(
    custom_emote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    emote_name VARCHAR(255) UNIQUE NOT NULL,
    emote VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS CustomCategory
(
    custom_category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name VARCHAR(255) UNIQUE NOT NULL  
);

CREATE TABLE IF NOT EXISTS CustomEmoteCategory
(
    custom_emote_category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    custom_emote_id INTEGER NOT NULL,
    custom_category_id INTEGER NOT NULL,
    FOREIGN KEY(custom_emote_id) REFERENCES CustomEmotes(custom_emote_id),
    FOREIGN KEY(custom_category_id) REFERENCES CustomCategory(custom_category_id),
    UNIQUE(custom_emote_id, custom_category_id)
);

CREATE TABLE IF NOT EXISTS Settings
(
    settings_id INTEGER PRIMARY KEY AUTOINCREMENT,
    settings TEXT VARCHAR NOT NULL,
    CHECK(settings_id = 1)
);