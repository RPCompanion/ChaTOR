# SWTOR-Chat

A third-party chat client for Star Wars: The Old Republic. 

> [!WARNING]
> This software is presently in alpha and is subject to change rapidly until stabilized.

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

## Interested in the project?

Consider joining our [discord](https://discord.gg/TwfBK94ree)

## Contributing

Before you make a pull request, please consider opening an issue or discussion. We want to ensure that the change aligns with the project's direction, or that specific technical details are covered.
All contributions are to be licensed under the AGPLv3

## Building this software

### Build Environment

- [Node](https://nodejs.org/en) v18.0+
- [rust](https://www.rust-lang.org/) nightly compiler

### Run steps

Assuming you've set up node.js and the rust nightly compiler, use the following steps to run the software

Install local npm packages
```sh
npm i
```

Use npm to start the tauri app
```sh
npm run tauri dev
```

### Build steps

Assuming you've installed the local npm packages (if not, see Run steps)

```sh
npm run tauri build
```

## Project License

Licensed under the AGPLv3
