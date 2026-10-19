/// Item links added from ItemSearch. The composer shows `label` ("[Name]"); what is posted
/// carries `markup` (`<HL LID="...">`), which the game turns into a clickable link.
export interface ItemLink {
    label: string;
    markup: string;
}

/// Replaces every link's label in `text` with its markup.
export function apply_item_links(text: string, links: ItemLink[]): string {
    return links.reduce((t, link) => t.split(link.label).join(link.markup), text);
}

/// The reverse of apply_item_links, for showing posts to the user.
export function show_item_links(text: string, links: ItemLink[]): string {
    return links.reduce((t, link) => t.split(link.markup).join(link.label), text);
}

/// `links` with `link` added; a newer link with the same label replaces the older one.
export function add_item_link(links: ItemLink[], link: ItemLink): ItemLink[] {
    return [...links.filter((l) => l.label !== link.label), link];
}
