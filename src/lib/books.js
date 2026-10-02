export function bookKey(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const EDITION = /\b(\d+)(st|nd|rd|th)\s+edition\b|\bedition\b|\bvolume\s+\d+\b|\bvol\s+\d+\b|\b\d+nbsped\b|\bchapter\s+\d+\s+only\b|\bsampler\b|\bconference\s+slides\b/g;

/**
 * Title without edition, author, or subtitle noise so the same book written
 * three different ways still resolves to one PDF.
 */
export function titleCore(title) {
  let key = bookKey(title).replace(/\bpdf$/, '');
  key = key.split(/\bby\b/)[0];
  key = key.replace(EDITION, ' ');
  key = key.replace(/\s+/g, ' ').trim();
  return key;
}

function coreTokens(core) {
  return core.split(' ').filter((w) => w.length > 2);
}

function scoreBook(book, wantKey, wantCore) {
  const titleKey = bookKey(book && book.title);
  const fileKey = bookKey(book && book.file).replace(/\bpdf$/, '').trim();
  if (!wantKey) return 0;
  if (titleKey === wantKey || fileKey === wantKey) return 100;

  const haveCore = titleCore(book && book.title) || titleCore(book && book.file);
  if (wantCore && haveCore) {
    if (haveCore === wantCore) return 95;
    if (haveCore.startsWith(wantCore) || wantCore.startsWith(haveCore)) return 90;
  }

  // Distinctive-token overlap on the core title only: generic words like
  // "javascript" alone must not pull in a different JavaScript book.
  const wantTokens = coreTokens(wantCore);
  if (!wantTokens.length) return 0;
  const haveTokens = coreTokens(haveCore + ' ' + fileKey);
  const hit = wantTokens.filter((w) => haveTokens.indexOf(w) !== -1).length;
  const ratio = hit / wantTokens.length;
  if (ratio === 1) return 85;
  if (ratio >= 0.75) return 70;
  if (ratio >= 0.6) return 55;
  return Math.round(ratio * 40);
}

export function findBook(books, title) {
  if (!Array.isArray(books) || !books.length) return null;
  const wantKey = bookKey(title);
  const wantCore = titleCore(title);
  if (!wantKey) return null;
  let best = null;
  let bestScore = 0;
  books.forEach((book) => {
    const score = scoreBook(book, wantKey, wantCore);
    if (score > bestScore) {
      best = book;
      bestScore = score;
    }
  });
  return bestScore >= 55 ? best : null;
}

export function resolveBook(quiz, title) {
  const books = (quiz && quiz.books) || [];
  const named = findBook(books, title);
  if (named) return named;
  if (title) return null;
  if (books.length === 1) return books[0];
  if (quiz && quiz.bookUrl) {
    return { title: quiz.bookFile || 'Book', file: quiz.bookFile || '', url: quiz.bookUrl };
  }
  return null;
}

/** Short label for a reference chip: drops author and edition noise. */
export function shortBookLabel(title) {
  const raw = String(title || '').trim();
  if (!raw) return '';
  const noAuthor = raw.split(/\s+by\s+/i)[0].replace(/\.pdf$/i, '');
  const trimmed = noAuthor.replace(/,\s*(\d+)(st|nd|rd|th)\s+Edition.*$/i, '').trim();
  const out = trimmed || noAuthor;
  return out.length > 46 ? out.slice(0, 45).trimEnd() + '…' : out;
}
