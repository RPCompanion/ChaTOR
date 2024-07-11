
import { writable, get } from "svelte/store";
import { invoke } from "@tauri-apps/api";
import { toast } from "@zerodevx/svelte-toast";
import { hooked_in } from "../network";
import { ESwtorChannel } from "./swtor_channel";
import { set_initial_swtor_channels } from "./swtor_message/swtor_chat_tab_messages";

export type ChannelDispatcher =
    | { RegularDispatch: number }
    | { CustomDispatch: string };

export interface IChatTab {
    name: string;
    channels: ChannelDispatcher[];
    default_channel?: ChannelDispatcher;
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
    show_chat_log_window: boolean;
    chat_tabs: IChatTab[];
    window: IWidthHeight;
}

export interface IChatLogSettings {
    capture_chat_log: boolean;
    log_global_chat: boolean;
    retry_message_submission: boolean;
    character_ini_to_pull_from?: string;
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

type CaptureError = "AlreadyInjected" | "SwtorNotRunning" | "WrongGuiSettings" | "UnsupportedVersion" | "NotYetFullyReady";

export function default_settings(): ISettings {

    return {

        app: {
            window: {
                width: 800,
                height: 600
            },
            show_window_decorations: false,
            opacity: 100,
            always_on_top: false,
            show_background_image: false,
            show_page_header: true
        },
        chat: {
            confirmation_before_posting: true,
            enter_to_post: false,
            enter_to_confirm: false,
            clear_chat_after_posting: false,
            remove_starting_pronouns: false,
            starting_characters_are_lowercase: true,
            show_favourite_emotes: true
        },
        chat_log: {
            capture_chat_log: false,
            log_global_chat: false,
            retry_message_submission: false,
            character_ini_to_pull_from: undefined,
            window: {
                show_chat_log_window: false,
                chat_tabs: [
                    {
                        name: "Global",
                        channels: [
                            { RegularDispatch: ESwtorChannel.GLOBAL},
                            { RegularDispatch: ESwtorChannel.PVP },
                            { RegularDispatch: ESwtorChannel.TRADE }
                        ],
                        default_channel: { RegularDispatch: ESwtorChannel.GLOBAL } 
                    },
                    {
                        name: "Local",
                        channels: [
                            { RegularDispatch: ESwtorChannel.EMOTE},
                            { RegularDispatch: ESwtorChannel.SAY},
                            { RegularDispatch: ESwtorChannel.YELL},
                            { RegularDispatch: ESwtorChannel.WHISPER}
                        ],
                        default_channel: undefined
                    }
                ],
                window: {
                    width: 0,
                    height: 176
                }
            }
        }

    }

}

export const settings = writable<ISettings>(default_settings());
export const chat_log_active = writable<boolean>(false);

export function init_settings(dependent_callback: () => void) {

    invoke("get_settings").then((response: any) => {

        settings.set(response);
        settings.subscribe((value) => {
            invoke("update_settings", {settings: value});
        });

        set_initial_swtor_channels();
        chat_log_subscriber();
        dependent_callback();

    });

}

function chat_log_subscriber() {

    init_injecting_capture();
    init_hooking_subscriber();

}

function init_injecting_capture() {

    let shown_unsupported_version = false;

    let handle_capture_error = (e: CaptureError) => {
        
        if (e == "UnsupportedVersion") {

            if (!shown_unsupported_version) {
                toast.push("Unsupported version of SWTOR detected. Chat log capture will not work.");
                shown_unsupported_version = true;
            }

        } else if (e == "AlreadyInjected") {

            chat_log_active.set(true);

        } else if (e != "NotYetFullyReady") {

            toast.push("Failed to start chat log capture: " + e);
            
        }

    }

    settings.subscribe((value) => {

        let t_chat_log_active = get(chat_log_active);
        let t_hooked_in       = get(hooked_in);
        if (value.chat_log.capture_chat_log && !t_chat_log_active && t_hooked_in) {

            invoke("start_injecting_capture").then(() => {
                    chat_log_active.set(true);
                    toast.push("Chat logging active");
                })
                .catch(handle_capture_error);

        } else if ((!value.chat_log.capture_chat_log && t_chat_log_active) || !t_hooked_in) {

            invoke("stop_injecting_capture");
            chat_log_active.set(false);

        }

    });

}

function init_hooking_subscriber() {

    hooked_in.subscribe((t_hooked_in) => {

        let t_chat_log_active = get(chat_log_active);
        let t_settings = get(settings);
        
        if (t_hooked_in && t_chat_log_active) { 
            return;
        } else if (t_hooked_in && !t_chat_log_active && t_settings.chat_log.capture_chat_log) {
            invoke("start_injecting_capture").catch(() => {});
        } else if (!t_hooked_in && t_chat_log_active) {
            invoke("stop_injecting_capture").catch(() => {});
            chat_log_active.set(false);
        }

    });

}