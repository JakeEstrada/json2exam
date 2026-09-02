import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeQuiz } from './parseQuiz.js';
import { findBrain, parseLetters, reply, shownOption } from './ask.js';
import { BRAINS } from '../brains/index.js';

const dir = path.dirname(fileURLToPath(import.meta.url));

async function loadDeck(name) {
  const deck = JSON.parse(await readFile(path.join(dir, '../data', name), 'utf8'));
  return normalizeQuiz(deck);
}

test('parseLetters picks option letters out of a question', () => {
  assert.deepEqual(parseLetters('Hey why isnt f a user requirement?'), ['f']);
  assert.deepEqual(parseLetters("why isn't F a user requirement?"), ['f']);
  assert.deepEqual(parseLetters('What is a user requirement?'), []);
  assert.deepEqual(parseLetters('why are A and C right?'), ['a', 'c']);
});

test('shownOption follows the shuffled on-screen letters', () => {
  const card = {
    q: { options: ['alpha', 'bravo', 'charlie'], answers: [2] },
    order: [2, 0, 1],
  };
  assert.equal(shownOption(card, 'a').text, 'charlie');
  assert.equal(shownOption(card, 'a').isAnswer, true);
  assert.equal(shownOption(card, 'c').text, 'bravo');
});

test('541-Ch1.json is tagged and matches the Chapter 1 brain', async () => {
  const quiz = await loadDeck('541-Ch1.json');
  assert.equal(quiz.brain, 'req-eng-ch1');
  assert.equal(quiz.questions.length, 37);
  const brain = findBrain(quiz, BRAINS);
  assert.equal(brain && brain.id, 'req-eng-ch1');
});

test('an unrelated upload does not get AskGPT', () => {
  const quiz = normalizeQuiz({
    title: 'Other class',
    questions: [
      { question: 'What is TCP?', options: ['a protocol', 'a cipher'], answer: 'a' },
    ],
  });
  assert.equal(findBrain(quiz, BRAINS), null);
});

test('the Paarth Chapter 1 file does not auto-match this brain', async () => {
  const quiz = await loadDeck('541.json');
  assert.equal(quiz.brain, null);
  assert.equal(findBrain(quiz, BRAINS), null);
});

test('letter questions stay locked until the card is checked', async () => {
  const quiz = await loadDeck('541-Ch1.json');
  const brain = findBrain(quiz, BRAINS);
  const q = quiz.questions.find((x) => x.text.startsWith('Which of these are stated at the level'));
  const card = { q, order: q.options.map((_, i) => i) };
  const locked = reply(brain, { message: 'why isnt f a user requirement?', card, phase: 'answer' });
  assert.match(locked, /Check your answer first/i);
});

test('after check, F maps to the on-screen option and gets a canned why', async () => {
  const quiz = await loadDeck('541-Ch1.json');
  const brain = findBrain(quiz, BRAINS);
  const q = quiz.questions.find((x) => x.text.startsWith('Which of these are stated at the level'));
  const punch = q.options.findIndex((o) => /StoryView/i.test(o));
  const order = q.options.map((_, i) => i);
  const shown = order.indexOf(punch);
  const letter = 'abcdef'[shown];
  const card = { q, order };
  const text = reply(brain, { message: 'why isnt ' + letter + ' a user requirement?', card, phase: 'review' });
  assert.match(text, /database row|internal behavior|not a user requirement/i);
});
