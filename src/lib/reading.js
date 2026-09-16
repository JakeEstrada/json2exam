import { bookKey, findBook } from './books.js';

function headingId(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/['’"“”]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function pageNum(value) {
  const n = Number(value);
  return n >= 1 && isFinite(n) ? Math.trunc(n) : 0;
}

function normalizeSection(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const heading = String(raw.heading || raw.section || raw.title || '').trim();
  const page = pageNum(raw.page);
  if (!heading && !page) return null;
  return {
    heading,
    page,
    pageEnd: pageNum(raw.pageEnd),
  };
}

export function normalizeReading(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    if (!row || typeof row !== 'object') return null;
    const book = String(row.book || row.title || '').trim();
    const chapter = String(row.chapter || row.label || '').trim();
    const page = pageNum(row.page);
    if (!book && !chapter && !page) return null;
    const sections = Array.isArray(row.sections)
      ? row.sections.map(normalizeSection).filter(Boolean)
      : [];
    return {
      book,
      chapter,
      page,
      pageEnd: pageNum(row.pageEnd),
      sections,
    };
  }).filter(Boolean);
}

function scoreTitle(have, want) {
  const left = bookKey(have);
  const right = bookKey(want);
  if (!left || !right) return 0;
  if (left === right) return 100;
  if (left.startsWith(right) || right.startsWith(left)) return 85;
  if (left.includes(right) || right.includes(left)) return 70;
  const tokens = right.split(' ').filter((w) => w.length > 2);
  if (!tokens.length) return 0;
  const hay = left.split(' ');
  return Math.round((tokens.filter((w) => hay.indexOf(w) !== -1).length / tokens.length) * 50);
}

export function matchReading(reading, bookTitle) {
  const list = Array.isArray(reading) ? reading : [];
  if (!list.length) return null;
  const want = String(bookTitle || '').trim();
  if (!want) return list[0];
  let best = null;
  let bestScore = 0;
  list.forEach((row) => {
    const score = Math.max(scoreTitle(row.book, want), scoreTitle(row.chapter, want));
    if (score > bestScore) {
      best = row;
      bestScore = score;
    }
  });
  return bestScore >= 40 ? best : list[0];
}

function sectionFor(entry, heading) {
  const want = headingId(heading);
  if (!want || !entry || !Array.isArray(entry.sections)) return null;
  return entry.sections.find((row) => headingId(row.heading) === want) || null;
}

export function resolveReading(quiz, focus) {
  const reading = (quiz && quiz.reading) || [];
  const heading = (focus && (focus.heading || focus.section)) || '';
  const requestedBook = (focus && focus.book) || '';
  const entry = matchReading(reading, requestedBook);
  const section = sectionFor(entry, heading);
  const page = pageNum(focus && focus.page) || (section && section.page) || (entry && entry.page) || 0;
  const pageEnd = pageNum(focus && focus.pageEnd)
    || (section && section.pageEnd)
    || (entry && entry.pageEnd)
    || 0;
  const book = requestedBook || (entry && entry.book) || '';
  const found = findBook((quiz && quiz.books) || [], book);
  return {
    book,
    chapter: (entry && entry.chapter) || '',
    section: heading,
    page,
    pageEnd,
    excerpt: (focus && focus.excerpt) || '',
    bookUrl: found && found.url,
    bookTitle: (found && found.title) || book,
  };
}

export function formatAskNotes(quiz) {
  const lines = [];
  const reading = (quiz && quiz.reading) || [];
  if (reading.length) {
    lines.push('Assigned reading for this module. If the student asks for a book or chapter reference, cite these chapters and PDF pages — not a different chapter.');
    reading.forEach((row) => {
      const where = row.page
        ? ' (PDF p. ' + row.page + (row.pageEnd ? '–' + row.pageEnd : '') + ')'
        : '';
      lines.push('- ' + (row.book || 'Book') + (row.chapter ? ' — ' + row.chapter : '') + where);
      (row.sections || []).forEach((section) => {
        if (!section.heading) return;
        lines.push('  - ' + section.heading + (section.page ? ' (PDF p. ' + section.page + ')' : ''));
      });
    });
    lines.push('');
  }
  const notes = String((quiz && quiz.notes) || '').trim();
  if (notes) {
    lines.push('Study notes for this deck:');
    lines.push(notes);
  }
  return lines.join('\n');
}
