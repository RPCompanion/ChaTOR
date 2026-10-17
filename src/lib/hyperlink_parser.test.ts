
import { expect, test } from 'vitest';
import { parse_hyperlink } from './hyperlink_parser';

test("hyperlink_parser jediapedia item case", () => {

    const hyperlink = "<HL LID=\"BCOAAH4USuPv2AABDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABh\">";
    const expected = { 
        ok: {
            type: "item",
            id: 16140935720901082102n,
            augmented: 0n,
            mods: [
                { id: 0n, modifier: 0n, unknown: 0n },
                { id: 0n, modifier: 0n, unknown: 0n },
                { id: 0n, modifier: 0n, unknown: 0n }
            ],
            final33: 33n
        }
    };
    expect(parse_hyperlink(hyperlink).unwrap()).toEqual(expected.ok);

});

test("hyerlink_parser jediapedia quest case", () => {

    const hyperlink ="<HL LID=\"BEOAA22D9JUA6BBBC\">"
    const expected = {
        ok: {
            type: "quest",
            id: 16141142274106277946n,
            const1: 1n,
            quest_step: 2n
        }
    }
    expect(parse_hyperlink(hyperlink).unwrap()).toEqual(expected.ok);

});

test("hyperlink_parser jediapedia url case", () => {

    const hyperlink = "<HL LID=\"BFBO\">";
    const expected = {
        ok: {
            type: "url",
            index: 14n
        }
    }
    expect(parse_hyperlink(hyperlink).unwrap()).toEqual(expected.ok);

})

test("hyperlink_parser jediapedia achievement case", () => {

    const hyperlink = "<HL LID=\"BGOAAnjVWnHwcBHExampleBBIC+A12345BBBBBBBB\">";
    const expected = {
        ok: {
            type: "achievement",
            id: 16141075016419408924n,
            character: "Example",
            completed: new Date("2014-10-12T16:15:56.985Z"),
            objectives: [1n, 1n, 1n, 1n]
        }
    }
    expect(parse_hyperlink(hyperlink).unwrap()).toEqual(expected.ok);

})

test("hyperlink_parser jediapedia guild case", () => {

    const hyperlink = "<HL LID=\"BIEAAAxI0VniaBQThe Old Republic\">";
    const expected = {
        ok: {
            type: "guild",
            id: 4611689395149764762n,
            name: "The Old Republic"
        }
    }
    expect(parse_hyperlink(hyperlink).unwrap()).toEqual(expected.ok);

});