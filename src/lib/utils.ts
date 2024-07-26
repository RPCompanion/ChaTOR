
import { toast } from "@zerodevx/svelte-toast";

export function deep_copy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function unicode_escape(str: string): string {

    return str.replace(/[\u00FF-\uFFFF]/g, (chr) => {
        return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).slice(-4);
    });

}

export function unicode_unescape(str: string): string {

    return str.replace(/\\u([\d\w]{4})/gi, (match, grp) => {
        return String.fromCharCode(parseInt(grp, 16));
    });

}

export function get_time_elapsed_since(date: Date): string {

    let now = new Date();
    let elapsed = now.getTime() - date.getTime();
    let seconds = Math.floor(elapsed / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours   = Math.floor(minutes / 60);
    let days    = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} ` + (days === 1 ? "day" : "days") + " ago";
    } else if (hours > 0) {
        return `${hours} ` + (hours === 1 ? "hour" : "hours") + " ago";
    } else if (minutes > 0) {
        return `${minutes} ` + (minutes === 1 ? "minute" : "minutes") + " ago";
    } else {
        return `${seconds} ` + (seconds === 1 ? "second" : "seconds") + " ago";
    }

}

export function toast_error(message: string) {

    toast.push(message, {
        theme: {
            "--toastBarBackground": "red",
            "--toastColor": "#ffffff"
        }
    });

}