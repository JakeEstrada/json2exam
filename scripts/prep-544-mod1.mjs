import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchingLectureIndexes, parseLecture, normLecture } from '../src/lib/lecture.js';
import { normalizeQuiz } from '../src/lib/parseQuiz.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const DECKS = [
  {
    json: '544-Mod-1/Ch1/SWmaturity.json',
    txt: '544-Mod-1/Ch1/cpsc544_01_v_SWmaturity.txt',
    book: 'Chapter 1 — A Software Maturity Framework',
  },
  {
    json: '544-Mod-1/Ch2/processChange.json',
    txt: '544-Mod-1/Ch2/cpsc544_02_v_ProcessChange(2).txt',
    book: 'Chapter 2 — The Principles of Software Process Change',
  },
  {
    json: '544-Mod-1/Ch3/processAssessment.json',
    txt: '544-Mod-1/Ch3/cpsc544_03_v_ProcessAssessment.txt',
    book: 'Chapter 3 — Software Process Assessment',
  },
  {
    json: '544-Mod-1/Ch4/cpsc544_04_initial_process_quiz.json',
    txt: '544-Mod-1/Ch4/cpsc544_04_v_InitialProcess.txt',
    book: 'Chapter 4 — The Initial Process',
  },
  {
    json: '544-Mod-1/Ch5/cpsc544_ch5_managing_software_organizations_quiz.json',
    txt: '544-Mod-1/Ch5/cpsc544_05_v_ManagingSWorg.txt',
    book: 'Chapter 5 — Managing Software Organizations',
  },
  {
    json: '544-Mod-1/Agile_XP/agile_xp_quiz.json',
    txt: '544-Mod-1/Agile_XP/Agile_XP_video.txt',
    book: 'Agile Process & Extreme Programming',
  },
  {
    json: '544-Mod-1/Scrum/Scrum.json',
    txt: '544-Mod-1/Scrum/Scrum_video.txt',
    book: 'Scrum',
  },
];

const STOP = new Set(`
  about after also assessment because been being chapter class course does done each from
  have into just like more most only other over some such than that the their them then
  they this those through used using very where which while with would your
`.trim().split(/\s+/));

function tokens(s) {
  return normLecture(s)
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

function scoreText(text, want) {
  const have = new Set(tokens(text));
  let hit = 0;
  want.forEach((w) => { if (have.has(w)) hit += 1; });
  return hit;
}

function quoteFromHits(cues, hits) {
  if (!hits.length) return '';
  const start = Math.max(0, hits[0]);
  const end = Math.min(cues.length, hits[hits.length - 1] + 1);
  return cues.slice(start, end).map((c) => c.text).join(' ').replace(/\s+/g, ' ').trim();
}

function bestQuote(cues, question, explanation, answers) {
  const want = new Set(tokens([question, explanation].concat(answers || []).join(' ')));
  let best = { hit: -1, i: 0, j: 0 };
  let firstGood = null;
  for (let i = 0; i < cues.length; i += 1) {
    for (let width = 2; width <= 6; width += 1) {
      const j = Math.min(cues.length - 1, i + width - 1);
      const text = cues.slice(i, j + 1).map((c) => c.text).join(' ');
      const hit = scoreText(text, want);
      if (hit > best.hit || (hit === best.hit && i < best.i)) best = { hit, i, j };
      if (!firstGood && hit >= 4) firstGood = { hit, i, j };
    }
  }
  const pick = firstGood && firstGood.hit >= Math.max(4, best.hit - 1) ? firstGood : best;
  let quote = quoteFromHits(cues, [pick.i, pick.j]);

  if (quote.length < 24 || !matchingLectureIndexes(cues, quote).length) {
    const probes = [explanation, (answers || []).join(' '), question]
      .filter((s) => s && String(s).trim().length >= 16);
    for (let i = 0; i < probes.length; i += 1) {
      const hits = matchingLectureIndexes(cues, probes[i]);
      const next = quoteFromHits(cues, hits);
      if (next.length >= 24 && matchingLectureIndexes(cues, next).length) {
        quote = next;
        break;
      }
    }
  }
  if (!matchingLectureIndexes(cues, quote).length && cues.length) {
    quote = quoteFromHits(cues, [0, Math.min(3, cues.length - 1)]);
  }
  return quote;
}

function answerIndexes(q, optionCount) {
  const raw = q.answer;
  const letters = 'abcdefghij';
  if (Array.isArray(raw)) {
    return raw.map((v) => {
      if (typeof v === 'string' && /^[a-j]$/i.test(v.trim())) return letters.indexOf(v.trim().toLowerCase());
      if (typeof v === 'number') return v;
      const i = (q.options || []).indexOf(v);
      return i;
    }).filter((i) => i >= 0);
  }
  if (typeof raw === 'boolean') return [raw ? 0 : 1];
  if (typeof raw === 'string' && /^[a-j]$/i.test(raw.trim())) return [letters.indexOf(raw.trim().toLowerCase())];
  if (typeof raw === 'number') return [raw >= 1 && raw <= optionCount ? raw - 1 : raw];
  const i = (q.options || []).indexOf(raw);
  return i >= 0 ? [i] : [];
}

function prepDeck(spec) {
  const jsonPath = path.join(root, spec.json);
  const deck = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const cues = parseLecture(readFileSync(path.join(root, spec.txt), 'utf8')).cues;
  deck.questions.forEach((q) => {
    const answers = answerIndexes(q, (q.options || []).length).map((i) => (q.options || [])[i] || '');
    const lecture = bestQuote(cues, q.question || '', q.explanation || '', answers);
    q.reference = Object.assign({}, q.reference, {
      book: spec.book,
      lecture,
    });
  });
  writeFileSync(jsonPath, JSON.stringify(deck, null, 2) + '\n');
  const bank = normalizeQuiz(deck);
  let unmatched = 0;
  bank.questions.forEach((q) => {
    const quote = q.reference && q.reference.lecture;
    if (!quote || !matchingLectureIndexes(cues, quote).length) unmatched += 1;
  });
  return {
    file: spec.json,
    questions: deck.questions.length,
    skipped: bank.skipped.length,
    unmatched,
  };
}

const only = process.argv.slice(2);
const selected = only.length
  ? DECKS.filter((d) => only.some((s) => d.json.includes(s)))
  : DECKS;
const report = selected.map(prepDeck);
console.log(JSON.stringify(report, null, 2));
