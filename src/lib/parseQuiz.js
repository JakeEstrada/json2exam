// Turns whatever JSON a person hands us into a normalized question bank.
// Pure functions, no React: easy to unit test on its own.

export const LETTERS = 'abcdefghij';
const PREFIX_RE = /^\s*(?:[a-jA-J]|\d{1,2})\s*[).:\-]\s+/;

const TYPE_ALIASES = {
  single: ['single', 'multiple', 'multiple_choice', 'multiplechoice', 'mc', 'choice', 'one', 'radio'],
  multi: ['multi', 'multi_select', 'multiselect', 'multiple_select', 'select_all', 'selectall',
          'select_all_that_apply', 'checkbox', 'many', 'multiple_answer', 'multiple_answers'],
  boolean: ['boolean', 'bool', 'tf', 't/f', 'true_false', 'truefalse', 'true-false', 'yesno', 'yes_no'],
};

export function normType(raw) {
  if (typeof raw !== 'string') return null;
  const v = raw.trim().toLowerCase().replace(/\s+/g, '_');
  for (const key of Object.keys(TYPE_ALIASES)) {
    if (TYPE_ALIASES[key].indexOf(v) !== -1) return key;
  }
  return null;
}

function firstDefined() {
  for (let i = 0; i < arguments.length; i++) {
    if (arguments[i] !== undefined && arguments[i] !== null) return arguments[i];
  }
  return undefined;
}

function optionText(o) {
  if (o === null || o === undefined) return '';
  if (typeof o === 'object') {
    return String(firstDefined(o.text, o.label, o.option, o.value, o.answer, ''));
  }
  return String(o);
}

// Accepts ["HTTP", "FTP"] and { A: "HTTP", B: "FTP" }. Letter keys stay A=0, B=1, …
export function toOptionArray(raw) {
  if (raw == null || Array.isArray(raw)) return raw;
  if (typeof raw !== 'object') return raw;
  const keys = Object.keys(raw);
  const letters = keys.filter((k) => /^[A-Za-z]$/.test(k));
  const rest = keys.filter((k) => !/^[A-Za-z]$/.test(k));
  letters.sort((a, b) => a.toLowerCase().charCodeAt(0) - b.toLowerCase().charCodeAt(0));
  return letters.concat(rest).map((k) => raw[k]);
}

// Accepts ["a) HTTP", "b) FTP"] as well as ["HTTP", "FTP"].
export function cleanOptions(list) {
  const rawTexts = list.map(optionText).map((s) => s.trim());
  const hits = rawTexts.filter((s) => PREFIX_RE.test(s)).length;
  const clean = hits >= 2 ? rawTexts.map((s) => s.replace(PREFIX_RE, '').trim()) : rawTexts;
  return { clean, rawTexts };
}

function isTrueFalsePair(list) {
  if (list.length !== 2) return false;
  const a = list.map((s) => s.trim().toLowerCase()).sort();
  return (a[0] === 'false' && a[1] === 'true') || (a[0] === 'no' && a[1] === 'yes');
}

// Turn one answer value into an option index, or -1 when it can't be matched.
export function resolveOne(value, clean, rawTexts) {
  if (typeof value === 'boolean') {
    const target = value ? 'true' : 'false';
    const alt = value ? 'yes' : 'no';
    const i = clean.findIndex((o) => {
      const t = o.trim().toLowerCase();
      return t === target || t === alt;
    });
    if (i >= 0) return i;
    return value ? 0 : 1;
  }

  if (typeof value === 'number' && isFinite(value)) {
    const n = Math.trunc(value);
    if (n >= 0 && n < clean.length) return n;       // 0-based index
    if (n >= 1 && n <= clean.length) return n - 1;  // 1-based fallback
    return -1;
  }

  if (typeof value === 'object' && value !== null) {
    return resolveOne(optionText(value), clean, rawTexts);
  }

  if (typeof value === 'string') {
    const v = value.trim();
    if (!v) return -1;
    const lower = v.toLowerCase();

    let i = clean.findIndex((o) => o.trim().toLowerCase() === lower);
    if (i >= 0) return i;
    i = rawTexts.findIndex((o) => o.trim().toLowerCase() === lower);
    if (i >= 0) return i;

    if (/^[a-j]$/.test(lower)) {
      const idx = LETTERS.indexOf(lower);
      if (idx < clean.length) return idx;
    }
    if (/^\d{1,2}$/.test(lower)) return resolveOne(Number(lower), clean, rawTexts);
    if (lower === 'true' || lower === 'false') return resolveOne(lower === 'true', clean, rawTexts);
    if (lower === 'yes' || lower === 'no') return resolveOne(lower === 'yes', clean, rawTexts);

    // "a, c" or "a and c" written as one string
    const parts = v.split(/[,;/]|\band\b/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1) {
      const all = parts.map((p) => resolveOne(p, clean, rawTexts));
      if (all.every((n) => n >= 0)) return all;
    }
  }

  return -1;
}

