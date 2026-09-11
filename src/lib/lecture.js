const SCRIBE_RE = /^\(Transcribed by TurboScribe\.[^)]*\)\s*$/i;

export function lectureParagraphs(source) {
  return String(source || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p && !SCRIBE_RE.test(p));
}

export function normLecture(s) {
  return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

export function matchingLectureIndexes(paras, quote) {
  const q = normLecture(quote);
  if (!q || q.length < 16) return [];
  const hits = [];
  paras.forEach((p, i) => {
    const n = normLecture(p);
    if (!n) return;
    if (n.indexOf(q) !== -1 || (q.indexOf(n) !== -1 && n.length >= 40)) hits.push(i);
  });
  return hits;
}
