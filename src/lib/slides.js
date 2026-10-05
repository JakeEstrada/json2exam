import { queryTokens } from './pdfHighlight.js';

const ONES = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS = { twenty: 20, thirty: 30 };
const NUM = String.raw`(?:\d+|twenty[-\s](?:one|two|three|four|five|six|seven|eight|nine)|thirty|twenty|nineteen|eighteen|seventeen|sixteen|fifteen|fourteen|thirteen|twelve|eleven|ten|nine|eight|seven|six|five|four|three|two|one)`;
const SLIDE_RE = new RegExp(
  String.raw`\bslides?\s+(?:number\s+)?(?:from\s+(?:starting\s+from\s+)?)?(${NUM})(?:\s*(?:[-– - ,/]|to|through|and)\s*(?:and\s+)?(${NUM}))?`,
  'gi'
);

export function parseSlideNum(raw) {
  const s = String(raw || '').trim().toLowerCase().replace(/-/g, ' ');
  if (/^\d+$/.test(s)) return Number(s);
  if (ONES[s]) return ONES[s];
  if (TENS[s]) return TENS[s];
  const parts = s.split(/\s+/);
  if (parts.length === 2 && TENS[parts[0]] && ONES[parts[1]]) {
    return TENS[parts[0]] + ONES[parts[1]];
  }
  return 0;
}

export function slideMentions(text) {
  const src = String(text || '');
  const out = [];
  const re = new RegExp(SLIDE_RE.source, 'gi');
  let m = re.exec(src);
  while (m) {
    const start = parseSlideNum(m[1]);
    const end = parseSlideNum(m[2]);
    if (start >= 1) {
      out.push({
        start,
        end: end >= start ? end : start,
        index: m.index,
        length: m[0].length,
        text: m[0],
      });
    }
    m = re.exec(src);
  }
  return out;
}

export function firstSlideRange(text) {
  const all = slideMentions(text);
  return all.length ? { start: all[0].start, end: all[0].end } : null;
}

export function firstSlideMention(text) {
  const range = firstSlideRange(text);
  return range ? range.start : 0;
}

export function formatSlideRange(range) {
  if (!range || !range.start) return '';
  if (range.end > range.start) return 'Slides ' + range.start + '–' + range.end;
  return 'Slide ' + range.start;
}

export function slideHighlightQuery(text) {
  return String(text || '')
    .replace(new RegExp(SLIDE_RE.source, 'gi'), ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slidePageList(start, end, total) {
  const from = Math.max(1, Number(start) || 1);
  const rawEnd = Number(end) || 0;
  let to = rawEnd > from ? rawEnd : from + 2;
  if (total >= 1) to = Math.min(to, total);
  if (to < from) to = from;
  if (to - from >= 12) to = from + 11;
  const pages = [];
  for (let n = from; n <= to; n += 1) pages.push(n);
  return pages;
}

export function findBestSlidePages(pageTexts, query, bounds) {
  const pages = Array.isArray(pageTexts) ? pageTexts : [];
  const n = pages.length;
  const limited = !!(bounds && bounds.from >= 1);
  const from = limited ? Math.min(n || 1, Math.trunc(bounds.from)) : 1;
  const to = limited && bounds.to >= from ? Math.min(n || from, Math.trunc(bounds.to)) : n;
  const prefer = limited && bounds.fallback >= from && bounds.fallback <= to
    ? Math.trunc(bounds.fallback)
    : from;
  const fallback = limited
    ? { start: prefer || 1, end: prefer || 1 }
    : { start: 1, end: Math.min(3, n || 1) };
  if (!n) return { start: 1, end: 1 };
  const keys = queryTokens(slideHighlightQuery(query));
  if (keys.length < 2) return fallback;

  const lo = from - 1;
  const hi = Math.max(lo, (to || n) - 1);
  const sets = pages.map(() => ({}));
  for (let i = lo; i <= hi; i += 1) {
    queryTokens(pages[i]).forEach((w) => { sets[i][w] = true; });
  }
  const df = {};
  for (let i = lo; i <= hi; i += 1) {
    Object.keys(sets[i]).forEach((w) => { df[w] = (df[w] || 0) + 1; });
  }
  const span = hi - lo + 1;
  const scores = pages.map(() => 0);
  for (let i = lo; i <= hi; i += 1) {
    scores[i] = keys.reduce((sum, k) => {
      if (!sets[i][k]) return sum;
      return sum + ((df[k] || 0) > span * 0.55 ? 0.35 : 1);
    }, 0);
  }
  let best = lo;
  for (let i = lo + 1; i <= hi; i += 1) {
    if (scores[i] > scores[best]) best = i;
  }
  if (scores[best] < 2) return fallback;

  let start = best;
  let end = best;
  while (start > lo && scores[start - 1] >= 2) start -= 1;
  while (end < hi && scores[end + 1] >= 2) end += 1;
  if (start === end) {
    if (end < hi) end += 1;
    if (start > lo && end - start < 2) start -= 1;
  }
  if (end - start >= 8) {
    start = Math.max(lo, best - 1);
    end = Math.min(hi, best + 2);
  }
  return { start: start + 1, end: end + 1 };
}

const REL_RE = /\b(?:(?:and|then|so|okay|the)\s+)*(?:next|following|previous|last|this)\s+slide\b/gi;

export function slideParts(text) {
  const src = String(text || '');
  const hits = slideMentions(src).map((h) => ({
    index: h.index,
    length: h.length,
    text: h.text,
    slide: h.start,
    slideEnd: h.end,
  }));
  const re = new RegExp(REL_RE.source, 'gi');
  let m = re.exec(src);
  while (m) {
    const overlaps = hits.some((h) => m.index < h.index + h.length && m.index + m[0].length > h.index);
    if (!overlaps) {
      hits.push({
        index: m.index,
        length: m[0].length,
        text: m[0],
        slide: 0,
        slideEnd: 0,
      });
    }
    m = re.exec(src);
  }
  hits.sort((a, b) => a.index - b.index);
  if (!hits.length) return [{ text: src }];
  const parts = [];
  let at = 0;
  hits.forEach((h) => {
    if (h.index > at) parts.push({ text: src.slice(at, h.index) });
    parts.push({ text: h.text, slide: h.slide, slideEnd: h.slideEnd, auto: !h.slide });
    at = h.index + h.length;
  });
  if (at < src.length) parts.push({ text: src.slice(at) });
  return parts;
}
