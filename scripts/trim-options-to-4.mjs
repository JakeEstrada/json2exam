import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILES = [
  '541-Mod1/Ch1/ch1.json',
  '541-Mod1/Ch2/Ch2.json',
  '541-Mod1/Ch3/Ch3.json',
  '541-Mod1/Ch4/Ch4.json',
  '541-Mod1/Ch5/Ch5.json',
  '544-Mod-1/Ch1/SWmaturity.json',
  '544-Mod-1/Ch2/processChange.json',
  '544-Mod-1/Ch3/processAssessment.json',
  '544-Mod-1/Ch4/cpsc544_04_initial_process_quiz.json',
  '544-Mod-1/Ch5/cpsc544_ch5_managing_software_organizations_quiz.json',
  '544-Mod-1/Agile_XP/agile_xp_quiz.json',
  '544-Mod-1/Scrum/Scrum.json',
];

const LETTERS = 'abcdefghij';

function answerIndexes(q) {
  const raw = q.answer;
  const n = (q.options || []).length;
  if (Array.isArray(raw)) {
    return raw.map((v) => {
      if (typeof v === 'string' && /^[a-j]$/i.test(v.trim())) return LETTERS.indexOf(v.trim().toLowerCase());
      if (typeof v === 'number') return v >= 1 && v <= n ? v - 1 : v;
      return (q.options || []).indexOf(v);
    }).filter((i) => i >= 0);
  }
  if (typeof raw === 'boolean') return [raw ? 0 : 1];
  if (typeof raw === 'string' && /^[a-j]$/i.test(raw.trim())) return [LETTERS.indexOf(raw.trim().toLowerCase())];
  if (typeof raw === 'number') return [raw >= 1 && raw <= n ? raw - 1 : raw];
  const i = (q.options || []).indexOf(raw);
  return i >= 0 ? [i] : [];
}

function trimQuestion(q) {
  const options = q.options;
  if (!Array.isArray(options) || options.length <= 4) return false;
  const correct = answerIndexes(q);
  if (!correct.length) return false;
  const keepCorrect = new Set(correct.slice(0, 4));
  const wrong = options
    .map((text, i) => ({ text, i, n: String(text).length }))
    .filter((o) => keepCorrect.has(o.i) === false && correct.indexOf(o.i) === -1)
    .sort((a, b) => b.n - a.n);
  const keepWrong = new Set(wrong.slice(0, Math.max(0, 4 - keepCorrect.size)).map((o) => o.i));
  const next = [];
  const nextCorrect = [];
  options.forEach((text, i) => {
    if (!keepCorrect.has(i) && !keepWrong.has(i)) return;
    if (keepCorrect.has(i)) nextCorrect.push(next.length);
    next.push(text);
  });
  q.options = next;
  if (Array.isArray(q.answer)) q.answer = nextCorrect.map((i) => LETTERS[i]);
  else if (typeof q.answer === 'boolean') { /* keep */ }
  else q.answer = LETTERS[nextCorrect[0]];
  return true;
}

const report = FILES.map((rel) => {
  const file = path.join(root, rel);
  const deck = JSON.parse(readFileSync(file, 'utf8'));
  let trimmed = 0;
  deck.questions.forEach((q) => { if (trimQuestion(q)) trimmed += 1; });
  writeFileSync(file, JSON.stringify(deck, null, 2) + '\n');
  return { file: rel, trimmed, questions: deck.questions.length };
});
console.log(JSON.stringify(report, null, 2));
