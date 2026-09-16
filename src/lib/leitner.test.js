import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickNext } from './leitner.js';

test('pickNext keeps 541-style random when every card is level 1', () => {
  const questions = [
    { id: 'a', level: 1, index: 0 },
    { id: 'b', level: 1, index: 1 },
  ];
  const seen = new Set();
  for (let i = 0; i < 40; i++) seen.add(pickNext(questions, {}, 3, null).id);
  assert.equal(seen.size, 2);
});

test('pickNext deals basics in file order before traps and code', () => {
  const questions = [
    { id: 'shape', level: 1, index: 0 },
    { id: 'trap', level: 3, index: 1 },
    { id: 'code', level: 3, index: 2 },
    { id: 'for-loop', level: 1, index: 3 },
  ];
  const first = pickNext(questions, {}, 3, null);
  const second = pickNext(questions, {}, 3, first.id);
  assert.equal(first.id, 'shape');
  assert.equal(second.id, 'for-loop');
});
