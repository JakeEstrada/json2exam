import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractFence, highlightJs, looksLikeCode } from './highlight.js';

test('highlightJs marks keywords, strings, and numbers', () => {
  const html = highlightJs('const n = 3;\nconsole.log("hi");');
  assert.match(html, /j-kw/);
  assert.match(html, /j-str/);
  assert.match(html, /j-num/);
  assert.doesNotMatch(html, /<script/);
});

test('highlightJs marks TypeScript keywords', () => {
  const html = highlightJs('interface User { name: string }\ntype Id = number;');
  assert.match(html, />interface</);
  assert.match(html, />type</);
});

test('looksLikeCode spots snippets and ignores prose', () => {
  assert.equal(looksLikeCode('for (let i = 0; i < n; i++) { }'), true);
  assert.equal(looksLikeCode('A scripting language with no compile step.'), false);
});

test('extractFence pulls a js listing out of a prompt', () => {
  const out = extractFence('What prints?\n\n```js\nlet n = 1;\n```');
  assert.equal(out.prompt, 'What prints?');
  assert.equal(out.code, 'let n = 1;');
});
