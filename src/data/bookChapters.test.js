import { test } from 'node:test';
import assert from 'node:assert/strict';
import { APPLIED_COURSES } from './appliedClassroom.js';
import { chaptersForDeck } from './bookChapters.js';
import { resolveReading } from '../lib/reading.js';

const LANGS = ['js', 'ts', 'css', 'html', 'py'];

test('every language lesson has a chapter range past the contents', () => {
  const courses = APPLIED_COURSES.filter((course) => LANGS.includes(course.id));
  assert.equal(courses.length, LANGS.length);
  courses.forEach((course) => {
    const language = (course.modules || []).find((mod) => mod.label === 'Language');
    assert.ok(language, course.id);
    language.decks.forEach((deck) => {
      const chapters = chaptersForDeck(deck.id);
      assert.ok(chapters && chapters.length >= 1, deck.id);
      chapters.forEach((row) => {
        assert.ok(row.chapter, deck.id);
        assert.ok(row.page >= 4, deck.id + ' ' + row.book + ' page ' + row.page);
        assert.ok(row.pageEnd >= row.page, deck.id + ' ' + row.chapter);
      });
    });
  });
});

test('a contents citation for arrays opens the arrays chapter', () => {
  const reading = chaptersForDeck('js-language-arrays');
  const hit = resolveReading({ reading, books: [] }, {
    book: 'Eloquent JavaScript, 4th Edition by Marijn Haverbeke',
    page: 9,
    heading: 'map, filter, reduce',
  });
  assert.equal(hit.chapter, 'Data Structures: Objects and Arrays');
  assert.equal(hit.page, 146);
  assert.equal(hit.scanTo, 149);
});

test('python lists stays inside the lists chapter instead of the whole book', () => {
  const reading = chaptersForDeck('py-language-lists');
  const crash = resolveReading({ reading, books: [] }, {
    book: 'Python Crash Course, 3rd Edition by Eric Matthes',
    page: 103,
    heading: 'Create and index',
  });
  assert.equal(crash.chapter, 'Chapter 3: Introducing Lists');
  assert.equal(crash.page, 103);
  assert.equal(crash.scanFrom, 71);
  assert.equal(crash.scanTo, 108);

  const fluent = resolveReading({ reading, books: [] }, {
    book: 'Fluent Python, 2nd Edition by Luciano Ramalho',
    page: 62,
  });
  assert.equal(fluent.chapter, '2. An Array of Sequences');
  assert.equal(fluent.scanFrom, 55);
  assert.equal(fluent.scanTo, 143);
});

test('an index page is not opened or quoted', () => {
  const reading = chaptersForDeck('ts-language-interfaces');
  const hit = resolveReading({ reading, books: [] }, {
    book: 'Programming TypeScript by Boris Cherny',
    page: 423,
    heading: 'interface versus type',
    excerpt: 'About Types typechecking, The Compiler for Angular templates',
  });
  assert.equal(hit.chapter, '5. Classes and Interfaces');
  assert.equal(hit.page, 129);
  assert.ok(hit.scanTo < 379);
  assert.equal(hit.excerpt, '');
});

test('accessibility does not open the inclusive introduction', () => {
  const reading = chaptersForDeck('html-language-accessibility');
  const hit = resolveReading({ reading, books: [] }, {
    book: 'Inclusive Components by Heydon Pickering',
    page: 4,
    heading: 'Labels',
    excerpt: 'This book, an anthology of updated and expanded blog posts',
  });
  assert.equal(hit.chapter, 'Toggle buttons');
  assert.ok(hit.page >= 8);
  assert.ok(hit.scanFrom >= 8);
  assert.equal(hit.excerpt, '');
});

test('a front-matter citation for flexbox opens the flexbox chapter', () => {
  const reading = chaptersForDeck('css-language-flexbox');
  const hit = resolveReading({ reading, books: [] }, {
    book: 'CSS in Depth, 1st Edition by Keith J. Grant',
    page: 9,
  });
  assert.equal(hit.chapter, 'Flexbox');
  assert.equal(hit.page, 144);
  assert.equal(hit.scanFrom, 144);
  assert.equal(hit.scanTo, 171);
});
