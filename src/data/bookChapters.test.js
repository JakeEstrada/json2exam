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
