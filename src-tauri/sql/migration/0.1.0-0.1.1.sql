CREATE TABLE CustomEmotes_new
(
    custom_emote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    emote_name VARCHAR(255) UNIQUE NOT NULL,
    emote VARCHAR(255) NOT NULL,
    favourite BOOLEAN NOT NULL DEFAULT(FALSE),
    order_index INTEGER NOT NULL
);

INSERT INTO CustomEmotes_new(custom_emote_id, emote_name, emote, order_index)
SELECT custom_emote_id, emote_name, emote, custom_emote_id
FROM CustomEmotes;

DROP TABLE CustomEmotes;

ALTER TABLE CustomEmotes_new RENAME TO CustomEmotes;

INSERT INTO DB_Version (major, minor, patch)
VALUES (0, 1, 1);