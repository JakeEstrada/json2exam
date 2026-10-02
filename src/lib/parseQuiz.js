// Turns whatever JSON a person hands us into a normalized question bank.
// Pure functions, no React: easy to unit test on its own.

import { extractFence } from './highlight.js';
import { normalizeReading } from './reading.js';

export const LETTERS = 'abcdefghij';
const PREFIX_RE = /^\s*(?:[a-jA-J]|\d{1,2})\s*[).:\-]\s+/;

const TYPE_ALIASES = {
  single: ['single', 'multiple', 'multiple_choice', 'multiplechoice', 'mc', 'choice', 'one', 'radio'],
  multi: ['multi', 'multi_select', 'multiselect', 'multiple_select', 'select_all', 'selectall',
          'select_all_that_apply', 'checkbox', 'many', 'multiple_answer', 'multiple_answers'],
  boolean: ['boolean', 'bool', 'tf', 't/f', 'true_false', 'truefalse', 'true-false', 'yesno', 'yes_no'],
  code: ['code', 'coding', 'exercise', 'practice', 'code_exercise', 'code-exercise'],
};

export function normType(raw) {
  if (typeof raw !== 'string') return null;
  const v = raw.trim().toLowerCase().replace(/\s+/g, '_');
  for (const key of Object.keys(TYPE_ALIASES)) {
    if (TYPE_ALIASES[key].indexOf(v) !== -1) return key;
  }
  return null;
}

function firstDefined() {
  for (let i = 0; i < arguments.length; i++) {
    if (arguments[i] !== undefined && arguments[i] !== null) return arguments[i];
  }
  return undefined;
}

function optionText(o) {
  if (o === null || o === undefined) return '';
  if (typeof o === 'object') {
    return String(firstDefined(o.text, o.label, o.option, o.value, o.answer, ''));
  }
  return String(o);
}

// Accepts ["HTTP", "FTP"] and { A: "HTTP", B: "FTP" }. Letter keys stay A=0, B=1, …
export function toOptionArray(raw) {
  if (raw == null || Array.isArray(raw)) return raw;
  if (typeof raw !== 'object') return raw;
  const keys = Object.keys(raw);
  const letters = keys.filter((k) => /^[A-Za-z]$/.test(k));
  const rest = keys.filter((k) => !/^[A-Za-z]$/.test(k));
  letters.sort((a, b) => a.toLowerCase().charCodeAt(0) - b.toLowerCase().charCodeAt(0));
  return letters.concat(rest).map((k) => raw[k]);
}

// Accepts ["a) HTTP", "b) FTP"] as well as ["HTTP", "FTP"].
export function cleanOptions(list) {
  const rawTexts = list.map(optionText).map((s) => s.trim());
  const hits = rawTexts.filter((s) => PREFIX_RE.test(s)).length;
  const clean = hits >= 2 ? rawTexts.map((s) => s.replace(PREFIX_RE, '').trim()) : rawTexts;
  return { clean, rawTexts };
}

function isTrueFalsePair(list) {
  if (list.length !== 2) return false;
  const a = list.map((s) => s.trim().toLowerCase()).sort();
  return (a[0] === 'false' && a[1] === 'true') || (a[0] === 'no' && a[1] === 'yes');
}

// Turn one answer value into an option index, or -1 when it can't be matched.
export function resolveOne(value, clean, rawTexts) {
  if (typeof value === 'boolean') {
    const target = value ? 'true' : 'false';
    const alt = value ? 'yes' : 'no';
    const i = clean.findIndex((o) => {
      const t = o.trim().toLowerCase();
      return t === target || t === alt;
    });
    if (i >= 0) return i;
    return value ? 0 : 1;
  }

  if (typeof value === 'number' && isFinite(value)) {
    const n = Math.trunc(value);
    if (n >= 0 && n < clean.length) return n;       // 0-based index
    if (n >= 1 && n <= clean.length) return n - 1;  // 1-based fallback
    return -1;
  }

  if (typeof value === 'object' && value !== null) {
    return resolveOne(optionText(value), clean, rawTexts);
  }

  if (typeof value === 'string') {
    const v = value.trim();
    if (!v) return -1;
    const lower = v.toLowerCase();

    let i = clean.findIndex((o) => o.trim().toLowerCase() === lower);
    if (i >= 0) return i;
    i = rawTexts.findIndex((o) => o.trim().toLowerCase() === lower);
    if (i >= 0) return i;

    if (/^[a-j]$/.test(lower)) {
      const idx = LETTERS.indexOf(lower);
      if (idx < clean.length) return idx;
    }
    if (/^\d{1,2}$/.test(lower)) return resolveOne(Number(lower), clean, rawTexts);
    if (lower === 'true' || lower === 'false') return resolveOne(lower === 'true', clean, rawTexts);
    if (lower === 'yes' || lower === 'no') return resolveOne(lower === 'yes', clean, rawTexts);

    // "a, c" or "a and c" written as one string
    const parts = v.split(/[,;/]|\band\b/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1) {
      const all = parts.map((p) => resolveOne(p, clean, rawTexts));
      if (all.every((n) => n >= 0)) return all;
    }
  }

  return -1;
}

