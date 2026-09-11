import { test } from 'node:test';
import assert from 'node:assert/strict';
import { headingId, normalizeQuiz } from './parseQuiz.js';

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

test('loads the Requirements Engineering sampler with nothing skipped', async () => {
  const { SAMPLE } = await import('../data/sample.js');
  const bank = normalizeQuiz(SAMPLE);
  assert.equal(bank.title, 'Requirements Engineering sampler');
  assert.equal(bank.questions.length, SAMPLE.questions.length);
  assert.equal(bank.skipped.length, 0);
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

test('headingId strips quotes and punctuation', () => {
  assert.equal(headingId('Who counts as a "customer"'), 'who-counts-as-a-customer');
});

test('preserves a chapter reference on a question', () => {
  const q = one({
    question: 'Who is a customer?',
    options: ['Only the end user of the product', 'Anyone who benefits from the product'],
    answer: 'b',
    reference: {
      section: 'Who counts as a "customer"',
      book: 'Chapter 2 — Customers and stakeholders',
      page: 4,
      excerpt: 'A customer derives direct or indirect benefit from a product.',
    },
  });
  assert.equal(q.reference.section, 'Who counts as a "customer"');
  assert.equal(q.reference.book, 'Chapter 2 — Customers and stakeholders');
  assert.equal(q.reference.page, 4);
  assert.match(q.reference.excerpt, /benefit/);
});

test('loads every Module 1 bank with nothing skipped', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../541-Mod1');
  const files = [
    ['Ch1/ch1.json', 31],
    ['Ch2/Ch2.json', 38],
    ['Ch3/Ch3.json', 47],
    ['Ch4/Ch4.json', 47],
    ['Ch5/Ch5.json', 44],
  ];
  for (const [rel, count] of files) {
    const deck = JSON.parse(await readFile(path.join(root, rel), 'utf8'));
    const bank = normalizeQuiz(deck);
    assert.equal(bank.questions.length, count, rel);
    assert.equal(bank.skipped.length, 0, rel);
    for (const q of bank.questions) {
      assert.ok(q.reference && q.reference.section, rel + ' missing notes section');
      assert.ok(q.reference.page >= 1, rel + ' missing book page');
      assert.ok(q.reference.excerpt, rel + ' missing excerpt');
    }
  }
});
