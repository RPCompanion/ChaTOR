import { expect, test } from 'vitest';
import { add_item_link, apply_item_links, show_item_links } from './item_links';
import { AutoMessageSplitter } from './auto_message_splitter';
import { default_settings } from './network/settings';

const crystal = { label: "[Red Crystal]", markup: "<HL LID=\"BCOAAl1OxGUOPAAABh\">" };
const rifle = { label: "[E-80 Sniper Rifle]", markup: "<HL LID=\"BCOAArCSwgjl3AABFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABh\">" };

test("item_links swap labels for markup and back", () => {

    const links = add_item_link(add_item_link([], crystal), rifle);
    const text = "holds up [Red Crystal] and [E-80 Sniper Rifle], then [Red Crystal] again.";
    const posted = apply_item_links(text, links);
    expect(posted).toBe(`holds up ${crystal.markup} and ${rifle.markup}, then ${crystal.markup} again.`);
    expect(show_item_links(posted, links)).toBe(text);

});

test("item_links newer link with the same label wins", () => {

    const newer = { label: crystal.label, markup: "<HL LID=\"BCOAAl1OxGUOQAAABh\">" };
    expect(add_item_link([crystal], newer)).toEqual([newer]);

});

test("item_links long message splits without breaking markup", () => {

    const sentence = "She turns the [E-80 Sniper Rifle] over in her hands and studies it closely.";
    const input = apply_item_links(Array(6).fill(sentence).join(" "), [rifle]);
    const posts = new AutoMessageSplitter(input, default_settings()).split().unwrap();
    expect(posts.length).toBeGreaterThan(1);
    for (const post of posts) {
        expect(post.length).toBeLessThanOrEqual(255);
        expect(post.startsWith("/e ")).toBe(true);
        expect(post).toContain(rifle.markup);
        expect(post.match(/<HL LID="[^"]+">/g)).toEqual(Array(post.split("<HL").length - 1).fill(rifle.markup));
    }
    expect(posts.join(" ").split(rifle.markup).length - 1).toBe(6);

});