function jsonPreview(value) {
  if (value === undefined) return '';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch (e) { return String(value); }
}

function normalizeTests(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((row, i) => {
    if (row == null) return null;
    if (typeof row !== 'object') {
      return { label: 'Example ' + (i + 1), input: String(row), output: '' };
    }
    const call = String(firstDefined(row.call, row.expr, '')).trim();
    const setup = String(firstDefined(row.setup, '')).trim();
    const assert = String(firstDefined(row.assert, row.check, '')).trim();
    const args = Array.isArray(row.args) ? row.args : undefined;
    const hasExpected = Object.prototype.hasOwnProperty.call(row, 'expected')
      || Object.prototype.hasOwnProperty.call(row, 'result');
    const expected = Object.prototype.hasOwnProperty.call(row, 'expected')
      ? row.expected
      : (Object.prototype.hasOwnProperty.call(row, 'result') ? row.result : undefined);
    const input = jsonPreview(firstDefined(row.input, call, args, ''));
    const output = jsonPreview(firstDefined(row.output, hasExpected ? expected : ''));
    if (!input && !output && !call && !setup && !assert && !args) return null;
    const out = {
      label: String(firstDefined(row.label, row.name, 'Example ' + (i + 1))),
      input,
      output,
    };
    if (call) out.call = call;
    if (setup) out.setup = setup;
    if (assert) out.assert = assert;
    if (args) out.args = args;
    if (hasExpected) out.expected = expected;
    if (row.fn) out.fn = String(row.fn);
    return out;
  }).filter(Boolean);
}

function readLevel(raw, type) {
  const n = Number(firstDefined(raw.level, raw.stage, raw.tier, 0));
  if (n >= 1 && n <= 3 && isFinite(n)) return Math.trunc(n);
  if (type === 'code') return 3;
  return 1;
}

function takePromptAndCode(raw, text) {
  const extracted = extractFence(text);
  const code = String(firstDefined(raw.code, raw.snippet, extracted.code, '')).trim();
  const prompt = extracted.code ? (extracted.prompt || text) : text;
  return { text: prompt || text, code };
}

function withCode(question, raw, originalText) {
  const taken = takePromptAndCode(raw, originalText);
  question.text = taken.text;
  if (taken.code) question.code = taken.code;
  const passage = String(firstDefined(raw.passage, raw.problem, raw.statement, '')).trim();
  if (passage) question.passage = passage;
  const solution = String(firstDefined(raw.solution, raw.model, '')).trim();
  if (solution) {
    question.solution = solution;
    question.solutionLanguage = String(
      firstDefined(raw.solutionLanguage, raw.solution_lang, raw.language, 'python')
    ).trim() || 'python';
  }
  return question;
}

function normalizeCodeQuestion(raw, i, text) {
  const language = String(firstDefined(raw.language, raw.lang, 'javascript')).trim() || 'javascript';
  const starter = String(firstDefined(raw.starter, raw.starterCode, raw.template, ''));
  const solution = String(firstDefined(raw.solution, raw.model, ''));
  const hints = Array.isArray(raw.hints)
    ? raw.hints.map((h) => String(h || '').trim()).filter(Boolean)
    : [];
  return {
    question: withCode({
      id: i + '::' + text.slice(0, 90),
      text,
      type: 'code',
      language,
      starter,
      tests: normalizeTests(firstDefined(raw.tests, raw.examples, [])),
      solution,
      hints,
      options: [],
      answers: [],
      explanation: String(firstDefined(raw.explanation, raw.rationale, raw.note, '')).trim(),
      reference: readReference(raw),
      level: readLevel(raw, 'code'),
      index: i,
    }, raw, text),
  };
}

