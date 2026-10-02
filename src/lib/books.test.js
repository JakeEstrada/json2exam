import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookKey, findBook, resolveBook } from './books.js';

const books = [
  { title: 'Eloquent JavaScript, 4th Edition by Marijn Haverbeke', file: 'Eloquent JavaScript, 4th Edition by Marijn Haverbeke.pdf', url: '/ejs.pdf' },
  { title: "You Don't Know JS Yet: Scope & Closures, 2nd Edition by Kyle Simpson", file: "You Don't Know JS Yet: Scope & Closures, 2nd Edition by Kyle Simpson.pdf", url: '/ydkjs.pdf' },
  { title: 'JavaScript: The Definitive Guide, 7th Edition by David Flanagan', file: 'JavaScript: The Definitive Guide, 7th Edition by David Flanagan.pdf', url: '/dg.pdf' },
];

test('findBook matches an exact source-index title', () => {
  const hit = findBook(books, 'Eloquent JavaScript, 4th Edition by Marijn Haverbeke');
  assert.equal(hit.url, '/ejs.pdf');
});

test('findBook matches a shorter series title to the local PDF', () => {
  const hit = findBook(books, "You Don't Know JS Yet by Kyle Simpson");
  assert.equal(hit.url, '/ydkjs.pdf');
});

test('findBook does not fall back to the first PDF', () => {
  const hit = findBook(books, 'JavaScript: The Definitive Guide, 7th Edition by David Flanagan');
  assert.equal(hit.url, '/dg.pdf');
  assert.equal(findBook(books, 'Learning SQL, 3rd Edition by Alan Beaulieu'), null);
});

test('resolveBook reports a missing title instead of using another file', () => {
  assert.equal(resolveBook({ books }, 'A book that is not here'), null);
  assert.equal(resolveBook({ books: [books[0]] }, '').url, '/ejs.pdf');
});

test('bookKey strips punctuation so titles compare cleanly', () => {
  assert.equal(bookKey("You Don't Know JS Yet"), 'you dont know js yet');
});

test('findBook matches a course PDF when the citation omits the author', () => {
  const python = [
    { title: 'Python Crash Course, 3rd Edition by Eric Matthes', file: 'Python Crash Course, 3rd Edition -Eric Matthes.pdf', url: '/pcc.pdf' },
    { title: 'Fluent Python, 2nd Edition by Luciano Ramalho', file: 'Fluent Python, 2nd Edition - Luciano Ramalho.pdf', url: '/fp.pdf' },
  ];
  assert.equal(findBook(python, 'Python Crash Course').url, '/pcc.pdf');
  assert.equal(findBook(python, 'Fluent Python, 2nd Edition').url, '/fp.pdf');
});
