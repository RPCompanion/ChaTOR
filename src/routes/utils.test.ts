

import { expect, test } from 'vitest';
import { auto_message_split } from './utils';

// Context, this splits on sentences, so it should split on periods, exclamation points, question marks and quotes.

test("auto_message_split simple string", () => {

    let expected = { ok: ["Hello, my name is Liza."], error: null }
    expect(auto_message_split("Hello, my name is Liza.")).toEqual(expected);

})

test("auto_message_split long string", () => {

    let expected = { ok: ["Hello, my name is Liza. I am a software engineer."], error: null }
    expect(auto_message_split("Hello, my name is Liza. I am a software engineer.")).toEqual(expected)

})

test("auto_message_split long string with quotes", () => {

    let expected = { ok: ["\"Hello, my name is Liza.\" she said."], error: null }
    expect(auto_message_split("\"Hello, my name is Liza.\" she said.")).toEqual(expected)

})

test("auto_message_split single paragraph string", () => {

    const input = `
        The sun was setting over the city skyline, casting a warm golden glow across the bustling streets. 
        People hurried about their evening routines, some heading home from work, others meeting friends for dinner or drinks. 
        Amidst the chaos, a street musician played a gentle melody on his guitar, his soulful voice rising above the din of traffic. 
        A young couple stopped to listen, hand in hand, lost in the moment. 
        The aroma of freshly baked bread wafted from a nearby bakery, mingling with the scent of blooming flowers from the corner florist. 
        It was a perfect snapshot of urban life, a reminder of the beauty and vibrancy that could be found in even the most ordinary of moments.
    `;

    // pronouns get removed automatically at the start of each sentence
    const expected = {
        ok: [
            "/e The sun was setting over the city skyline, casting a warm golden glow across the bustling streets. People hurried about their evening routines, some heading home from work, others meeting friends for dinner or drinks.",
            "/e Amidst the chaos, a street musician played a gentle melody on his guitar, his soulful voice rising above the din of traffic. A young couple stopped to listen, hand in hand, lost in the moment.",
            "/e The aroma of freshly baked bread wafted from a nearby bakery, mingling with the scent of blooming flowers from the corner florist.", 
            "/e was a perfect snapshot of urban life, a reminder of the beauty and vibrancy that could be found in even the most ordinary of moments."
        ],
        error: null
    };

    let result = auto_message_split(input);
    expect(result).toEqual(expected);

});