export function normalizeQuestion(raw, i) {
  const label = 'Question ' + (i + 1);

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { error: label + ' is not an object.' };
  }

  const text = String(firstDefined(raw.question, raw.prompt, raw.text, raw.q, '')).trim();
  if (!text) return { error: label + ' has no question text.' };

  const shortLabel = text.length > 52 ? text.slice(0, 52) + '…' : text;
  const earlyType = normType(raw.type);
  if (earlyType === 'code') return normalizeCodeQuestion(raw, i, text);

  const answerRaw = firstDefined(raw.answer, raw.correct, raw.correctAnswer,
                                 raw.correct_answer, raw.answers, raw.key);
  if (answerRaw === undefined) return { error: '"' + shortLabel + '" has no answer.' };

  let optionList = toOptionArray(firstDefined(raw.options, raw.choices));
  let type = normType(raw.type);

  if (!type) {
    if (Array.isArray(answerRaw) && answerRaw.length > 1) type = 'multi';
    else if (!optionList && (typeof answerRaw === 'boolean' || /^(true|false|yes|no)$/i.test(String(answerRaw)))) type = 'boolean';
    else if (Array.isArray(optionList) && isTrueFalsePair(optionList.map(optionText))) type = 'boolean';
    else type = 'single';
  }

  if (type === 'boolean' && !Array.isArray(optionList)) optionList = ['True', 'False'];

  if (!Array.isArray(optionList) || optionList.length < 2) {
    return { error: '"' + shortLabel + '" needs at least two options.' };
  }

  const { clean, rawTexts } = cleanOptions(optionList);
  if (clean.some((o) => !o)) return { error: '"' + shortLabel + '" has an empty option.' };

  const values = Array.isArray(answerRaw) ? answerRaw : [answerRaw];
  const indices = [];
  for (const v of values) {
    const got = resolveOne(v, clean, rawTexts);
    const many = Array.isArray(got) ? got : [got];
    for (const n of many) {
      if (n < 0) return { error: '"' + shortLabel + '" has an answer that matches no option.' };
      if (indices.indexOf(n) === -1) indices.push(n);
    }
  }
  indices.sort((a, b) => a - b);

  if (type !== 'multi' && indices.length > 1) type = 'multi';

  const question = withCode({
    id: i + '::' + text.slice(0, 90),
    text,
    type,
    options: clean,
    answers: indices,
    explanation: String(firstDefined(raw.explanation, raw.rationale, raw.note, '')).trim(),
    reference: readReference(raw),
    level: readLevel(raw, type),
    index: i,
  }, raw, text);

  if (question.code && leaksAnswer(question.code, clean, indices)) question.codeRevealsAnswer = true;

  return { question };
}

function codeShape(text) {
  return String(text || '').toLowerCase().replace(/\s+/g, '');
}

/** True when the snippet shown above the options spells out the correct choice. */
export function leaksAnswer(code, options, answers) {
  const hay = codeShape(code);
  if (hay.length < 2) return false;
  const others = (options || []).filter((_, i) => (answers || []).indexOf(i) === -1);
  const otherShapes = others.map((o) => codeShape(String(o || '').replace(/[`]/g, '')));

  return (answers || []).some((idx) => {
    const raw = String(options[idx] || '').replace(/[`]/g, '').trim();
    const needle = codeShape(raw);
    try {
      const annotated = new RegExp(
        raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\)?\\s*#\\s*(true|false)',
        'i'
      );
      if (annotated.test(String(code))) return true;
    } catch (_) { /* ignore bad option text */ }
    if (needle.length >= 1 && hay.includes(needle)) {
      const othersShare = otherShapes.filter((s) => s && hay.includes(s)).length;
      if (othersShare === 0) return true;
      if (needle.length >= 3 && othersShare < otherShapes.length) return true;
    }
    if (raw.split(/\s+/).length > 6) return false;
    const tokens = raw.split(/[^A-Za-z0-9_]+/).filter((t) => t.length >= 3);
    return tokens.some((t) => {
      const tok = t.toLowerCase();
      if (!hay.includes(tok)) return false;
      return !otherShapes.some((s) => s.includes(tok));
    });
  });
}

