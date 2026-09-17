import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectLanguage,
  extractFence,
  highlightCode,
  highlightCss,
  highlightHtml,
  highlightJs,
  looksLikeCode,
} from './highlight.js';

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
  assert.equal(looksLikeCode('<div class="card">Hello</div>'), true);
  assert.equal(looksLikeCode('display: flex;'), true);
});

test('detectLanguage tells HTML, CSS, and JavaScript apart', () => {
  assert.equal(detectLanguage('<p class="lede">Hi</p>'), 'html');
  assert.equal(detectLanguage('p {\n  color: navy;\n}'), 'css');
  assert.equal(detectLanguage('function add(a, b) { return a + b; }'), 'javascript');
});

test('highlightHtml colors tags and attributes', () => {
  const html = highlightHtml('<p class="lede">Hi</p>');
  assert.match(html, /j-kw/);
  assert.match(html, /j-key/);
  assert.match(html, /j-str/);
  assert.match(html, /&lt;/);
  assert.doesNotMatch(html, /<p class=/);
});

test('highlightCss colors properties and values', () => {
  const html = highlightCss('.nav {\n  display: flex;\n}');
  assert.match(html, /j-kw/);
  assert.match(html, /j-key/);
});

test('highlightCode routes by language', () => {
  assert.match(highlightCode('<nav></nav>', 'html'), /j-kw/);
  assert.match(highlightCode('color: red;', 'css'), /j-kw/);
});

test('extractFence pulls a js listing out of a prompt', () => {
  const out = extractFence('What prints?\n\n```js\nlet n = 1;\n```');
  assert.equal(out.prompt, 'What prints?');
  assert.equal(out.code, 'let n = 1;');
});

test('extractFence pulls an html listing', () => {
  const out = extractFence('Which markup?\n\n```html\n<p>Hi</p>\n```');
  assert.equal(out.code, '<p>Hi</p>');
});
