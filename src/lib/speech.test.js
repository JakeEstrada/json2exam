import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardSpeechParts, normalizeRate, normalizeVoice, pickBestVoice, prefetchSpeechParts, speechCached } from './speech.js';

test('pickBestVoice prefers a natural English voice over a novelty one', () => {
  const voices = [
    { name: 'Bad News', lang: 'en-US', localService: true },
    { name: 'eSpeak Compact', lang: 'en-GB', localService: true },
    { name: 'Google US English', lang: 'en-US', localService: false },
    { name: 'Samantha', lang: 'en-US', localService: true },
  ];
  const picked = pickBestVoice(voices, 'en');
  assert.ok(picked);
  assert.match(picked.name, /Google US English|Samantha/);
});

test('normalizeVoice keeps a real OpenAI voice and rejects junk', () => {
  assert.equal(normalizeVoice('nova'), 'nova');
  assert.equal(normalizeVoice('ONYX'), 'onyx');
  assert.equal(normalizeVoice('robot-9000'), 'coral');
});

test('normalizeRate snaps to a supported playback speed', () => {
  assert.equal(normalizeRate(1), 1);
  assert.equal(normalizeRate(1.5), 1.5);
  assert.equal(normalizeRate(1.4), 1.5);
  assert.equal(normalizeRate('fast'), 1);
});

test('cardSpeechParts splits the title and each choice', () => {
  const parts = cardSpeechParts(
    { text: 'What is Agile?', options: ['A plan', 'A mindset', 'A tool'] },
    [1, 0, 2]
  );
  assert.deepEqual(parts.map((p) => p.text), [
    'What is Agile?',
    'A. A mindset',
    'B. A plan',
    'C. A tool',
  ]);
  assert.equal(parts[0].kind, 'title');
  assert.equal(parts[1].option, 1);
});

test('prefetchSpeechParts no-ops on empty input', async () => {
  await prefetchSpeechParts([], 'coral');
  assert.equal(speechCached('', 'coral'), false);
});
