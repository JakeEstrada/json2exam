// Leitner scheduling: which card comes next, and how answers move it.

export function boxOf(boxes, q) { return boxes[q.id] || 1; }

export function pickNext(questions, boxes, maxBox, lastId) {
  const pool = questions.filter((q) => boxOf(boxes, q) < maxBox);
  if (!pool.length) return null;
  const lowest = Math.min.apply(null, pool.map((q) => boxOf(boxes, q)));
  let tier = pool.filter((q) => boxOf(boxes, q) === lowest);
  if (tier.length > 1 && lastId) {
    const fresh = tier.filter((q) => q.id !== lastId);
    if (fresh.length) tier = fresh;
  }
  return tier[Math.floor(Math.random() * tier.length)];
}

export function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

export function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const sa = a.slice().sort((x, y) => x - y);
  const sb = b.slice().sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

export const KIND_LABEL = {
  single: 'pick one',
  boolean: 'true or false',
  multi: 'pick every right answer',
};
