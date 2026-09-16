import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { findSection, listSections, lookupCheatsheet, sectionToMarkdown } from './cheatsheet.js';

const sample = [
  '================================================================================',
  'CONTROL FLOW',
  '================================================================================',
  '',
  'DESCRIPTION',
  '',
  '    if, switch, and the loop forms.',
  '',
  '-------------------------------------------------------------------------------',
  'LOOPS',
  '-------------------------------------------------------------------------------',
  '',
  '    for (let i = 0; i < 10; i++) { }',
  '',
  '    for (const item of array) { }',
  '',
  '================================================================================',
  'FUNCTIONS',
  '================================================================================',
  '',
  'DESCRIPTION',
  '',
  '    Functions are values.',
].join('\n');

test('findSection matches a banner title the way jsjs does', () => {
  const hit = findSection(sample, 'control flow');
  assert.equal(hit.title, 'CONTROL FLOW');
  assert.match(hit.text, /for \(let i = 0/);
  assert.doesNotMatch(hit.text, /Functions are values/);
});

test('findSection also matches a subsection such as LOOPS', () => {
  const hit = findSection(sample, 'loops');
  assert.match(hit.title, /LOOPS/);
  assert.match(hit.text, /for \(const item of array\)/);
});

test('findSection misses unknown titles', () => {
  assert.equal(findSection(sample, 'preprocessor'), null);
});

test('sectionToMarkdown turns loop examples into a fenced block', () => {
  const md = sectionToMarkdown(findSection(sample, 'loops').text);
  assert.match(md, /# CONTROL FLOW/);
  assert.match(md, /## LOOPS/);
  assert.match(md, /```js/);
  assert.match(md, /for \(const item of array\)/);
});

test('the checked-in JavaScript cheatsheet has the language sections', async () => {
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../applied-classroom/javascript-cheatsheet.txt');
  const src = await readFile(file, 'utf8');
  const titles = listSections(src);
  assert.ok(titles.indexOf('VARIABLES AND TYPES') !== -1);
  assert.ok(titles.indexOf('CONTROL FLOW') !== -1);
  assert.ok(titles.indexOf('FUNCTIONS') !== -1);
  const hit = lookupCheatsheet(src, 'CONTROL FLOW');
  assert.match(hit.markdown, /for \(const item of array\)/);
});
