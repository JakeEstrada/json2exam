/**
 * Page-level text extraction + scoring helpers shared by the reference tools.
 * Text is cached under .cache/book-text so repeat runs are cheap.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, basename } from 'node:path';
import { canonicalBookTitle } from '../../src/lib/bookTitles.js';

const CACHE_DIR = '.cache/book-text';
const CACHE_VERSION = 'v2';

export const SHARED_SOURCES = {
  'applied-classroom/css': ['applied-classroom/html'],
  'applied-classroom/html': ['applied-classroom/css'],
  'applied-classroom/leetcode': ['applied-classroom/algorithms', 'applied-classroom/data-structures'],
  'applied-classroom/algorithms': ['applied-classroom/data-structures'],
  'applied-classroom/data-structures': ['applied-classroom/algorithms'],
};

export function bookTitleFor(file) {
  return canonicalBookTitle(basename(file));
}

export function booksForCourse(course) {
  const out = [];
  const seen = new Set();
  const add = (folder) => {
    const dir = join(folder, 'sources');
    if (!existsSync(dir)) return;
    for (const file of readdirSync(dir)) {
      if (!/\.pdf$/i.test(file) || seen.has(file)) continue;
      seen.add(file);
      out.push({ path: join(dir, file), file, title: bookTitleFor(file) });
    }
  };
  add(course);
  (SHARED_SOURCES[course] || []).forEach(add);
  return out;
}

// Pirate-copy watermarks and scan furniture that would otherwise end up quoted.
const JUNK_LINE = /(telegram\s*:\s*@|t\.me\/|dokumen\.pub|www\.|https?:\/\/|@uni_k|free ebooks? at|downloaded from)/i;

function cleanPage(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .replace(/[\u00ad]/g, '')
    .replace(/(\w)-\n(\w)/g, '$1$2')       // de-hyphenate across line breaks
    .replace(/\u2019/g, '’')
    .split('\n')
    .filter((line) => !JUNK_LINE.test(line))
    .join('\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/** Array of page strings, 1-based: pages[0] is PDF page 1. */
export function pagesOf(pdfPath) {
  mkdirSync(CACHE_DIR, { recursive: true });
  const stamp = createHash('sha1').update(CACHE_VERSION + '::' + pdfPath).digest('hex').slice(0, 16);
  const cache = join(CACHE_DIR, stamp + '.json');
  if (existsSync(cache)) return JSON.parse(readFileSync(cache, 'utf8'));
  const raw = execFileSync('pdftotext', ['-enc', 'UTF-8', pdfPath, '-'], {
    maxBuffer: 1024 * 1024 * 512,
    encoding: 'utf8',
  });
  const pages = raw.split('\f').map(cleanPage);
  writeFileSync(cache, JSON.stringify(pages));
  return pages;
}

const STOP = new Set(('a an the and or but if then than that this these those those of in on at to for from with '
  + 'without into onto over under about above below after before while during as is are was were be been being am '
  + 'do does did done have has had having will would should could can may might must not no nor so such own same '
  + 'other another any all both each few more most some only very you your yours we our they them their it its i '
  + 'he she his her him who whom whose which what when where why how there here also just too up down out off again '
  + 'once because between through against during above below s t don now use used using uses make makes made get '
  + 'gets got like want need needs one two three first second next last example figure chapter page see also').split(' '));

