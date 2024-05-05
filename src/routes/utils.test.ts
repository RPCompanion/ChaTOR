

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