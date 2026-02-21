export interface INavbarSectionElement {
    name: string;
    link: string;
}

export interface INavbarSection {
    name: string;
    link?: string;
    elements?: INavbarSectionElement[];
}

interface NavbarCallback {
    unique_id: string;
    callback: () => void;
}

let navbar_callbacks: NavbarCallback[] = [];

export function add_navbar_callback(unique_id: string, callback: () => void) {
    const idx = navbar_callbacks.findIndex((element) => element.unique_id === unique_id);
    if (idx !== -1) {
        navbar_callbacks[idx].callback = callback;
    } else {
        navbar_callbacks.push({ unique_id, callback });
    }
}

export function trigger_navbar_callbacks(skip: string = "") {
    navbar_callbacks.filter((c) => c.unique_id !== skip).forEach((element) => element.callback());
}
