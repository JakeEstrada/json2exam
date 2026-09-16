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
  ready.forEach((deck) => {
    const saved = log && log.decks && log.decks[deck.id];
    const n = (saved && saved.total) || deck.data.questions.length;
    total += n;
    mastered += (saved && saved.mastered) || 0;
  });
  return {
    total,
    mastered,
    pct: total ? Math.round((mastered / total) * 100) : 0,
    started: ready.filter((d) => log && log.decks && log.decks[d.id]).length,
    ready: ready.length,
  };
}
