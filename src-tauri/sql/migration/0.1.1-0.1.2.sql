CREATE TABLE IF NOT EXISTS DiceRollLog
(
    dice_roll_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    roll_hash INTEGER UNIQUE NOT NULL,
    character_id INTEGER NOT NULL REFERENCES Characters(character_id),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    result_text VARCHAR(255) NOT NULL
);

INSERT INTO DB_Version (major, minor, patch)
VALUES (0, 1, 2);