export function normalizeQuestion(raw, i) {
  const label = 'Question ' + (i + 1);

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { error: label + ' is not an object.' };
  }

  const text = String(firstDefined(raw.question, raw.prompt, raw.text, raw.q, '')).trim();
  if (!text) return { error: label + ' has no question text.' };

  const shortLabel = text.length > 52 ? text.slice(0, 52) + '…' : text;
  const answerRaw = firstDefined(raw.answer, raw.correct, raw.correctAnswer,
                                 raw.correct_answer, raw.answers, raw.key);
  if (answerRaw === undefined) return { error: '"' + shortLabel + '" has no answer.' };

  let optionList = toOptionArray(firstDefined(raw.options, raw.choices));
  let type = normType(raw.type);

  if (!type) {
    if (Array.isArray(answerRaw) && answerRaw.length > 1) type = 'multi';
    else if (!optionList && (typeof answerRaw === 'boolean' || /^(true|false|yes|no)$/i.test(String(answerRaw)))) type = 'boolean';
    else if (Array.isArray(optionList) && isTrueFalsePair(optionList.map(optionText))) type = 'boolean';
    else type = 'single';
  }

  if (type === 'boolean' && !Array.isArray(optionList)) optionList = ['True', 'False'];

  if (!Array.isArray(optionList) || optionList.length < 2) {
    return { error: '"' + shortLabel + '" needs at least two options.' };
  }

  const { clean, rawTexts } = cleanOptions(optionList);
  if (clean.some((o) => !o)) return { error: '"' + shortLabel + '" has an empty option.' };

  const values = Array.isArray(answerRaw) ? answerRaw : [answerRaw];
  const indices = [];
  for (const v of values) {
    const got = resolveOne(v, clean, rawTexts);
    const many = Array.isArray(got) ? got : [got];
    for (const n of many) {
      if (n < 0) return { error: '"' + shortLabel + '" has an answer that matches no option.' };
      if (indices.indexOf(n) === -1) indices.push(n);
    }
  }
  indices.sort((a, b) => a - b);

  if (type !== 'multi' && indices.length > 1) type = 'multi';

  return {
    question: {
      id: i + '::' + text.slice(0, 90),
      text,
      type,
      options: clean,
      answers: indices,
      explanation: String(firstDefined(raw.explanation, raw.rationale, raw.note, '')).trim(),
    },
  };
}

export function normalizeQuiz(data, fallbackTitle) {
  let list = null;
  let title = fallbackTitle || 'Untitled deck';
  let brain = null;

  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === 'object') {
    list = firstDefined(data.questions, data.items, data.cards, data.quiz, data.deck);
    if (data.title) title = String(data.title);
    else if (data.name) title = String(data.name);
    const tagged = firstDefined(data.brain, data.brainId, data.assistant);
    if (tagged) brain = String(tagged);
  }

  if (!Array.isArray(list)) {
    throw new Error('Expected a list of questions, either at the top level or under a "questions" key.');
  }
  if (!list.length) throw new Error('That file has no questions in it.');

  const questions = [];
  const skipped = [];
  list.forEach((raw, i) => {
    const out = normalizeQuestion(raw, i);
    if (out.error) skipped.push(out.error);
    else questions.push(out.question);
  });

  if (!questions.length) {
    throw new Error('None of the ' + list.length + ' questions could be read. ' + skipped[0]);
  }
  return { title, questions, skipped, brain };
}

// JSON.parse errors are terse; point at the line instead of the byte offset.
export function describeJsonError(err, source) {
  const m = /position (\d+)/.exec(err.message || '');
  if (!m) return err.message;
  const pos = Number(m[1]);
  const upTo = source.slice(0, pos);
  const line = upTo.split('\n').length;
  const col = pos - upTo.lastIndexOf('\n');
  return err.message.replace(/at position \d+/, 'on line ' + line + ', column ' + col);
}
