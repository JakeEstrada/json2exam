import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lectureParagraphs, matchingLectureIndexes } from './lecture.js';

const sample = `(Transcribed by TurboScribe. Go Unlimited to remove this message.)

Welcome to chapter 2. Who are the customers?

The job of requirements analysts is to identify and listen to the customers.

(Transcribed by TurboScribe. Go Unlimited to remove this message.)
`;

test('lectureParagraphs drops TurboScribe banners', () => {
  const paras = lectureParagraphs(sample);
  assert.equal(paras.length, 2);
  assert.match(paras[0], /Welcome to chapter 2/);
});

test('matchingLectureIndexes highlights the quoted paragraph', () => {
  const paras = lectureParagraphs(sample);
  const hits = matchingLectureIndexes(paras, 'identify and listen to the customers');
  assert.deepEqual(hits, [1]);
});
