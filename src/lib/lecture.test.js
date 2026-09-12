import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cueTimeRange,
  formatLectureTime,
  lectureParagraphs,
  matchingLectureIndexes,
  parseLecture,
} from './lecture.js';

const sample = `(Transcribed by TurboScribe. Go Unlimited to remove this message.)

Welcome to chapter 2. Who are the customers?

The job of requirements analysts is to identify and listen to the customers.

(Transcribed by TurboScribe. Go Unlimited to remove this message.)
`;

const timed = `Chapter 2v2.mp3

[00:00] Welcome to Chapter 2.

[00:03] In this chapter, we look at the requirements from the customer's point of view.

[00:58] So the job of requirements analysts is to identify and listen to the customers and also

[01:05] satisfy them before moving forward.

[01:10] In order to have this well-connected relationship between customers and analysts, Weger identifies
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

test('parseLecture reads timestamps and the audio file name', () => {
  const parsed = parseLecture(timed);
  assert.equal(parsed.audioFile, 'Chapter 2v2.mp3');
  assert.equal(parsed.cues[0].start, 0);
  assert.equal(parsed.cues[1].start, 3);
  assert.equal(parsed.cues[2].start, 58);
  assert.equal(parsed.cues[3].start, 65);
  assert.match(parsed.cues[0].text, /Welcome to Chapter 2/);
});

test('matching a long quote lands on the timed lines and gives a clip range', () => {
  const { cues } = parseLecture(timed);
  const hits = matchingLectureIndexes(cues, 'identify and listen to the customers and also satisfy them before moving forward');
  assert.ok(hits.length >= 1);
  assert.equal(hits[0], 2);
  const range = cueTimeRange(cues, hits);
  assert.equal(range.start, 58);
  assert.ok(range.end == null || range.end > range.start);
});

test('formatLectureTime pads minutes and seconds', () => {
  assert.equal(formatLectureTime(0), '00:00');
  assert.equal(formatLectureTime(65), '01:05');
});

test('parseLecture reads an mp4 filename on the first line', () => {
  const parsed = parseLecture('talk.mp4\n\n[01:20] Confidentiality is required at all organizational levels.\n');
  assert.equal(parsed.audioFile, 'talk.mp4');
  assert.equal(parsed.cues[0].start, 80);
  assert.match(parsed.cues[0].text, /Confidentiality/);
});