export function headingId(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/['’"“”]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function positiveInt(value) {
  const n = Number(value);
  return n >= 1 && isFinite(n) ? Math.trunc(n) : 0;
}

function readCitation(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const book = String(firstDefined(raw.book, raw.title, '')).trim();
  const excerpt = String(firstDefined(raw.excerpt, raw.quote, '')).trim();
  const page = positiveInt(firstDefined(raw.page, raw.pdfPage, 0));
  const pageEnd = positiveInt(firstDefined(raw.pageEnd, raw.endPage, 0));
  const chapter = String(firstDefined(raw.chapter, '')).trim();
  if (!book && !excerpt && !page) return null;
  return { book, chapter, page, pageEnd, excerpt };
}

function dedupeCitations(list) {
  const seen = new Set();
  const out = [];
  list.forEach((row) => {
    if (!row) return;
    const key = row.book.toLowerCase() + '::' + row.page;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(row);
  });
  return out;
}

function readReference(raw) {
  const refRaw = firstDefined(raw.reference, raw.ref, raw.source);
  if (!refRaw || typeof refRaw !== 'object' || Array.isArray(refRaw)) return null;
  const section = String(firstDefined(refRaw.section, refRaw.notes, refRaw.heading, '')).trim();
  const lecture = String(firstDefined(refRaw.lecture, refRaw.transcript, '')).trim();
  const url = String(firstDefined(refRaw.url, refRaw.link, refRaw.href, '')).trim();
  const slide = positiveInt(firstDefined(refRaw.slide, refRaw.slides, 0));

  const extraRaw = firstDefined(refRaw.books, refRaw.sources, refRaw.citations, null);
  const extra = Array.isArray(extraRaw) ? extraRaw.map(readCitation) : [];
  const citations = dedupeCitations([readCitation(refRaw)].concat(extra));
  const primary = citations[0] || { book: '', chapter: '', page: 0, pageEnd: 0, excerpt: '' };

  if (!section && !citations.length && !lecture && !slide && !url) return null;
  return {
    section,
    book: primary.book,
    chapter: primary.chapter || String(firstDefined(refRaw.chapter, '')).trim(),
    excerpt: primary.excerpt,
    page: primary.page,
    pageEnd: primary.pageEnd,
    lecture,
    slide,
    url,
    citations,
  };
}

export function normalizeQuiz(data, fallbackTitle) {
  let list = null;
  let title = fallbackTitle || 'Untitled deck';
  let brain = null;
  let reading = [];
  let sheet = [];

  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === 'object') {
    list = firstDefined(data.questions, data.items, data.cards, data.quiz, data.deck);
    if (data.title) title = String(data.title);
    else if (data.name) title = String(data.name);
    const tagged = firstDefined(data.brain, data.brainId, data.assistant);
    if (tagged) brain = String(tagged);
    reading = normalizeReading(firstDefined(data.reading, data.chapters, data.sources, []));
    const sheetRaw = firstDefined(data.sheet, data.cheatsheet, []);
    sheet = Array.isArray(sheetRaw) ? sheetRaw.map((s) => String(s || '').trim()).filter(Boolean) : (String(sheetRaw || '').trim() ? [String(sheetRaw).trim()] : []);
  }

  let deal = 'level';
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const rawDeal = String(firstDefined(data.deal, data.dealMode, data.order, '')).trim().toLowerCase();
    if (rawDeal === 'random' || rawDeal === 'shuffle') deal = 'random';
  }

  if (!Array.isArray(list)) {
    throw new Error('Expected a list of questions, either at the top level or under a "questions" key.');
  }
  if (!list.length) throw new Error('That file has no questions in it.');

  const questions = [];
  const skipped = [];
  list.forEach((raw, i) => {
    const out = normalizeQuestion(raw, i);
    if (out.error) skipped.push(out.error);
    else questions.push(out.question);
  });

  if (!questions.length) {
    throw new Error('None of the ' + list.length + ' questions could be read. ' + skipped[0]);
  }
  return { title, questions, skipped, brain, reading, sheet, deal };
}

// JSON.parse errors are terse; point at the line instead of the byte offset.
export function describeJsonError(err, source) {
  const m = /position (\d+)/.exec(err.message || '');
  if (!m) return err.message;
  const pos = Number(m[1]);
  const upTo = source.slice(0, pos);
  const line = upTo.split('\n').length;
  const col = pos - upTo.lastIndexOf('\n');
  return err.message.replace(/at position \d+/, 'on line ' + line + ', column ' + col);
}
