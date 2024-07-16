# SWTOR-Chat

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

A third-party chat client for Star Wars: The Old Republic. Designed and tested by the roleplay community.

> [!WARNING]
> This software is presently in alpha and is subject to change until stabilized.

## Current features

- Chat notifications
- Chat Logging (Disabled by default)
- Auto formatting of posts longer than 255 characters
    - Manual formatting available. Up to 5 posts at a time, up to 1275 characters.
    - If chat logging is enabled, dynamically set your default channel per chat tab.
- Save custom emotes for future use.
    - Mark certain emotes as favorites and have them appear directly on the chat page
    - Press a button to activate them.
- View roleplay beacons from both the Star Forge RP Server and our own [discord](https://discord.gg/TwfBK94ree)
- Chat log viewer to revisit past scenes (If chat logging is enabled)
    - Export scenes to a .txt file
    - Mark specific days as favorites for easier navigation

## Planned Features

- Clan recruitment posts
- Character sheet integration
- Dice Rolling

## Building this software

### Build Environment

- [node.js](https://nodejs.org/en) v18.0+
- [rust](https://www.rust-lang.org/) nightly compiler

### Run steps


1. Install local npm packages ```npm i```
2. Use npm to start the app ```npm run tauri dev```

### Build steps

1. Install local npm packages if not already
2. Run build command ```npm run tauri build```

ChaTOR.exe will be located in ```src-tauri/target/release```

## Interested in the project?

Consider joining our [discord](https://discord.gg/TwfBK94ree)

## Contributing

Before you make a pull request, please open an issue or discussion. All contributions are to be licensed under the AGPLv3.

