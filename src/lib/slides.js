const ONES = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS = { twenty: 20, thirty: 30 };
const NUM = String.raw`(?:\d+|twenty[-\s](?:one|two|three|four|five|six|seven|eight|nine)|thirty|twenty|nineteen|eighteen|seventeen|sixteen|fifteen|fourteen|thirteen|twelve|eleven|ten|nine|eight|seven|six|five|four|three|two|one)`;
const SLIDE_RE = new RegExp(
  String.raw`\bslides?\s+(?:number\s+)?(?:from\s+(?:starting\s+from\s+)?)?(${NUM})(?:\s*(?:[-–—,/]|to|through|and)\s*(?:and\s+)?(${NUM}))?`,
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

export function slideParts(text) {
  const src = String(text || '');
  const hits = slideMentions(src);
  if (!hits.length) return [{ text: src }];
  const parts = [];
  let at = 0;
  hits.forEach((h) => {
    if (h.index > at) parts.push({ text: src.slice(at, h.index) });
    parts.push({ text: h.text, slide: h.start, slideEnd: h.end });
    at = h.index + h.length;
  });
  if (at < src.length) parts.push({ text: src.slice(at) });
  return parts;
}
