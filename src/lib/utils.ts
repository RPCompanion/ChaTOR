
export function deep_copy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function unicode_escape(str: string): string {

    return str.replace(/[\u007F-\uFFFF]/g, (chr) => {
        return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).slice(-4);
    });

}

export function unicode_unescape(str: string): string {

    return str.replace(/\\u([\d\w]{4})/gi, (match, grp) => {
        return String.fromCharCode(parseInt(grp, 16));
    });

}