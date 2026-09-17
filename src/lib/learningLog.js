export const DEFAULT_HEADLINE = 'Learning in public. JavaScript first, then the rest of the stack.';

export function emptyLog() {
  return {
    owner: 'Jake',
    headline: DEFAULT_HEADLINE,
    updatedAt: '',
    workingOn: null,
    decks: {},
  };
}

export function deckStats(quiz, boxes, stats, maxBox) {
  const questions = (quiz && Array.isArray(quiz.questions)) ? quiz.questions : [];
  const cap = Number(maxBox) >= 2 ? Number(maxBox) : 3;
  const total = questions.length;
  const mastered = questions.filter((q) => (boxes && boxes[q.id] || 1) >= cap).length;
  const seen = questions.filter((q) => boxes && boxes[q.id]).length;
  return {
    total,
    mastered,
    seen,
    right: (stats && stats.right) || 0,
    wrong: (stats && stats.wrong) || 0,
    pct: total ? Math.round((mastered / total) * 100) : 0,
    seenPct: total ? Math.round((seen / total) * 100) : 0,
    done: total > 0 && mastered >= total,
  };
}

export function mergeLog(base, patch) {
  const left = emptyLog();
  const src = base && typeof base === 'object' ? base : {};
  const extra = patch && typeof patch === 'object' ? patch : {};
  left.owner = String(extra.owner || src.owner || 'Jake');
  left.headline = String(extra.headline || src.headline || DEFAULT_HEADLINE);
  left.updatedAt = String(extra.updatedAt || src.updatedAt || '');
  const working = extra.workingOn !== undefined ? extra.workingOn : src.workingOn;
  left.workingOn = working && typeof working === 'object' ? {
    courseId: String(working.courseId || ''),
    courseTitle: String(working.courseTitle || ''),
    deckId: String(working.deckId || ''),
    deckLabel: String(working.deckLabel || ''),
    pct: Number(working.pct) || 0,
    done: !!working.done,
  } : null;
  left.decks = Object.assign({}, src.decks && typeof src.decks === 'object' ? src.decks : {});
  if (extra.decks && typeof extra.decks === 'object') {
    Object.keys(extra.decks).forEach((id) => {
      const row = extra.decks[id];
      if (!row || typeof row !== 'object') return;
      left.decks[id] = Object.assign({}, left.decks[id], row, { id });
    });
  }
  return left;
}

export function withDeck(log, meta, quiz, boxes, stats, maxBox) {
  const progress = deckStats(quiz, boxes, stats, maxBox);
  const id = String((meta && meta.deckId) || (quiz && quiz.deckId) || (quiz && quiz.title) || 'deck');
  const row = {
    id,
    label: String((meta && meta.deckLabel) || (quiz && quiz.title) || 'Deck'),
    courseId: String((meta && meta.courseId) || (quiz && quiz.courseId) || ''),
    courseTitle: String((meta && meta.courseTitle) || ''),
    lastAt: new Date().toISOString(),
    total: progress.total,
    mastered: progress.mastered,
    seen: progress.seen,
    right: progress.right,
    wrong: progress.wrong,
    pct: progress.pct,
    done: progress.done,
  };
  const next = mergeLog(log, {
    updatedAt: row.lastAt,
    workingOn: {
      courseId: row.courseId,
      courseTitle: row.courseTitle,
      deckId: row.id,
      deckLabel: row.label,
      pct: row.pct,
      done: row.done,
    },
    decks: { [id]: row },
  });
  return next;
}

export function deckDone(progress) {
  if (!progress || typeof progress !== 'object') return false;
  if (progress.done) return true;
  const total = Number(progress.total) || 0;
  const mastered = Number(progress.mastered) || 0;
  return total > 0 && mastered >= total;
}

export function leftoverStudy(log, courses) {
  const working = log && log.workingOn;
  if (!working || !working.deckId) return null;
  const list = Array.isArray(courses) ? courses : [];
  for (let i = 0; i < list.length; i++) {
    const course = list[i];
    const decks = [];
    if (course && Array.isArray(course.modules)) {
      course.modules.forEach((mod) => { (mod.decks || []).forEach((d) => decks.push(d)); });
    } else if (course && Array.isArray(course.decks)) {
      course.decks.forEach((d) => decks.push(d));
    }
    const ready = decks.filter((d) => d && d.data && Array.isArray(d.data.questions) && d.data.questions.length);
    if (!ready.length) continue;
    let idx = ready.findIndex((d) => d.id === working.deckId);
    if (idx < 0 && course.id === working.courseId) idx = 0;
    if (idx < 0) continue;
    let pick = ready[idx];
    let completed = deckDone(log.decks && log.decks[pick.id]);
    if (completed) {
      const next = ready.slice(idx + 1).find((d) => !deckDone(log.decks && log.decks[d.id]));
      if (next) {
        pick = next;
        completed = false;
      }
    }
    return { course, deck: pick, completed };
  }
  return null;
}

export function courseRollup(course, log) {
  const decks = [];
  if (course && Array.isArray(course.modules)) {
    course.modules.forEach((mod) => { (mod.decks || []).forEach((d) => decks.push(d)); });
  } else if (course && Array.isArray(course.decks)) {
    course.decks.forEach((d) => decks.push(d));
  }
  const ready = decks.filter((d) => d && d.data && Array.isArray(d.data.questions) && d.data.questions.length);
  if (!ready.length) return null;
  let total = 0;
  let mastered = 0;
  let seen = 0;
  ready.forEach((deck) => {
    const saved = log && log.decks && log.decks[deck.id];
    const n = (saved && saved.total) || deck.data.questions.length;
    total += n;
    mastered += (saved && saved.mastered) || 0;
    seen += saved ? (Number(saved.seen) || Number(saved.mastered) || 0) : 0;
  });
  return {
    total,
    mastered,
    seen,
    pct: total ? Math.round((mastered / total) * 100) : 0,
    seenPct: total ? Math.round((seen / total) * 100) : 0,
    started: ready.filter((d) => log && log.decks && log.decks[d.id]).length,
    ready: ready.length,
    done: ready.length > 0 && ready.every((d) => deckDone(log && log.decks && log.decks[d.id])),
  };
}

export function logTotals(log) {
  const decks = log && log.decks && typeof log.decks === 'object' ? Object.keys(log.decks).map((id) => log.decks[id]) : [];
  const out = { total: 0, mastered: 0, seen: 0, pct: 0, seenPct: 0 };
  decks.forEach((row) => {
    if (!row || typeof row !== 'object') return;
    out.total += Number(row.total) || 0;
    out.mastered += Number(row.mastered) || 0;
    out.seen += Number(row.seen) || 0;
  });
  out.pct = out.total ? Math.round((out.mastered / out.total) * 100) : 0;
  out.seenPct = out.total ? Math.round((out.seen / out.total) * 100) : 0;
  return out;
}

export function catalogTotals(courses, log) {
  const out = { total: 0, mastered: 0, seen: 0, pct: 0, seenPct: 0 };
  (courses || []).forEach((course) => {
    const roll = courseRollup(course, log);
    if (!roll) return;
    out.total += roll.total;
    out.mastered += roll.mastered;
    out.seen += roll.seen;
  });
  out.pct = out.total ? Math.round((out.mastered / out.total) * 100) : 0;
  out.seenPct = out.total ? Math.round((out.seen / out.total) * 100) : 0;
  return out;
}
