#!/usr/bin/env node
/**
 * Attach every local course book to each applied-classroom language /
 * system-design card, using pages that actually mention the deck topic.
 *
 *   node scripts/attach-all-books.mjs            # report
 *   node scripts/attach-all-books.mjs --write    # rewrite quiz.json
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  booksForCourse, pagesOf, buildIndex, bestPages, bestExcerpt, buildQuery,
  pagesFromNotes, notesPagesForBook, terms, bigrams,
} from './lib/book-text.mjs';

const ROOT = 'applied-classroom';
const WRITE = process.argv.includes('--write');
const ONLY = (() => {
  const i = process.argv.indexOf('--only');
  return i !== -1 ? process.argv[i + 1] : '';
})();

const SCOPE = /\/(python|javascript|typescript|html|css|system-design)\//;

const DECK_TOPICS = {
  'python/language/loops': ['for loop', 'while loop', 'range', 'break', 'continue', 'enumerate', 'iteration'],
  'python/language/conditionals': ['if statement', 'elif', 'else', 'boolean', 'conditional'],
  'python/language/variables-and-types': ['variable', 'string', 'integer', 'float', 'type'],
  'python/language/lists': ['list', 'append', 'slice', 'index'],
  'python/language/dicts-and-sets': ['dictionary', 'dict', 'set', 'key'],
  'python/language/functions': ['function', 'def', 'return', 'argument', 'parameter'],
  'python/language/comprehensions': ['comprehension', 'listcomp', 'generator'],
  'javascript/language/loops': ['while', 'for loop', 'break', 'continue', 'iteration', 'for...of'],
  'javascript/language/conditionals': ['if', 'else', 'switch', 'ternary', 'boolean'],
  'javascript/language/variables-and-data-types': ['let', 'const', 'var', 'type', 'primitive'],
  'javascript/language/functions': ['function', 'return', 'arrow', 'scope', 'closure'],
  'javascript/language/arrays': ['array', 'push', 'index', 'length'],
  'javascript/language/objects': ['object', 'property', 'key', 'reference'],
  'javascript/language/maps-and-sets': ['map', 'set', 'weakmap'],
  'typescript/language/types-and-annotations': ['type', 'annotation', 'typescript', 'interface'],
  'typescript/language/interfaces': ['interface', 'type', 'optional'],
  'typescript/language/functions': ['function', 'parameter', 'return'],
  'typescript/language/generics': ['generic', 'type parameter'],
  'typescript/language/unions-and-narrowing': ['union', 'narrow', 'typeof'],
  'typescript/language/object-types': ['object type', 'optional', 'readonly'],
  'typescript/language/arrays-and-tuples': ['array', 'tuple'],
  'html/language/document-and-structure': ['html', 'document', 'doctype', 'head'],
  'html/language/semantic-elements': ['semantic', 'article', 'section', 'nav'],
  'html/language/text-and-lists': ['paragraph', 'list', 'heading'],
  'html/language/links-and-images': ['anchor', 'href', 'img', 'alt'],
  'html/language/forms': ['form', 'input', 'label'],
  'html/language/tables-and-media': ['table', 'video', 'audio'],
  'html/language/accessibility': ['accessible', 'aria', 'alt'],
  'css/language/box-model': ['margin', 'padding', 'border', 'box'],
  'css/language/flexbox': ['flex', 'justify', 'align'],
  'css/language/grid': ['grid', 'column', 'row'],
  'css/language/selectors-and-cascade': ['selector', 'cascade', 'specificity'],
  'css/language/positioning': ['position', 'absolute', 'relative', 'fixed'],
  'css/language/responsive': ['media', 'responsive', 'viewport'],
  'css/language/typography-and-color': ['font', 'color', 'typography'],
  'system-design/foundations/what-is-system-design': ['system design', 'trade-off', 'scalability'],
};

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

function deckKey(file) {
  return file.replace(ROOT + '/', '').replace(/\/quiz\.json$/, '');
}

function topicHints(file, notes, title) {
  const key = deckKey(file);
  if (DECK_TOPICS[key]) return DECK_TOPICS[key];
  const fromPath = key.split('/').pop().replace(/-/g, ' ');
  const fromTitle = String(title || '').replace(/^.*\s-\s/, '');
  return [...new Set([fromPath, fromTitle])].filter(Boolean);
}

function questionHints(q, deckHints) {
  const blob = [q.reference && q.reference.section, q.question, q.explanation].filter(Boolean).join(' ').toLowerCase();
  const extra = [];
  const add = (...words) => words.forEach((w) => extra.push(w));
  if (/\brange\b/.test(blob)) add('range', 'range()');
  if (/\bwhile\b/.test(blob)) add('while', 'while loop');
  if (/\bbreak\b/.test(blob)) add('break');
  if (/\bcontinue\b/.test(blob)) add('continue');
  if (/\benumerate\b/.test(blob)) add('enumerate');
  if (/\bfor\b/.test(blob) && !/\bfor loop\b/.test(extra.join(' '))) add('for loop', 'for ');
  if (/\belif\b/.test(blob)) add('elif');
  if (/\bcomprehension\b/.test(blob)) add('comprehension', 'listcomp');
  const section = String((q.reference && q.reference.section) || '').trim();
  if (section) extra.push(section);
  return [...new Set(extra.length ? extra : deckHints)];
}

const JUNK_PAGE = /in-memory header|break it apart|metaobject protocol|data model because|gray cells represent/i;

function pageHasTopic(text, hints) {
  const hay = String(text || '').toLowerCase();
  if (JUNK_PAGE.test(hay)) return false;
  const meaningful = hints.filter((h) => String(h).replace(/[^a-z0-9]/gi, '').length >= 3);
  if (!meaningful.length) return true;
  return meaningful.some((h) => {
    const needle = String(h).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp((/[a-z0-9]$/i.test(h) ? '\\b' : '') + needle + (/^[a-z0-9]/i.test(h) ? '\\b' : '')).test(hay);
  });
}

function pagesInLine(line) {
  const out = [];
  const re = /(?:PDF\s*)?p(?:age)?s?\.?\s*(\d+)(?:\s*[–-]\s*(\d+))?/gi;
  let m;
  while ((m = re.exec(String(line || '')))) {
    const start = Number(m[1]);
    const end = Number(m[2] || m[1]);
    if (!start) continue;
    for (let n = start; n <= Math.min(end, start + 30); n += 1) out.push(n);
  }
  return out;
}

function notesPagesForQuestion(notes, bookTitle, hints, assigned) {
  const title = String(bookTitle || '').toLowerCase();
  const titleBit = title.split(',')[0].slice(0, 18);
  const want = hints.map((h) => String(h).toLowerCase()).filter((w) => w.length >= 3);
  const narrowed = [];
  for (const line of String(notes || '').split('\n')) {
    const lower = line.toLowerCase();
    if (!titleBit || !lower.includes(titleBit)) continue;
    const pages = pagesInLine(line);
    if (!pages.length) continue;
    if (!want.length || want.some((w) => lower.includes(w))) narrowed.push(...pages);
  }
  if (narrowed.length) return [...new Set(narrowed)];
  return notesPagesForBook(assigned, bookTitle);
}

function fallbackExcerpt(pageText, hints) {
  const flat = String(pageText || '').replace(/\s+/g, ' ').trim();
  if (flat.length < 40) return '';
  const lower = flat.toLowerCase();
  let at = -1;
  for (const h of hints) {
    const i = lower.indexOf(String(h).toLowerCase());
    if (i !== -1 && (at === -1 || i < at)) at = i;
  }
  const start = Math.max(0, (at === -1 ? 0 : at) - 40);
  const slice = flat.slice(start, start + 240).replace(/^[^\w“"([]+/, '').trim();
  return slice.length > 60 ? slice : flat.slice(0, 220);
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
    const hit = opts.find((o) => o.trim() === s);
    if (hit) out.push(hit);
  }
  return out;
}

function stripAnswerComment(code) {
  return String(code || '').replace(/[ \t]*#[ \t]*(\[[^\n]*\]|\{[^\n]*\}|true|false|\d+(?:\s*,\s*\d+)*)\s*$/gim, '');
}

function shape(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, '');
}

function codeLeaks(q) {
  const code = String(q.code || '');
  if (!code) return false;
  const hay = shape(code);
  const answers = answerTexts(q);
  return answers.some((ans) => {
    const needle = shape(ans.replace(/[`]/g, ''));
    if (!needle) return false;
    if (hay.includes(needle) && needle.length >= 1) {
      const others = (q.options || []).map(optionText).filter((o) => !answers.includes(o));
      const share = others.filter((o) => hay.includes(shape(o))).length;
      if (share === 0) return true;
    }
    return false;
  });
}

const stats = {
  files: 0, questions: 0, attached: 0, skipped: 0, leaksCleared: 0, booksAdded: 0,
};
const samples = [];

const files = walk(ROOT).filter((f) => SCOPE.test(f) && (!ONLY || f.includes(ONLY))).sort();

for (const file of files) {
  let data;
  try { data = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
  const questions = Array.isArray(data.questions) ? data.questions : [];
  if (!questions.length) continue;
  const course = courseFor(file);
  if (!course) continue;
  const books = booksForCourse(course).map(loadBook);
  if (!books.length) continue;
  const notesPath = join(dirname(file), 'notes.md');
  const notes = existsSync(notesPath) ? readFileSync(notesPath, 'utf8') : '';
  const assignedPages = pagesFromNotes(notes);
  const hints = topicHints(file, notes, data.title);
  const usedExcerpts = new Set();
  let touched = false;
  stats.files += 1;

  questions.forEach((q) => {
    stats.questions += 1;
    if (q.code) {
      const cleaned = stripAnswerComment(q.code);
      if (cleaned !== q.code) {
        q.code = cleaned;
        touched = true;
        stats.leaksCleared += 1;
      }
      if (codeLeaks(q) || /introduces the indented body/i.test(q.question || '')) {
        delete q.code;
        touched = true;
        stats.leaksCleared += 1;
      }
    }

    const ref = q.reference;
    if (!ref || typeof ref !== 'object' || Array.isArray(ref) || ref.url) {
      stats.skipped += 1;
      return;
    }

    const stem = String(q.question || q.text || '');
    const answers = answerTexts(q).join(' ');
    const qHints = questionHints(q, hints);
    const query = buildQuery([
      { text: stem, weight: 3 },
      { text: answers, weight: 2.5 },
      { text: ref.section || '', weight: 3 },
      { text: qHints.join(' '), weight: 3.5 },
      { text: q.explanation || '', weight: 1.2 },
      { text: data.title || '', weight: 1 },
    ]);
    const keyTerms = [...new Set(terms(ref.section || '').concat(terms(qHints.join(' ')), terms(stem)))]
      .filter((t) => t.length > 2);
    const keyPhrases = qHints.concat(bigrams(ref.section || ''));

    const ranked = books.map((book) => {
      const preferPages = notesPagesForQuestion(notes, book.title, qHints, assignedPages);
      const hits = bestPages(book.pages, book.index, query, {
        phrases: [stem, answers],
        keyPhrases,
        keyTerms,
        limit: 6,
        skipFront: 2,
        preferPages,
        window: preferPages.length ? 10 : 0,
      }).filter((hit) => pageHasTopic(book.pages[hit.page - 1], qHints));
      return hits.length ? hits.map((hit) => ({ book, ...hit })) : [];
    }).flat().sort((a, b) => b.score - a.score);

    if (!ranked.length) {
      stats.skipped += 1;
      return;
    }

    const seenBook = new Set();
    const built = [];
    for (const entry of ranked) {
      if (seenBook.has(entry.book.path)) continue;
      const pageText = entry.book.pages[entry.page - 1] || '';
      const excerpt = bestExcerpt(pageText, entry.book.index, query, usedExcerpts)
        || fallbackExcerpt(pageText, qHints);
      if (!excerpt) continue;
      usedExcerpts.add(excerpt.toLowerCase());
      seenBook.add(entry.book.path);
      built.push({ book: entry.book.title, page: entry.page, excerpt, score: entry.score });
    }

    if (!built.length) {
      stats.skipped += 1;
      return;
    }

    const priorTitle = String(ref.book || '').toLowerCase();
    const prior = priorTitle
      ? built.find((row) => row.book.toLowerCase().includes(priorTitle.split(' by ')[0].slice(0, 18)))
      : null;
    const ordered = prior
      ? [prior, ...built.filter((row) => row.book !== prior.book)]
      : built;

    const head = ordered[0];
    const extras = ordered.slice(1);
    const next = {
      ...(ref.section ? { section: ref.section } : {}),
      book: head.book,
      ...(ref.chapter ? { chapter: ref.chapter } : {}),
      page: head.page,
      excerpt: head.excerpt,
    };
    if (extras.length) {
      next.books = extras.map((row) => ({ book: row.book, page: row.page, excerpt: row.excerpt }));
      stats.booksAdded += extras.length;
    }
    if (ref.lecture) next.lecture = ref.lecture;
    if (ref.slide) next.slide = ref.slide;

    q.reference = next;
    stats.attached += 1;
    touched = true;

    if (samples.length < 8) {
      samples.push({ file, stem, rows: ordered });
    }
  });

  const cited = new Map();
  questions.forEach((q) => {
    const ref = q.reference;
    if (!ref) return;
    const rows = [{ book: ref.book, page: ref.page }, ...(ref.books || [])];
    rows.forEach((row) => {
      if (!row.book) return;
      const prev = cited.get(row.book);
      const page = Number(row.page) || 0;
      if (!prev || (page && page < prev.page)) cited.set(row.book, { book: row.book, page: page || prev?.page || 0 });
    });
  });
  if (cited.size) {
    data.reading = [...cited.values()].map((row) => ({
      book: row.book,
      page: row.page || undefined,
    }));
    touched = true;
  }

  if (touched && WRITE) writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

if (samples.length) {
  console.log('\nsamples:');
  samples.forEach((s) => {
    console.log('\n  ' + s.file.replace(ROOT + '/', ''));
    console.log('  Q: ' + s.stem.slice(0, 100));
    s.rows.forEach((row, i) => {
      console.log('  ' + (i ? '+' : '*') + ' ' + row.book + ' p.' + row.page + ' (' + row.score.toFixed(2) + ')');
      console.log('      "' + String(row.excerpt || '').slice(0, 150) + '"');
    });
  });
}

console.log(WRITE ? '\nREWROTE quiz files' : '\nDRY RUN (pass --write to apply)');
console.log(stats);
