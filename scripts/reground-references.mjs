#!/usr/bin/env node
/**
 * Re-grounds every applied-classroom quiz reference against the real PDFs:
 * picks the page whose text actually matches the question + answer, quotes a
 * real sentence from that page, and adds a second book when another source
 * covers the same point.
 *
 * Run from repo root:
 *   node scripts/reground-references.mjs            # report only
 *   node scripts/reground-references.mjs --write    # rewrite quiz.json files
 */
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import {
  booksForCourse, pagesOf, buildIndex, bestPages, bestExcerpt, buildQuery, bigrams, terms,
  pagesFromNotes, notesPagesForBook,
} from './lib/book-text.mjs';

const ROOT = 'applied-classroom';
const WRITE = process.argv.includes('--write');
const ONLY = (() => {
  const i = process.argv.indexOf('--only');
  return i !== -1 ? process.argv[i + 1] : '';
})();

// Confidence gates: below PRIMARY_FLOOR we leave the existing reference alone.
const PRIMARY_FLOOR = 0.7;
const KEY_COVERAGE_FLOOR = 0.4;
const STRONG_SCORE = 1.6;          // phrase/heading hits strong enough to trust alone
const SECOND_BOOK_RATIO = 0.8;
const SECOND_BOOK_FLOOR = 1.0;

// Words that describe the quiz, not the subject matter: they must not count
// toward "does this page actually cover the question's topic".
const META_TERMS = new Set(('chapter chapters quiz deck question questions answer answers true false according '
  + 'says say said recommends recommend emphasize emphasizes describe describes called best which what why how '
  + 'when where connects connect maps map closely idea ideas lesson lessons point points thinking planning '
  + 'include includes including means meaning probably mainly primarily typically commonly often should would '
  + 'could term terms word words name names call calls following above below section sections topic topics '
  + 'guide book books page pages read reading study notes note example examples').split(' '));