export function terms(text) {
  const out = [];
  const raw = String(text || '').toLowerCase();
  const matches = raw.match(/[a-z][a-z0-9_+#.-]{1,}/g) || [];
  for (let w of matches) {
    w = w.replace(/^[.\-+#]+|[.\-+#]+$/g, '');
    if (w.length < 3 || STOP.has(w)) continue;
    out.push(w);
  }
  return out;
}

/** Document frequency per term across pages, for IDF weighting. */
export function buildIndex(pages) {
  const df = new Map();
  const pageTerms = pages.map((text) => {
    const set = new Set(terms(text));
    set.forEach((t) => df.set(t, (df.get(t) || 0) + 1));
    return set;
  });
  return { df, pageTerms, total: pages.length || 1 };
}

export function idf(index, term) {
  const n = index.df.get(term) || 0;
  if (!n) return 0;
  return Math.log((index.total + 1) / (n + 0.5));
}

/**
 * Terms in the book that start with a query term, so "dict" also finds
 * "dictcomp"/"dictionary" and "shard" finds "sharding". Cached per index.
 */
function expandTerm(index, term) {
  if (!index.expansions) index.expansions = new Map();
  if (index.expansions.has(term)) return index.expansions.get(term);
  let list = [];
  if (index.df.has(term)) list.push(term);
  if (term.length >= 4) {
    for (const known of index.df.keys()) {
      if (known !== term && known.startsWith(term) && known.length <= term.length + 6) list.push(known);
    }
  }
  if (!list.length) list = [];
  index.expansions.set(term, list);
  return list;
}

/** Adjacent content-word pairs, e.g. "dict comprehension". */
export function bigrams(text) {
  const list = terms(text);
  const out = [];
  for (let i = 0; i + 1 < list.length; i += 1) out.push(list[i] + ' ' + list[i + 1]);
  return out;
}

const EXERCISE_PAGE = /try it yourself|exercises?\s*$|^\s*\d{1,2}-\d{1,2}\./im;

/** How much of a page reads like explanatory text rather than lists or code. */
function proseFactor(text) {
  const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 4) return 0.5;
  const sentenceLines = lines.filter((l) => l.length > 55 && /[a-z]\s/.test(l) && /[.!?]/.test(l)).length;
  const ratio = sentenceLines / lines.length;
  let factor = 0.6 + Math.min(ratio, 0.6);
  if (EXERCISE_PAGE.test(text)) factor *= 0.75;
  return factor;
}

/**
 * Builds a weighted query from labelled fields so the question stem and the
 * correct answer outrank the deck title or a long explanation.
 * fields: [{ text, weight }]
 */
export function buildQuery(fields) {
  const weights = new Map();
  for (const { text, weight } of fields) {
    if (!text || !weight) continue;
    for (const term of new Set(terms(text))) {
      weights.set(term, Math.max(weights.get(term) || 0, weight));
    }
  }
  return weights;
}

/**
 * Best page for a weighted query. Returns [{ page (1-based), score, coverage }].
 * Scores distinctive terms higher and rewards exact phrase hits.
 */
function collectPages(text) {
  const pages = [];
  const re = /(?:PDF\s*)?p(?:age)?s?\.?\s*(\d+)(?:\s*[–-]\s*(\d+))?/gi;
  let m;
  while ((m = re.exec(String(text || '')))) {
    const start = Number(m[1]);
    const end = Number(m[2] || m[1]);
    if (!start) continue;
    const last = Math.min(end, start + 30);
    for (let n = start; n <= last; n += 1) pages.push(n);
  }
  return [...new Set(pages)];
}

/**
 * PDF pages cited in lesson notes, grouped by the book named on that line.
 * Applying Crash Course page 54 to Fluent Python is how random quotes happen.
 */
export function pagesFromNotes(notes) {
  const byBook = [];
  const global = collectPages(notes);
  for (const line of String(notes || '').split('\n')) {
    const pages = collectPages(line);
    if (!pages.length) continue;
    const hint = line.replace(/^[-*]\s*/, '').split(/\s+(?:—|--|–|Chapter|ch\.)\s+/i)[0].trim();
    if (hint.length > 8) byBook.push({ hint, pages });
  }
  return { global, byBook };
}

export function notesPagesForBook(assigned, bookTitle) {
  if (!assigned) return [];
  const title = String(bookTitle || '').toLowerCase();
  const titleBits = title.split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  let best = [];
  let bestHit = 0;
  for (const row of assigned.byBook || []) {
    const hint = row.hint.toLowerCase();
    if (title.includes(hint.slice(0, 18)) || hint.includes(title.split(',')[0].slice(0, 18))) {
      return row.pages;
    }
    const hintBits = hint.split(/[^a-z0-9]+/).filter((w) => w.length > 3);
    const hit = hintBits.filter((w) => titleBits.includes(w)).length;
    if (hit > bestHit && hit >= 2) {
      bestHit = hit;
      best = row.pages;
    }
  }
  return best;
}

export function bestPages(pages, index, query, { phrases = [], keyPhrases = [], limit = 5, skipFront = 0, keyTerms = [], preferPages = [], window = 14 } = {}) {
  const queryWeights = query instanceof Map ? query : buildQuery([{ text: query, weight: 1 }]);
  const expanded = new Map();
  for (const term of queryWeights.keys()) {
    const list = expandTerm(index, term);
    if (list.length) expanded.set(term, list);
  }
  const wanted = [...expanded.keys()];
  if (!wanted.length) return [];
  const weights = new Map(wanted.map((t) => {
    const best = Math.max(...expanded.get(t).map((e) => idf(index, e)));
    return [t, best * queryWeights.get(t)];
  }));
  const maxScore = wanted.reduce((sum, t) => sum + weights.get(t), 0) || 1;
  const keySet = new Set(keyTerms.filter((t) => expanded.has(t)));
  const keyWeight = [...keySet].reduce((sum, t) => sum + weights.get(t), 0) || 1;

  const allowed = new Set();
  for (const p of preferPages) {
    for (let n = p - window; n <= p + window; n += 1) if (n >= 1) allowed.add(n);
  }

  const scored = [];
  for (let i = skipFront; i < pages.length; i += 1) {
    if (allowed.size && !allowed.has(i + 1)) continue;
    const set = index.pageTerms[i];
    if (!set || set.size < 12) continue;
    let score = 0;
    let hits = 0;
    let keyHit = 0;
    for (const t of wanted) {
      if (expanded.get(t).some((e) => set.has(e))) {
        score += weights.get(t);
        hits += 1;
        if (keySet.has(t)) keyHit += weights.get(t);
      }
    }
    if (!hits) continue;
    const lower = pages[i].toLowerCase().replace(/\s+/g, ' ');
    for (const phrase of keyPhrases) {
      if (phrase.length > 7 && lower.includes(phrase)) score += maxScore * 0.45;
    }
    for (const phrase of phrases) {
      const p = String(phrase || '').toLowerCase().replace(/\s+/g, ' ').trim();
      if (p.length > 12 && lower.includes(p)) score += maxScore * 0.5;
    }
    score *= proseFactor(pages[i]);
    if (preferPages.includes(i + 1)) score += 0.35;
    scored.push({
      page: i + 1,
      score: score / maxScore,
      hits,
      coverage: hits / wanted.length,
      keyCoverage: keySet.size ? keyHit / keyWeight : 1,
    });
  }
  scored.sort((a, b) => b.score - a.score);

  // Second stage: among plausible pages, prefer the one the book actually
  // devotes to the topic (section heading, repeated mentions) over a page that
  // merely name-drops it once.
  const shortlist = scored.slice(0, 30);
  for (const row of shortlist) {
    const text = pages[row.page - 1] || '';
    const flat = text.toLowerCase().replace(/\s+/g, ' ');
    let phraseCount = 0;
    let headingHit = 0;
    for (const phrase of keyPhrases) {
      if (phrase.length < 8) continue;
      phraseCount += occurrences(flat, phrase);
      if (headingsOf(text).some((h) => h.includes(phrase))) headingHit = 1;
    }
    let keyFreq = 0;
    for (const t of keySet) {
      for (const e of expanded.get(t)) keyFreq += occurrences(flat, e);
    }
    row.refined = row.score
      + Math.min(phraseCount, 3) * 0.3
      + headingHit * 0.7
      + Math.min(keyFreq / 8, 1) * 0.25;
  }
  shortlist.sort((a, b) => b.refined - a.refined);
  return shortlist.slice(0, limit).map((row) => ({ ...row, score: row.refined }));
}

function occurrences(hay, needle) {
  if (!needle) return 0;
  let count = 0;
  let at = hay.indexOf(needle);
  while (at !== -1) { count += 1; at = hay.indexOf(needle, at + needle.length); }
  return count;
}

/** Lines that look like section headings, lowercased. */
function headingsOf(text) {
  const out = [];
  for (const line of String(text || '').split('\n')) {
    const l = line.trim();
    if (!l || l.length > 70 || /[.;:,]$/.test(l)) continue;
    const words = l.split(/\s+/);
    if (words.length > 8) continue;
    const capped = words.filter((w) => /^[A-Z0-9]/.test(w)).length;
    if (capped / words.length >= 0.6) out.push(l.toLowerCase());
  }
  return out;
}

function tidySentence(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/^[^A-Za-z0-9“"(\[]+/, '')
    .trim();
}

// Captions, exercise prompts, and headings read terribly as a quoted reference.
const NOT_PROSE_START = /^(example|figure|table|listing|exercise|chapter|part|appendix|index|try it yourself|note|tip|warning|summary|contents)\b/i;
const EXERCISE_LABEL = /^\d{1,2}[-.]\d{1,2}\b|\b\d{1,2}-\d{1,2}\.\s*$/;
const DEFINING = /\b(is|are|was|were|means|defines?|describes?|builds?|creates?|returns?|produces?|allows?|lets?|provides?|happens?|occurs?|causes?|requires?|stores?|holds?|represents?|works?|behaves?|refers?)\b/i;

function prosey(sentence) {
  if (sentence.length < 50 || sentence.length > 320) return false;
  const letters = (sentence.match(/[a-z]/gi) || []).length;
  if (letters / sentence.length < 0.62) return false;            // tables, code, TOC dots
  if (/\.{3,}|·{2,}|\u2026\s*\d+$/.test(sentence)) return false; // table-of-contents rows
  if ((sentence.match(/\d/g) || []).length > sentence.length * 0.12) return false;
  if (NOT_PROSE_START.test(sentence) || EXERCISE_LABEL.test(sentence)) return false;
  if (/\btry it yourself\b|\b\d{1,2}-\d{1,2}\.\s+[A-Z]/i.test(sentence)) return false;
  if (/\b(Go|Java|Ruby|Rust) has\b/.test(sentence)) return false;
  if (/[A-Z]{6,}\s+[A-Z]{3,}/.test(sentence)) return false;      // run-in ALL CAPS headings
  const words = sentence.split(/\s+/);
  if (words.length < 9) return false;
  const upperWords = words.filter((w) => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
  if (upperWords / words.length > 0.3) return false;
  if (!/[.!?”"]$/.test(sentence)) return false;                  // truncated fragments
  return true;
}

/** Prefer explanatory sentences over narration or code-dense lines. */
function sentenceQuality(sentence) {
  let factor = 1;
  if (DEFINING.test(sentence)) factor *= 1.35;
  const codeish = (sentence.match(/[=<>{}()\[\]`|]/g) || []).length;
  if (codeish > sentence.length * 0.05) factor *= 0.7;
  if (sentence.length < 70) factor *= 0.85;
  if (sentence.length > 240) factor *= 0.85;
  return factor;
}

export function sentencesOf(pageText) {
  const flat = String(pageText || '').replace(/\n+/g, ' ');
  const parts = flat.split(/(?<=[.!?])\s+(?=[A-Z“"(])/);
  const out = [];
  for (let i = 0; i < parts.length; i += 1) {
    let s = tidySentence(parts[i]);
    if (!s) continue;
    if (s.length < 60 && i + 1 < parts.length) s = tidySentence(s + ' ' + parts[i + 1]);
    out.push(s);
  }
  return out;
}

/** Highest-coverage prose sentence on a page, avoiding excerpts already used. */
export function bestExcerpt(pageText, index, query, used = new Set()) {
  const queryWeights = query instanceof Map ? query : buildQuery([{ text: query, weight: 1 }]);
  const wanted = new Set([...queryWeights.keys()].filter((t) => idf(index, t) > 0));
  if (!wanted.size) return '';
  const weights = new Map([...wanted].map((t) => [t, idf(index, t) * queryWeights.get(t)]));
  let best = '';
  let bestScore = 0;
  for (const sentence of sentencesOf(pageText)) {
    if (!prosey(sentence)) continue;
    const set = new Set(terms(sentence));
    let score = 0;
    for (const t of wanted) if (set.has(t)) score += weights.get(t);
    if (!score) continue;
    if (used.has(sentence.toLowerCase())) score *= 0.2;
    score *= sentenceQuality(sentence);
    if (score > bestScore) { bestScore = score; best = sentence; }
  }
  return best.length > 300 ? best.slice(0, 297).trimEnd() + '…' : best;
}
