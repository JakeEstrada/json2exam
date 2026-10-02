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
  assert.equal(looksLikeCode('Array.isArray(value)'), true);
  assert.equal(looksLikeCode('n => n * 2'), true);
});

test('looksLikeCode leaves prose that uses punctuation alone', () => {
  // A quiz option that renders as code stands out from the other choices.
  assert.equal(looksLikeCode('It turns the element into a flex container; direct children become flex items.'), false);
  assert.equal(looksLikeCode('Padding doesn’t make the element wider; it makes the content narrower.'), false);
  assert.equal(looksLikeCode('margin (outside the border).'), false);
  assert.equal(looksLikeCode('1 2 1 because make()() is a new closure.'), false);
});

test('detectLanguage tells HTML, CSS, and JavaScript apart', () => {
  assert.equal(detectLanguage('<p class="lede">Hi</p>'), 'html');
  assert.equal(detectLanguage('p {\n  color: navy;\n}'), 'css');
  assert.equal(detectLanguage('function add(a, b) { return a + b; }'), 'javascript');
  assert.equal(detectLanguage('def two_sum(nums, target):\n    return []'), 'python');
  assert.equal(detectLanguage('while i < n:\n    i += 1'), 'python');
  assert.equal(detectLanguage('i = 0\nwhile i < n\n    i += 1'), 'python');
  assert.equal(detectLanguage('for item in rows:\n    print(item)'), 'python');
});

test('highlightPython marks keywords and strings', async () => {
  const { highlightPython } = await import('./highlight.js');
  const html = highlightPython('def two_sum(nums, target):\n    return [0, 1]');
  assert.match(html, />def</);
  assert.match(html, />return</);
  assert.equal(highlightCode(html.includes('def') ? 'def f():\n    pass' : '', 'python').includes('j-kw'), true);
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