function sectionBody(notes, heading) {
  if (!notes || !heading) return '';
  const want = heading.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!want) return '';
  const parts = String(notes).split(/^#{1,3} /m);
  for (const part of parts) {
    const line = part.split('\n')[0] || '';
    const have = line.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (have === want || have.includes(want) || want.includes(have)) {
      return part.split('\n').slice(1).join(' ').slice(0, 600);
    }
  }
  return '';
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
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

const bookCache = new Map();
function loadBook(book) {
  if (bookCache.has(book.path)) return bookCache.get(book.path);
  const pages = pagesOf(book.path);
  const entry = { ...book, pages, index: buildIndex(pages) };
  bookCache.set(book.path, entry);
  return entry;
}

function optionText(opt) {
  if (typeof opt === 'string') return opt;
  if (opt && typeof opt === 'object') return String(opt.text || opt.label || opt.option || '');
  return String(opt || '');
}

function answerTexts(q) {
  const opts = (q.options || []).map(optionText);
  const raw = q.answer !== undefined ? q.answer : q.answers;
  const list = Array.isArray(raw) ? raw : [raw];
  const out = [];
  for (const item of list) {
    if (typeof item === 'number' && opts[item]) { out.push(opts[item]); continue; }
    const s = String(item || '').trim();
    if (/^[a-z]$/i.test(s)) {
      const idx = s.toLowerCase().charCodeAt(0) - 97;
      if (opts[idx]) out.push(opts[idx]);
      continue;
    }
    if (typeof item === 'boolean' || /^(true|false)$/i.test(s)) continue;
    const hit = opts.find((o) => o.trim() === s);
    if (hit) out.push(hit);
  }
  return out;
}

const stats = {
  files: 0, questions: 0, refs: 0,
  pageChanged: 0, excerptChanged: 0, bookChanged: 0,
  secondBook: 0, lowConfidence: 0, noBooks: 0,
};
const lowConfidence = [];
const samples = [];
const SAMPLE_LIMIT = process.argv.includes('--sample') ? 6 : 0;

const files = walk(ROOT).filter((f) => !ONLY || f.includes(ONLY)).sort();

for (const file of files) {
  let data;
  try { data = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
  const questions = Array.isArray(data.questions) ? data.questions : [];
  if (!questions.length) continue;
  const course = courseFor(file);
  const books = course ? booksForCourse(course).map(loadBook) : [];
  stats.files += 1;
  if (!books.length) { stats.noBooks += 1; continue; }
  const notesPath = join(dirname(file), 'notes.md');
  const notes = existsSync(notesPath) ? readFileSync(notesPath, 'utf8') : '';
  const assignedPages = pagesFromNotes(notes);

  const usedExcerpts = new Set();
  let touched = false;

  questions.forEach((q) => {
    stats.questions += 1;
    const ref = q.reference;
    if (!ref || typeof ref !== 'object' || Array.isArray(ref)) return;
    if (ref.url) return;                       // external problem links stay as-is
    const existingBook = String(ref.book || '').trim();
    if (!existingBook && !ref.page) return;
    stats.refs += 1;

    const stem = String(q.question || q.text || q.prompt || '');
    const answers = answerTexts(q).join(' ');
    const topic = [stem, answers, ref.section || '', data.title || ''].join(' ');
    const sectionNotes = sectionBody(notes, ref.section || '');
    const query = buildQuery([
      { text: stem, weight: 3 },
      { text: answers, weight: 3 },
      { text: ref.section || '', weight: 2.5 },
      { text: sectionNotes, weight: 2 },
      { text: q.explanation || '', weight: 1.5 },
      { text: data.title || '', weight: 1.2 },
    ]);
    const phrases = [stem, answers].filter((s) => s.length > 20);
    const keyPhrases = [...new Set(bigrams(stem).concat(bigrams(ref.section || '')))]
      .filter((p) => p.split(' ').some((w) => !META_TERMS.has(w)));
    const keyTerms = [...new Set(terms(stem).concat(terms(ref.section || ''), terms(data.title || '')))]
      .filter((t) => !META_TERMS.has(t));

    // Score each available book on its own best page.
    const ranked = books.map((book) => {
      const preferPages = notesPagesForBook(assignedPages, book.title);
      const hit = bestPages(book.pages, book.index, query, {
        phrases, keyPhrases, keyTerms, limit: 1, skipFront: 2,
        preferPages,
      })[0];
      return hit ? { book, constrained: preferPages.length > 0, ...hit } : null;
    }).filter(Boolean).sort((a, b) => {
      if (a.constrained !== b.constrained) return a.constrained ? -1 : 1;
      return b.score - a.score;
    });

    // Reject matches that miss the question's own topic words: those are the
    // "random page that shares a few generic words" references.
    const weak = !ranked.length
      || ranked[0].score < PRIMARY_FLOOR
      || (ranked[0].keyCoverage < KEY_COVERAGE_FLOOR && ranked[0].score < STRONG_SCORE);
    if (weak) {
      stats.lowConfidence += 1;
      lowConfidence.push({
        file,
        question: stem.slice(0, 80),
        score: ranked[0] ? +ranked[0].score.toFixed(3) : 0,
        why: ranked[0] && ranked[0].keyCoverage < KEY_COVERAGE_FLOOR
          ? 'topic coverage ' + ranked[0].keyCoverage.toFixed(2)
          : 'weak score',
      });
      return;
    }
    void topic;

    // Keep the author's chosen book when it is nearly as good as the winner.
    const prior = existingBook
      ? ranked.find((r) => r.book.title.toLowerCase().includes(existingBook.toLowerCase().split(' by ')[0].slice(0, 18)))
      : null;
    let primary = ranked[0];
    if (prior && prior.constrained === primary.constrained && prior.score >= ranked[0].score * 0.85) {
      primary = prior;
    }

    const citations = [primary];
    const second = ranked.find((r) => r.book.path !== primary.book.path
      && r.score >= primary.score * SECOND_BOOK_RATIO
      && r.score >= SECOND_BOOK_FLOOR);
    if (second) citations.push(second);

    const built = citations.map((entry) => {
      const pageText = entry.book.pages[entry.page - 1] || '';
      const excerpt = bestExcerpt(pageText, entry.book.index, query, usedExcerpts);
      if (excerpt) usedExcerpts.add(excerpt.toLowerCase());
      return { book: entry.book.title, page: entry.page, excerpt, score: entry.score };
    }).filter((row) => row.excerpt);

    if (!built.length) {
      stats.lowConfidence += 1;
      lowConfidence.push({ file, question: stem.slice(0, 80), score: +primary.score.toFixed(3), why: 'no prose excerpt' });
      return;
    }

    const head = built[0];
    if (ref.page !== head.page) stats.pageChanged += 1;
    if (ref.excerpt !== head.excerpt) stats.excerptChanged += 1;
    if (existingBook && existingBook !== head.book) stats.bookChanged += 1;
    if (built.length > 1) stats.secondBook += 1;

    const next = {};
    if (ref.section) next.section = ref.section;
    next.book = head.book;
    if (ref.chapter) next.chapter = ref.chapter;
    next.page = head.page;
    if (ref.pageEnd) next.pageEnd = ref.pageEnd;
    next.excerpt = head.excerpt;
    if (built.length > 1) {
      next.books = built.slice(1).map((row) => ({ book: row.book, page: row.page, excerpt: row.excerpt }));
    }
    if (ref.lecture) next.lecture = ref.lecture;
    if (ref.slide) next.slide = ref.slide;

    if (samples.length < SAMPLE_LIMIT) {
      samples.push({
        file,
        stem,
        answer: answers,
        before: (existingBook || '(none)') + ' p.' + (ref.page || '?') + ' "' + String(ref.excerpt || '').slice(0, 90) + '"',
        after: built,
      });
    }

    q.reference = next;
    touched = true;
  });

  if (touched && WRITE) writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

if (samples.length) {
  console.log('\nsamples:');
  samples.forEach((s) => {
    console.log('\n  ' + s.file.replace(ROOT + '/', ''));
    console.log('  Q: ' + s.stem.slice(0, 110));
    console.log('  A: ' + s.answer.slice(0, 100));
    console.log('  was: ' + s.before);
    s.after.forEach((row, i) => {
      console.log('  ' + (i ? '+' : 'now') + ': ' + row.book + ' p.' + row.page + ' (' + row.score.toFixed(2) + ')');
      console.log('       "' + row.excerpt.slice(0, 170) + '"');
    });
  });
}

console.log(WRITE ? '\nREWROTE quiz files' : '\nDRY RUN (pass --write to apply)');
console.log(stats);
if (lowConfidence.length) {
  console.log('\nlow confidence (left untouched):', lowConfidence.length);
  lowConfidence.slice(0, 20).forEach((row) => {
    console.log('  ', row.score, row.file.replace(ROOT + '/', ''), '|', row.question, row.why || '');
  });
}
