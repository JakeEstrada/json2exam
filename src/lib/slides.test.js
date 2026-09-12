import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  firstSlideMention,
  firstSlideRange,
  formatSlideRange,
  slideMentions,
  slideParts,
} from './slides.js';

test('reads a single slide number, including words and slide number N', () => {
  assert.equal(firstSlideMention('Slide 2 shows possible meanings'), 2);
  assert.equal(firstSlideMention('as you see slide number six, there are customers'), 6);
  assert.equal(firstSlideMention('Initially, slide two shows that these four steps'), 2);
  assert.equal(firstSlideMention('the teacher said (slide 4-7) in lecture'), 4);
});

test('reads ranges written with hyphen, to, through, or and', () => {
  assert.deepEqual(firstSlideRange('Slides 4 to 7 show the rights'), { start: 4, end: 7 });
  assert.deepEqual(firstSlideRange('slide 4-7'), { start: 4, end: 7 });
  assert.deepEqual(firstSlideRange('Slide 15-18 deals with management'), { start: 15, end: 18 });
  assert.deepEqual(firstSlideRange('slides 8 through 12 show the skills'), { start: 8, end: 12 });
  assert.deepEqual(firstSlideRange('slide 19 and 20 show the summaries'), { start: 19, end: 20 });
  assert.deepEqual(firstSlideRange('slide three to eight show the activities'), { start: 3, end: 8 });
  assert.deepEqual(firstSlideRange('the slides two through seven showed the details'), { start: 2, end: 7 });
});

test('ignores this/next slide talk with no number', () => {
  assert.equal(firstSlideMention('And then next slide talks about process'), 0);
  assert.equal(firstSlideMention('this slide shows the answer'), 0);
  assert.equal(slideMentions('PowerPoint slides, the presentations are forbidden').length, 0);
});

test('splits lecture text so slide mentions can be clicked', () => {
  const parts = slideParts('Look at slide 8, then slides 11 and 12 for the diagram.');
  assert.deepEqual(parts.map((p) => p.slide || 0), [0, 8, 0, 11, 0]);
  assert.equal(formatSlideRange({ start: 8, end: 10 }), 'Slides 8–10');
  assert.equal(formatSlideRange({ start: 6, end: 6 }), 'Slide 6');
});
