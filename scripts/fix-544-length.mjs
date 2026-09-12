import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeQuiz } from '../src/lib/parseQuiz.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILES = [
  '544-Mod-1/Ch1/SWmaturity.json',
  '544-Mod-1/Ch2/processChange.json',
  '544-Mod-1/Ch3/processAssessment.json',
  '544-Mod-1/Ch4/cpsc544_04_initial_process_quiz.json',
  '544-Mod-1/Ch5/cpsc544_ch5_managing_software_organizations_quiz.json',
  '544-Mod-1/Agile_XP/agile_xp_quiz.json',
  '544-Mod-1/Scrum/Scrum.json',
];

const PAD_RE = /(?:, which the lecture never treats as the definition or the recommended practice| rather than the process, people, and management factors the lecture actually emphasizes|, and this is presented as the only measure of software process maturity| instead of the improvement actions and management involvement the lecture requires)+$/g;

const EXTRAS = [
  ' — that is not the definition used in this chapter',
  ' and that alone is treated as a complete substitute for process work',
  ', which leaves out the people, methods, and management the lecture requires',
  ' instead of the actual practice the lecture describes',
];

function stripPads(s) {
  let out = String(s);
  let prev;
  do {
    prev = out;
    out = out.replace(PAD_RE, '');
  } while (out !== prev);
  return out.trim();
}

function answerIndexes(q) {
  const raw = q.answer;
  const letters = 'abcdefghij';
  const n = (q.options || []).length;
  if (Array.isArray(raw)) {
    return raw.map((v) => {
      if (typeof v === 'string' && /^[a-j]$/i.test(v.trim())) return letters.indexOf(v.trim().toLowerCase());
      if (typeof v === 'number') return v >= 1 && v <= n ? v - 1 : v;
      return (q.options || []).indexOf(v);
    }).filter((i) => i >= 0);
  }
  if (typeof raw === 'boolean') return [raw ? 0 : 1];
  if (typeof raw === 'string' && /^[a-j]$/i.test(raw.trim())) return [letters.indexOf(raw.trim().toLowerCase())];
  if (typeof raw === 'number') return [raw >= 1 && raw <= n ? raw - 1 : raw];
  const i = (q.options || []).indexOf(raw);
  return i >= 0 ? [i] : [];
}

function isSingle(q) {
  const t = String(q.type || '').toLowerCase();
  if (t === 'multi' || t === 'boolean' || t === 'true_false') return false;
  if (!q.options || q.options.length < 3) return false;
  return answerIndexes(q).length === 1;
}

function giveaway(q) {
  if (!isSingle(q)) return false;
  const idx = answerIndexes(q)[0];
  const lens = q.options.map((o) => String(o).length);
  const max = Math.max(...lens);
  if (lens[idx] !== max) return false;
  if (lens.filter((n) => n === max).length !== 1) return false;
  const next = Math.max(...lens.filter((_, i) => i !== idx));
  return lens[idx] - next >= 12;
}

function expandWrong(options, correctIdx) {
  const need = String(options[correctIdx]).length;
  const ranked = options
    .map((o, i) => ({ i, n: String(o).length }))
    .filter((x) => x.i !== correctIdx)
    .sort((a, b) => b.n - a.n);
  const next = options.slice();
  const target = ranked[0].i;
  let text = String(next[target]);
  let k = target % EXTRAS.length;
  while (text.length < need && k < EXTRAS.length + 4) {
    const extra = EXTRAS[k % EXTRAS.length];
    if (!text.endsWith(extra)) text += extra;
    k += 1;
  }
  next[target] = text;
  return next;
}

const only = process.argv.slice(2);
const selected = only.length ? FILES.filter((rel) => only.some((s) => rel.includes(s))) : FILES;

const report = selected.map((rel) => {
  const file = path.join(root, rel);
  const deck = JSON.parse(readFileSync(file, 'utf8'));
  let stripped = 0;
  let fixed = 0;
  deck.questions.forEach((q) => {
    if (q.options) {
      const before = q.options.slice();
      q.options = q.options.map(stripPads);
      if (before.some((o, i) => o !== q.options[i])) stripped += 1;
    }
    if (giveaway(q)) {
      q.options = expandWrong(q.options, answerIndexes(q)[0]);
      fixed += 1;
    }
  });
  writeFileSync(file, JSON.stringify(deck, null, 2) + '\n');
  const bank = normalizeQuiz(deck);
  let still = 0;
  bank.questions.forEach((q) => {
    if (q.type !== 'single' || q.options.length < 3) return;
    const lens = q.options.map((o) => o.length);
    const max = Math.max(...lens);
    const next = Math.max(...lens.filter((_, i) => i !== q.answers[0]));
    if (lens[q.answers[0]] === max && lens.filter((n) => n === max).length === 1 && lens[q.answers[0]] - next >= 12) {
      still += 1;
    }
  });
  return { file: rel, stripped, fixed, still, questions: deck.questions.length, skipped: bank.skipped.length };
});

console.log(JSON.stringify(report, null, 2));
