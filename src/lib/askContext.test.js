import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAskPrompt } from './askContext.js';

test('buildAskPrompt hides the key until review', () => {
  const card = {
    text: 'What is a constraint?',
    options: ['A user goal', 'A design restriction'],
    answers: [1],
    order: [0, 1],
    explanation: 'It narrows design choices.',
  };
  const before = buildAskPrompt({ message: 'why isnt A also right?', phase: 'answer', card });
  assert.match(before, /Do not reveal the answer/);
  assert.doesNotMatch(before, /Correct answer/);
  assert.match(before, /A\. A user goal/);
  assert.match(before, /B\. A design restriction/);

  const after = buildAskPrompt({ message: 'why isnt A also right?', phase: 'review', card });
  assert.match(after, /Correct answer\(s\): B/);
  assert.match(after, /Bank explanation: It narrows design choices/);
});

test('buildAskPrompt includes deck study notes when present', () => {
  const prompt = buildAskPrompt({
    message: 'What is vision vs scope?',
    phase: 'answer',
    notes: 'Vision = destination. Scope = this trip.',
  });
  assert.match(prompt, /Study notes for this deck/);
  assert.match(prompt, /Vision = destination/);
});
