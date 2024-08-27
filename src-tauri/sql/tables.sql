
CREATE TABLE IF NOT EXISTS Cache_Jediapedia
(
    cache_jediapedia_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    global_id INTEGER UNIQUE NOT NULL,
    html TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Account
(
    account_id INTEGER UNIQUE,
    account_token BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS Account_Characters
(
    account_character_id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id BLOB UNIQUE NOT NULL,
    template_id INTEGER NOT NULL,
    server_id INTEGER NOT NULL,
    character_sheet TEXT NOT NULL
);

/*
    CustomEmotes.order_index is used to keep track of the order of the emotes. Uniqueness is not enforced and
    favourites and non-favourites may share similar indices.
*/
CREATE TABLE IF NOT EXISTS CustomEmotes
(
    custom_emote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    emote_name VARCHAR(255) UNIQUE NOT NULL,
    emote VARCHAR(255) NOT NULL,
    favourite BOOLEAN NOT NULL DEFAULT(FALSE),
    order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS CustomCategory
(
    custom_category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name VARCHAR(255) UNIQUE NOT NULL  
);

CREATE TABLE IF NOT EXISTS CustomChannel
(
    custom_channel_id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_name VARCHAR(255) UNIQUE NOT NULL,
    channel_number INTEGER UNIQUE NOT NULL
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
    settings_id INTEGER UNIQUE,
    settings TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Characters
(
    character_id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_name VARCHAR(255) UNIQUE NOT NULL,
    CharacterEncounteredDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ChatLog
(
    chat_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_hash INTEGER UNIQUE NOT NULL,
    character_id INTEGER NOT NULL REFERENCES Characters(character_id),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    message VARCHAR(1024) NOT NULL
);

CREATE TABLE IF NOT EXISTS ChatLog_DateTags
(
    chat_log_date_tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATE UNIQUE NOT NULL,
    favourite BOOLEAN NOT NULL DEFAULT(FALSE),
    tags TEXT NOT NULL -- json string array
);

CREATE TABLE IF NOT EXISTS UsersChatLog
(
    my_chat_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_hash INTEGER NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    message VARCHAR(1024) NOT NULL
);

CREATE TABLE IF NOT EXISTS UsersChatLogCharacter
(
    my_chat_log_character_id INTEGER PRIMARY KEY AUTOINCREMENT,
    my_chat_log_id INTEGER NOT NULL REFERENCES UsersChatLog(my_chat_log_id),
    character_id INTEGER NOT NULL REFERENCES Characters(character_id)
);

CREATE TABLE IF NOT EXISTS DB_Version
(
    db_version_id INTEGER PRIMARY KEY AUTOINCREMENT,
    major INTEGER NOT NULL,
    minor INTEGER NOT NULL,
    patch INTEGER NOT NULL,
    UNIQUE(major, minor, patch)
);