#!/usr/bin/env node
/**
 * Audits every applied-classroom quiz.json for reference and answer-quality problems.
 * Run from repo root: node scripts/audit-quizzes.mjs [--json out.json]
 */
import { readdirSync, readFileSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { findBook } from '../src/lib/books.js';
import { looksLikeCode } from '../src/lib/highlight.js';
import { booksForCourse } from './lib/book-text.mjs';

const ROOT = 'applied-classroom';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name === 'quiz.json') out.push(full);
  }
  return out;
}

function courseFor(file) {
  let dir = dirname(file);
  while (dir.startsWith(ROOT)) {
    if (existsSync(join(dir, 'sources'))) return dir;
    const next = dirname(dir);
    if (next === dir) break;
    dir = next;
  }
  return null;
}

const sourcesCache = new Map();
function sourcesIn(course) {
  if (!course) return [];
  if (!sourcesCache.has(course)) sourcesCache.set(course, booksForCourse(course));
  return sourcesCache.get(course);
}

const STOP = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'are', 'was', 'you', 'your',
  'not', 'but', 'all', 'any', 'can', 'has', 'have', 'its', 'only', 'when', 'what', 'which', 'does', 'use',
  'used', 'uses', 'using', 'every', 'each', 'they', 'them', 'their', 'then', 'than', 'will', 'would', 'should',
  'could', 'must', 'may', 'might', 'who', 'how', 'why', 'where', 'because', 'about', 'after', 'before', 'over',
  'under', 'more', 'most', 'less', 'same', 'other', 'another', 'also', 'some', 'such', 'one', 'two', 'three',
  'true', 'false', 'following', 'below', 'above', 'says', 'said', 'per', 'via', 'out', 'off', 'own']);

function words(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, ' ')
    .split(' ')
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function optionText(opt) {
  if (typeof opt === 'string') return opt;
  if (opt && typeof opt === 'object') return String(opt.text || opt.label || opt.option || '');
  return String(opt || '');
}

function answerIndices(q) {
  const raw = q.answer !== undefined ? q.answer : q.answers;
  const list = Array.isArray(raw) ? raw : [raw];
  const n = (q.options || []).length;
  const out = [];
  for (const item of list) {
    if (typeof item === 'number' && item >= 0 && item < n) { out.push(item); continue; }
    const s = String(item || '').trim();
    if (/^[a-z]$/i.test(s)) {
      const idx = s.toLowerCase().charCodeAt(0) - 97;
      if (idx >= 0 && idx < n) out.push(idx);
      continue;
    }
    const hit = (q.options || []).findIndex((o) => optionText(o).trim() === s);
    if (hit >= 0) out.push(hit);
  }
  return out;
}

// ─── Pad phrases our generators injected only into distractors ───
const PAD_PHRASES = [
  'for real production programs',
  'in real production systems at scale',
];

const findings = [];
function flag(file, qi, kind, detail) {
  findings.push({ file, question: qi, kind, detail });
}

const files = walk(ROOT).sort();
let totalQuestions = 0;
let refCount = 0;
let multiBook = 0;

