export function bookKey(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreBook(book, want) {
  const titleKey = bookKey(book && book.title);
  const fileKey = bookKey(book && book.file);
  if (!want) return 0;
  if (titleKey === want || fileKey === want) return 100;
  if (titleKey.startsWith(want) || want.startsWith(titleKey)) return 85;
  if (fileKey.startsWith(want) || want.startsWith(fileKey.replace(/ pdf$/, ''))) return 80;
  if (titleKey.includes(want) || want.includes(titleKey)) return 70;
  if (fileKey.includes(want)) return 65;
  const tokens = want.split(' ').filter((w) => w.length > 2);
  if (!tokens.length) return 0;
  const hay = (titleKey + ' ' + fileKey).split(' ');
  const hit = tokens.filter((w) => hay.indexOf(w) !== -1).length;
  return Math.round((hit / tokens.length) * 50);
}

export function findBook(books, title) {
  if (!Array.isArray(books) || !books.length) return null;
  const want = bookKey(title);
  if (!want) return null;
  let best = null;
  let bestScore = 0;
  books.forEach((book) => {
    const score = scoreBook(book, want);
    if (score > bestScore) {
      best = book;
      bestScore = score;
    }
  });
  return bestScore >= 40 ? best : null;
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
