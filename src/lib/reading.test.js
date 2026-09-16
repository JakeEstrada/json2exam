import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchReading, normalizeReading, resolveReading, formatAskNotes } from './reading.js';

const reading = normalizeReading([
  {
    book: 'Eloquent JavaScript, 4th Edition by Marijn Haverbeke',
    chapter: 'Chapter 3 — Functions',
    page: 74,
    pageEnd: 99,
    sections: [
      { heading: 'Defining a function', page: 75 },
      { heading: 'Closure', page: 86 },
    ],
  },
  {
    book: "You Don't Know JS Yet by Kyle Simpson",
    chapter: 'Chapter 7 — Using Closures',
    page: 149,
    pageEnd: 175,
  },
]);

test('matchReading picks the named book chapter', () => {
  const hit = matchReading(reading, "You Don't Know JS Yet by Kyle Simpson");
  assert.equal(hit.chapter, 'Chapter 7 — Using Closures');
});

test('resolveReading uses the module chapter when the card has no page', () => {
  const hit = resolveReading({ reading, books: [] }, { book: 'Eloquent JavaScript, 4th Edition by Marijn Haverbeke' });
  assert.equal(hit.page, 74);
  assert.equal(hit.pageEnd, 99);
  assert.equal(hit.chapter, 'Chapter 3 — Functions');
});

test('resolveReading jumps to a named section inside the chapter', () => {
  const hit = resolveReading({ reading, books: [] }, {
    book: 'Eloquent JavaScript, 4th Edition by Marijn Haverbeke',
    heading: 'Closure',
  });
  assert.equal(hit.page, 86);
  assert.equal(hit.section, 'Closure');
});

test('formatAskNotes lists the assigned chapter for the tutor', () => {
  const text = formatAskNotes({ reading, notes: 'A function is a value.' });
  assert.match(text, /Chapter 3 — Functions/);
  assert.match(text, /A function is a value/);
  assert.match(text, /cite these chapters/);
});
