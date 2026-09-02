import { LETTERS } from './parseQuiz.js';

export function stemKey(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function parseLetters(message) {
  const s = String(message || '');
  const found = [];
  function add(raw) {
    const L = String(raw).toLowerCase();
    if ('abcdef'.indexOf(L) !== -1 && found.indexOf(L) === -1) found.push(L);
  }
  if (/^[a-f]$/i.test(s.trim())) {
    add(s.trim());
    return found;
  }
  const patterns = [
    /\b(?:option|choice)\s+([a-f])\b/gi,
    /\b(?:why\s+)?(?:isn'?t|is\s+not)\s+([a-f])\b/gi,
    /\b(?:why\s+)?is\s+([b-f])\b/gi,
    /\b([a-f])\s+and\s+([a-f])\b/gi,
    /\b([a-f])\s+(?:right|wrong|correct|incorrect)\b/gi,
  ];
  patterns.forEach((re) => {
    let m;
    while ((m = re.exec(s))) {
      add(m[1]);
      if (m[2]) add(m[2]);
    }
  });
  return found;
}

export function shownOption(card, letter) {
  if (!card || !card.q || !Array.isArray(card.order)) return null;
  const shown = LETTERS.indexOf(String(letter).toLowerCase());
  if (shown < 0 || shown >= card.order.length) return null;
  const realIdx = card.order[shown];
  return {
    letter: String(letter).toLowerCase(),
    realIdx,
    text: card.q.options[realIdx],
    isAnswer: card.q.answers.indexOf(realIdx) !== -1,
  };
}

export function coverage(quiz, brain) {
  const stems = new Set((brain.stems || []).map(stemKey));
  if (!stems.size || !quiz || !Array.isArray(quiz.questions) || !quiz.questions.length) {
    return { hits: 0, ratio: 0 };
  }
  let hit = 0;
  quiz.questions.forEach((q) => { if (stems.has(stemKey(q.text))) hit++; });
  return { hits: hit, ratio: hit / quiz.questions.length };
}

export function findBrain(quiz, registry) {
  if (!quiz || !registry) return null;
  if (quiz.brain && registry[quiz.brain]) return registry[quiz.brain];
  let best = null;
  let bestScore = 0;
  let bestHits = 0;
  Object.keys(registry).forEach((id) => {
    const b = registry[id];
    const { hits, ratio } = coverage(quiz, b);
    if (ratio > bestScore) { bestScore = ratio; bestHits = hits; best = b; }
  });
  return bestScore >= 0.7 && bestHits >= 20 ? best : null;
}

function cardEntry(brain, questionText) {
  const cards = brain.cards || {};
  const want = stemKey(questionText);
  const keys = Object.keys(cards);
  for (let i = 0; i < keys.length; i++) {
    if (stemKey(keys[i]) === want) return cards[keys[i]];
  }
  return null;
}

function optionNote(entry, optionText) {
  if (!entry || !entry.options) return null;
  const want = stemKey(optionText);
  const keys = Object.keys(entry.options);
  for (let i = 0; i < keys.length; i++) {
    if (stemKey(keys[i]) === want) return entry.options[keys[i]];
  }
  return null;
}

function describeLetter(brain, card, letter) {
  const shown = shownOption(card, letter);
  if (!shown) return null;
  const entry = cardEntry(brain, card.q.text);
  const custom = optionNote(entry, shown.text);
  if (custom) return custom;
  const tag = shown.isAnswer ? 'that’s the answer.' : 'that’s not the answer.';
  return shown.letter.toUpperCase() + ': ' + tag;
}

function matchConcept(brain, message) {
  const list = brain.concepts || [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].test.test(message)) return list[i].reply;
  }
  return null;
}

export function reply(brain, ctx) {
  const message = String((ctx && ctx.message) || '').trim();
  if (!brain) return '';
  if (!message) return brain.empty || '';

  const card = ctx && ctx.card;
  const phase = ctx && ctx.phase;
  const letters = parseLetters(message);
  const askingAboutOptions = letters.length > 0
    || /\b(why|explain|this (question|one|card)|what('s| is) (wrong|right|the answer))\b/i.test(message);

  if (askingAboutOptions && card && phase !== 'review') {
    return brain.locked || 'Check your answer first, then I can walk through the options.';
  }

  if (letters.length && card) {
    const parts = letters.map((L) => describeLetter(brain, card, L)).filter(Boolean);
    if (parts.length) return parts.join('\n\n');
  }

  if (card && phase === 'review' && /\b(this (question|one|card)|explain|why (is|was) this|what('s| is) the answer)\b/i.test(message)) {
    const entry = cardEntry(brain, card.q.text);
    if (entry && entry.about) return entry.about;
    if (card.q.explanation) return card.q.explanation;
  }

  const concept = matchConcept(brain, message);
  if (concept) return concept;

  return brain.fallback || '';
}