for (const file of files) {
  let data;
  try { data = JSON.parse(readFileSync(file, 'utf8')); }
  catch (err) { flag(file, -1, 'parse-error', err.message); continue; }
  const questions = Array.isArray(data.questions) ? data.questions : [];
  const course = courseFor(file);
  const books = sourcesIn(course);

  questions.forEach((q, qi) => {
    totalQuestions++;
    const ref = q.reference || q.ref || q.source || null;
    const opts = (q.options || []).map(optionText);
    const idxs = answerIndices(q);

    // ── reference checks ──
    if (ref && typeof ref === 'object' && !Array.isArray(ref)) {
      const cites = [ref].concat(Array.isArray(ref.books) ? ref.books : []);
      let hasBookCite = false;
      cites.forEach((cite, ci) => {
        const bookTitle = String(cite.book || cite.title || '').trim();
        if (!bookTitle) {
          if (cite.page && ci === 0) flag(file, qi, 'ref-page-no-book', `page ${cite.page} with no book title`);
          return;
        }
        hasBookCite = true;
        if (ci === 0) refCount++;
        if (!findBook(books, bookTitle)) {
          flag(file, qi, 'book-unresolved', `"${bookTitle}" has no PDF for ${course || '(no course)'}`);
        }
        if (!cite.page) flag(file, qi, 'ref-no-page', `"${bookTitle}" without page`);
        if (!cite.excerpt) flag(file, qi, 'ref-no-excerpt', `"${bookTitle}" p.${cite.page || '?'} without excerpt`);
      });
      if (Array.isArray(ref.books) && ref.books.length) multiBook++;
      void hasBookCite;
    } else if (opts.length) {
      flag(file, qi, 'ref-missing', 'no reference object');
    }

    // ── obvious-answer checks ──
    if (opts.length && idxs.length === 1) {
      const correct = opts[idxs[0]];
      const others = opts.filter((_, i) => i !== idxs[0]);

      for (const pad of PAD_PHRASES) {
        const padded = others.filter((o) => o.toLowerCase().includes(pad)).length;
        const correctPadded = correct.toLowerCase().includes(pad);
        if (padded > 0 && !correctPadded) {
          flag(file, qi, 'pad-tell', `${padded}/${others.length} distractors carry filler "${pad}"`);
          break;
        }
      }

      const lens = opts.map((o) => o.length);
      const maxOther = Math.max(...others.map((o) => o.length));
      const minOther = Math.min(...others.map((o) => o.length));
      if (correct.length > maxOther * 1.6 && correct.length - maxOther > 25) {
        flag(file, qi, 'longest-answer', `correct ${correct.length} chars vs max distractor ${maxOther}`);
      }
      if (correct.length * 1.6 < minOther && minOther - correct.length > 25) {
        flag(file, qi, 'shortest-answer', `correct ${correct.length} chars vs min distractor ${minOther}`);
      }

      // Formatting tell: the runner renders code-looking options as code blocks,
      // so being the only one makes the answer visually obvious.
      if (looksLikeCode(correct) && !others.some(looksLikeCode)) {
        flag(file, qi, 'only-answer-has-code', 'correct option is the only option rendered as code');
      }

      // stem gives it away: rare words of the answer echoed in the question
      const stem = new Set(words(q.question || q.text || q.prompt));
      const answerWords = words(correct);
      const distinct = answerWords.filter((w) => !others.some((o) => words(o).includes(w)));
      const echoed = distinct.filter((w) => stem.has(w));
      if (distinct.length >= 3 && echoed.length / distinct.length >= 0.5 && echoed.length >= 2) {
        flag(file, qi, 'stem-echo', `stem repeats answer-only words: ${echoed.slice(0, 6).join(', ')}`);
      }

      // absurd distractors: joke markers
      const joke = /\b(cake|cafeteria|pigeon|floppy disk|comic sans|emoji|postal mail|morse code|sing|magic|unicorn|pizza)\b/i;
      const jokes = others.filter((o) => joke.test(o)).length;
      if (jokes >= 1) flag(file, qi, 'joke-distractor', `${jokes} distractor(s) use gag wording`);

      // duplicate options (punctuation matters: calc(a + b) !== calc(a - b))
      const seen = new Map();
      opts.forEach((o, i) => {
        const key = o.toLowerCase().replace(/\s+/g, ' ').trim();
        if (seen.has(key)) flag(file, qi, 'duplicate-option', `options ${seen.get(key)} and ${i} identical`);
        else seen.set(key, i);
      });
      void lens;
    }

    if (opts.length && !idxs.length) flag(file, qi, 'answer-unresolved', `answer ${JSON.stringify(q.answer ?? q.answers)} not matched to options`);
  });
}

const byKind = {};
for (const f of findings) byKind[f.kind] = (byKind[f.kind] || 0) + 1;

console.log(`files: ${files.length}  questions: ${totalQuestions}  book refs: ${refCount}  multi-book: ${multiBook}`);
console.log('\nfindings by kind:');
Object.entries(byKind).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${String(v).padStart(5)}  ${k}`));

const byFile = {};
for (const f of findings) byFile[f.file] = (byFile[f.file] || 0) + 1;
console.log('\nworst files:');
Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 25)
  .forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));

const jsonArg = process.argv.indexOf('--json');
if (jsonArg !== -1 && process.argv[jsonArg + 1]) {
  writeFileSync(process.argv[jsonArg + 1], JSON.stringify({ byKind, findings }, null, 2));
  console.log('\nwrote', process.argv[jsonArg + 1]);
}
