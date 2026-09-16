import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogTotals, courseRollup, deckStats, emptyLog, logTotals, mergeLog, withDeck } from './learningLog.js';

test('deckStats counts mastered cards from Leitner boxes', () => {
  const quiz = { questions: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] };
  const out = deckStats(quiz, { a: 3, b: 1 }, { right: 4, wrong: 1 }, 3);
  assert.equal(out.total, 3);
  assert.equal(out.mastered, 1);
  assert.equal(out.seen, 2);
  assert.equal(out.pct, 33);
  assert.equal(out.done, false);
});

test('withDeck writes the active module onto the public log', () => {
  const quiz = { questions: [{ id: 'a' }, { id: 'b' }], title: 'Loops' };
  const log = withDeck(emptyLog(), {
    courseId: 'js',
    courseTitle: 'JavaScript',
    deckId: 'js-language-loops',
    deckLabel: 'Loops',
  }, quiz, { a: 3, b: 3 }, { right: 2, wrong: 0 }, 3);
  assert.equal(log.workingOn.deckLabel, 'Loops');
  assert.equal(log.decks['js-language-loops'].done, true);
  assert.equal(log.decks['js-language-loops'].pct, 100);
});

test('mergeLog keeps earlier decks when a new one is patched', () => {
  const first = mergeLog(emptyLog(), { decks: { a: { label: 'A', mastered: 1 } } });
  const next = mergeLog(first, { decks: { b: { label: 'B', mastered: 2 } } });
  assert.equal(next.decks.a.label, 'A');
  assert.equal(next.decks.b.mastered, 2);
});

test('courseRollup uses saved mastery against ready decks', () => {
  const course = {
    modules: [{
      decks: [
        { id: 'one', data: { questions: [1, 2] } },
        { id: 'two', data: { questions: [1] } },
        { id: 'later', data: { questions: [] } },
      ],
    }],
  };
  const log = { decks: { one: { total: 2, mastered: 2 } } };
  const out = courseRollup(course, log);
  assert.equal(out.ready, 2);
  assert.equal(out.mastered, 2);
  assert.equal(out.total, 3);
  assert.equal(out.pct, 67);
});

test('logTotals sums seen cards across started decks', () => {
  const out = logTotals({
    decks: {
      a: { total: 10, mastered: 2, seen: 6 },
      b: { total: 10, mastered: 0, seen: 4 },
    },
  });
  assert.equal(out.total, 20);
  assert.equal(out.seen, 10);
  assert.equal(out.seenPct, 50);
  assert.equal(out.pct, 10);
});

test('catalogTotals scores seen cards against every ready question', () => {
  const courses = [{
    modules: [{
      decks: [
        { id: 'one', data: { questions: [1, 2, 3, 4] } },
        { id: 'two', data: { questions: [1, 2] } },
      ],
    }],
  }];
  const out = catalogTotals(courses, { decks: { one: { total: 4, seen: 2, mastered: 1 } } });
  assert.equal(out.total, 6);
  assert.equal(out.seen, 2);
  assert.equal(out.seenPct, 33);
});
