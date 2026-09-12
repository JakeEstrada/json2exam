const STOP = {
  about: 1, after: 1, also: 1, another: 1, because: 1, before: 1, being: 1,
  chapter: 1, during: 1, every: 1, first: 1, from: 1, have: 1, into: 1,
  later: 1, like: 1, more: 1, most: 1, only: 1, other: 1, over: 1, part: 1,
  some: 1, such: 1, that: 1, their: 1, there: 1, these: 1, they: 1, this: 1,
  those: 1, through: 1, under: 1, very: 1, what: 1, when: 1, which: 1,
  while: 1, with: 1, would: 1, your: 1, then: 1, than: 1, them: 1, will: 1,
  must: 1, should: 1, need: 1, needs: 1, used: 1, using: 1, does: 1, done: 1,
  make: 1, made: 1, just: 1, onto: 1, upon: 1, requirement: 1, requirements: 1,
  software: 1, system: 1, systems: 1, project: 1, product: 1, products: 1,
};

export function queryTokens(text) {
  return String(text || '')
    .toLowerCase()
    .match(/[a-z][a-z0-9'-]{3,}/g)
    ?.filter((w) => !STOP[w]) || [];
}

function collapse(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

function indexesForCharSpan(parts, start, end) {
  const hits = [];
  let pos = 0;
  parts.forEach((part, i) => {
    const next = pos + part.length;
    if (next > start && pos < end) hits.push(i);
    pos = next + 1;
  });
  return hits;
}

export function highlightItemIndexes(items, query) {
  const parts = (items || []).map((it) => String(it && it.str ? it.str : ''));
  if (!parts.length) return [];
  const hay = collapse(parts.join(' ')).toLowerCase();
  const needle = collapse(query).toLowerCase();

  if (needle.length >= 24) {
    const snippet = needle.slice(0, 90);
    const at = hay.indexOf(snippet);
    if (at >= 0) return indexesForCharSpan(parts.map((p) => collapse(p)), at, at + snippet.length);
    const words = needle.split(' ').filter((w) => w.length > 3).slice(0, 10);
    if (words.length >= 4) {
      const run = words.join(' ');
      const found = hay.indexOf(run);
      if (found >= 0) return indexesForCharSpan(parts.map((p) => collapse(p)), found, found + run.length);
    }
  }

  const keys = queryTokens(query);
  if (keys.length < 2) return [];
  const keySet = {};
  keys.forEach((k) => { keySet[k] = true; });
  const scores = parts.map((part) => queryTokens(part).filter((w) => keySet[w]).length);
  const win = Math.min(20, Math.max(10, Math.round(parts.length / 6)));
  let best = 0;
  let bestStart = 0;
  let bestEnd = 0;
  for (let start = 0; start < scores.length; start += 1) {
    const end = Math.min(scores.length, start + win);
    let hit = 0;
    for (let i = start; i < end; i += 1) hit += scores[i];
    if (hit > best) {
      best = hit;
      bestStart = start;
      bestEnd = end;
    }
  }
  if (best < 2) return [];
  let lo = bestStart;
  let hi = bestEnd - 1;
  while (lo <= hi && scores[lo] === 0) lo += 1;
  while (hi >= lo && scores[hi] === 0) hi -= 1;
  const out = [];
  for (let i = lo; i <= hi; i += 1) out.push(i);
  return out;
}

export function highlightSlideIndexes(items, query) {
  const phrase = highlightItemIndexes(items, query);
  const keys = queryTokens(query);
  if (!keys.length) return phrase;
  const keySet = {};
  keys.forEach((k) => { keySet[k] = true; });
  const extra = [];
  (items || []).forEach((it, i) => {
    if (queryTokens(it && it.str).some((w) => keySet[w])) extra.push(i);
  });
  if (!phrase.length && !extra.length) return [];
  const seen = {};
  phrase.concat(extra).forEach((i) => { seen[i] = true; });
  return Object.keys(seen).map(Number).sort((a, b) => a - b);
}

export function transformMatrix(a, b) {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

export function itemRect(item, viewport) {
  const tr = transformMatrix(viewport.transform, item.transform);
  const height = Math.hypot(tr[2], tr[3]) || 10;
  const itemScale = Math.hypot(item.transform[0], item.transform[1]) || 1;
  const viewScale = Math.hypot(tr[0], tr[1]);
  const width = item.width ? item.width * (viewScale / itemScale) : Math.max((item.str || '').length * height * 0.45, 4);
  return {
    left: tr[4],
    top: tr[5] - height,
    width,
    height,
  };
}
