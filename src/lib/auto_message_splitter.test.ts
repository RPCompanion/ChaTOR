


import { expect, test } from 'vitest';
import { AutoMessageSplitter } from './auto_message_splitter';
import { default_settings } from './network/settings';

// Context, this splits on sentences, so it should split on periods, exclamation points, question marks and quotes.

test("auto_message_split simple string", () => {

    const input  = "Hello, my name is Liza.";
    let expected = { ok: ["/e Hello, my name is Liza."], error: null }

    let splitter = new AutoMessageSplitter(input, default_settings());

    expect(splitter.split()).toEqual(expected);

})

test("auto_message_split long string", () => {

    const input  = "Hello, my name is Liza. I am a software engineer.";
    let expected = { ok: ["/e Hello, my name is Liza. I am a software engineer."], error: null }

    let splitter = new AutoMessageSplitter(input, default_settings());

    expect(splitter.split()).toEqual(expected)

})

test("auto_message_split long string with quotes", () => {

    const input  = "\"Hello, my name is Liza.\" she said.";
    let expected = { ok: ["/say \"Hello, my name is Liza.\" she said."], error: null }

    let splitter = new AutoMessageSplitter(input, default_settings());
    expect(splitter.split()).toEqual(expected)

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

    let splitter = new AutoMessageSplitter(input, default_settings());

    expect(splitter.split()).toEqual(expected);

});

test("auto_message_split ellipsis", () => {

    const input = `
        made a face like she really didn't want to answer that particular question. "Well ... I'm getting assigned to a new post. At least that's the word coming from up top. No idea where I'm off to next, but I do know that I'm not going to have an immediate C.O" she stated. "Instead ..." she gazed off into the distance. "I'll be directly reporting to a Sith."
    `;

    const expected = {
        ok: [
            "/e made a face like she really didn't want to answer that particular question.",
            `/say "Well ... I'm getting assigned to a new post. At least that's the word coming from up top. No idea where I'm off to next, but I do know that I'm not going to have an immediate C.O" she stated. "Instead ..." she gazed off into the distance.`,
            `/say "I'll be directly reporting to a Sith."`
        ],
        error: null
    }

    let splitter = new AutoMessageSplitter(input, default_settings());
    expect(splitter.split()).toEqual(expected);

})

test("auto_message_split multiple question marks in a quote", () => {

    /*
        Might be a little too complicated to capture.
    */
    const input = `
        /e had a faint smile grace her lips, a fleeting acknowledgement of the Sith's words that hinted at a measure of approval. 
        Though she refrained from voicing her thoughts on the matter, there was a sense that she found him to be a 'good Sith,' or at least as close to one as the Empire would allow. 
        Straightening her posture, Elizala met his gaze, her brows furrowing slightly as a question formed on her tongue. 
        "If I may inquire, my lord," she began, "who will serve as my commanding officer in this new role? Or shall I be reporting to you?"
    `;

    const expected = {
        ok: [
            "/e had a faint smile grace her lips, a fleeting acknowledgement of the Sith's words that hinted at a measure of approval.",
            "/e Though she refrained from voicing her thoughts on the matter, there was a sense that she found him to be a 'good Sith,' or at least as close to one as the Empire would allow.",
            `/e Straightening her posture, Elizala met his gaze, her brows furrowing slightly as a question formed on her tongue. "If I may inquire, my lord," she began, "who will serve as my commanding officer in this new role? Or shall I be reporting to you?"`
        ],
        error: null
    }

    let splitter = new AutoMessageSplitter(input, default_settings());
    expect(splitter.split()).toEqual(expected);

})