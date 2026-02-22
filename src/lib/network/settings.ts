import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";
import { useAppStore } from "../../store/useAppStore";
import { set_initial_swtor_channels } from "./swtor_message/swtor_chat_tab_messages";
import { init_active_local_character } from "./local_characters";
import default_settings_obj from "./default_settings.json";

export type ChannelDispatcher =
    | { RegularDispatch: number }
    | { CustomDispatch: string };

export interface IChannelColors {
    say: IColor,
    global: IColor,
    pvp: IColor,
    trade: IColor,
    yell: IColor,
    emote: IColor,
    whisper: IColor,
    group: IColor,
    guild: IColor,
    ops: IColor,
    ops_leader: IColor
}

export interface IChatTab {
    name: string;
    channels: ChannelDispatcher[];
    default_channel: ChannelDispatcher | null;
}

export interface IChatSettings {
    confirmation_before_posting: boolean;
    enter_to_post: boolean;
    enter_to_confirm: boolean;
    clear_chat_after_posting: boolean;
    remove_starting_pronouns: boolean;
    starting_characters_are_lowercase: boolean;
    show_favourite_emotes: boolean;
}

export interface IChatLogWindow {
    prefetch_hyperlinks: boolean;
    show_chat_log_window: boolean;
    chat_tabs: IChatTab[];
    window: IWidthHeight;
    channel_colors: IChannelColors;
}

export interface IChatLogSettings {
    capture_chat_log: boolean;
    log_global_chat: boolean;
    retry_message_submission: boolean;
    character_ini_to_pull_from: string | null;
    window: IChatLogWindow;
}

export interface IWidthHeight {
    width: number;
    height: number;
}

export interface IAppSettings {
    window: IWidthHeight;
    show_window_decorations: boolean;
    opacity: number;
    always_on_top: boolean;
    show_background_image: boolean;
    show_page_header: boolean;
}

export interface ISettings {
    app: IAppSettings;
    chat: IChatSettings;
    chat_log: IChatLogSettings;
}

// Re-export IColor for convenience
export type { IColor } from "./local_characters";

type CaptureError = "AlreadyInjected" | "SwtorNotRunning" | "WrongGuiSettings" | "UnsupportedVersion" | "NotYetFullyReady";

export function default_settings(): ISettings {
    return default_settings_obj as ISettings;
}

export async function init_settings(dependent_callback: () => void): Promise<() => void> {
    const settings = await invoke("get_settings") as ISettings;
    const store = useAppStore.getState();
    store.setSettings(settings);

    set_initial_swtor_channels();
    dependent_callback();

    // Subscribe to settings changes and sync to Tauri
    const unsub = useAppStore.subscribe(
        (state) => state.settings,
        (settings) => {
            invoke("update_settings", { settings });
        }
    );

    return unsub;
}

export function setup_chat_log_subscriber(): () => void {
    let shown_unsupported_version = false;

    const handle_capture_error = (e: CaptureError) => {
        if (e === "UnsupportedVersion") {
            if (!shown_unsupported_version) {
                toast.error("Unsupported version of SWTOR detected. Chat log capture will not work.");
                shown_unsupported_version = true;
            }
        } else if (e === "AlreadyInjected") {
            useAppStore.getState().setChatLogActive(true);
        } else if (e !== "NotYetFullyReady") {
            toast.error("Failed to start chat log capture: " + e);
        }
    };

    const unsub_settings = useAppStore.subscribe(
        (state) => ({ settings: state.settings, chatLogActive: state.chatLogActive, hookedIn: state.hookedIn }),
        ({ settings, chatLogActive, hookedIn }) => {
            if (settings.chat_log.capture_chat_log && !chatLogActive && hookedIn) {
                invoke("start_injecting_capture")
                    .then(() => {
                        useAppStore.getState().setChatLogActive(true);
                        toast.success("Chat logging active");
                    })
                    .catch(handle_capture_error as any);
            } else if ((!settings.chat_log.capture_chat_log && chatLogActive) || !hookedIn) {
                invoke("stop_injecting_capture");
                useAppStore.getState().setChatLogActive(false);
            }
        },
        { equalityFn: (a, b) =>
            a.settings.chat_log.capture_chat_log === b.settings.chat_log.capture_chat_log &&
            a.chatLogActive === b.chatLogActive &&
            a.hookedIn === b.hookedIn
        }
    );

    const unsub_hooked = useAppStore.subscribe(
        (state) => state.hookedIn,
        (hookedIn) => {
            const { chatLogActive, settings } = useAppStore.getState();
            if (hookedIn && chatLogActive) {
                return;
            } else if (hookedIn && !chatLogActive && settings.chat_log.capture_chat_log) {
                invoke("start_injecting_capture").catch(() => {});
            } else if (!hookedIn && chatLogActive) {
                invoke("stop_injecting_capture").catch(() => {});
                useAppStore.getState().setChatLogActive(false);
            }
        }
    );

    return () => {
        unsub_settings();
        unsub_hooked();
    };
}
