

export interface INavbarSectionElement {
    name: string;
    link: string;
}

export interface INavbarSection {
    name: string;
    link?: string;
    elements?: INavbarSectionElement[];
}