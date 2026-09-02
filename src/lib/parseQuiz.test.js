import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeQuiz } from './parseQuiz.js';

const one = (raw) => normalizeQuiz([raw], 't').questions[0];

test('strips "a)" style option labels and resolves a letter answer', () => {
  const q = one({ question: 'Protocol?', options: ['a) HTTP', 'b) FTP'], answer: 'b' });
  assert.deepEqual(q.options, ['HTTP', 'FTP']);
  assert.deepEqual(q.answers, [1]);
  assert.equal(q.type, 'single');
});

test('infers true/false from a bare boolean answer', () => {
  const q = one({ question: 'Sky is blue.', answer: true });
  assert.equal(q.type, 'boolean');
  assert.deepEqual(q.options, ['True', 'False']);
  assert.deepEqual(q.answers, [0]);
});

test('infers multi from an array answer', () => {
  const q = one({ question: 'Pick two', options: ['A', 'B', 'C'], answer: ['a', 'c'] });
  assert.equal(q.type, 'multi');
  assert.deepEqual(q.answers, [0, 2]);
});

test('accepts option text, 0-based index, and 1-based index', () => {
  assert.deepEqual(one({ question: 'q', options: ['w', 'x'], answer: 'x' }).answers, [1]);
  assert.deepEqual(one({ question: 'q', options: ['w', 'x', 'y', 'z'], answer: 0 }).answers, [0]);
  assert.deepEqual(one({ question: 'q', options: ['w', 'x', 'y', 'z'], answer: 4 }).answers, [3]);
});

test('skips broken questions instead of dropping the whole file', () => {
  const bank = normalizeQuiz([
    { question: 'no answer', options: ['a', 'b'] },
    { question: 'unmatched', options: ['a', 'b'], answer: 'z' },
    { question: 'fine', options: ['a', 'b'], answer: 'b' },
  ], 't');
  assert.equal(bank.questions.length, 1);
  assert.equal(bank.skipped.length, 2);
});

test('rejects a payload that is not a question list', () => {
  assert.throws(() => normalizeQuiz({ foo: 1 }, 't'));
});

test('reads letter-keyed choice objects and letter answers', () => {
  const q = one({
    question: 'What is a constraint?',
    type: 'multiple_choice',
    choices: { A: 'A behavior', B: 'A restriction on design choices', C: 'A user goal' },
    answer: 'B',
  });
  assert.equal(q.type, 'single');
  assert.deepEqual(q.options, ['A behavior', 'A restriction on design choices', 'A user goal']);
  assert.deepEqual(q.answers, [1]);
});

test('loads the Chapter 1 bank with nothing skipped', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/541-Ch1.json');
  const deck = JSON.parse(await readFile(file, 'utf8'));
  const bank = normalizeQuiz(deck);
  assert.equal(bank.title, 'Requirements Engineering, Chapter 1');
  assert.equal(bank.questions.length, deck.questions.length);
  assert.equal(bank.skipped.length, 0);
});
