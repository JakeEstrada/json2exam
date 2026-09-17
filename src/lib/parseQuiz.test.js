import { test } from 'node:test';
import assert from 'node:assert/strict';
import { headingId, normalizeQuiz } from './parseQuiz.js';
import { lectureParagraphs, matchingLectureIndexes } from './lecture.js';

const one = (raw) => normalizeQuiz([raw], 't').questions[0];

test('strips "a)" style option labels and resolves a letter answer', () => {
  const q = one({ question: 'Protocol?', options: ['a) HTTP', 'b) FTP'], answer: 'b' });
  assert.deepEqual(q.options, ['HTTP', 'FTP']);
  assert.deepEqual(q.answers, [1]);
  assert.equal(q.type, 'single');
});

test('infers true/false from a bare boolean answer', () => {
  const q = one({ question: 'Sky is blue.', answer: true });
  assert.equal(q.type, 'boolean');
  assert.deepEqual(q.options, ['True', 'False']);
  assert.deepEqual(q.answers, [0]);
});

test('infers multi from an array answer', () => {
  const q = one({ question: 'Pick two', options: ['A', 'B', 'C'], answer: ['a', 'c'] });
  assert.equal(q.type, 'multi');
  assert.deepEqual(q.answers, [0, 2]);
});

test('accepts option text, 0-based index, and 1-based index', () => {
  assert.deepEqual(one({ question: 'q', options: ['w', 'x'], answer: 'x' }).answers, [1]);
  assert.deepEqual(one({ question: 'q', options: ['w', 'x', 'y', 'z'], answer: 0 }).answers, [0]);
  assert.deepEqual(one({ question: 'q', options: ['w', 'x', 'y', 'z'], answer: 4 }).answers, [3]);
});

test('skips broken questions instead of dropping the whole file', () => {
  const bank = normalizeQuiz([
    { question: 'no answer', options: ['a', 'b'] },
    { question: 'unmatched', options: ['a', 'b'], answer: 'z' },
    { question: 'fine', options: ['a', 'b'], answer: 'b' },
  ], 't');
  assert.equal(bank.questions.length, 1);
  assert.equal(bank.skipped.length, 2);
});

test('lifts a fenced listing onto question.code and leaves a short prompt', () => {
  const q = one({
    question: 'What prints?\n\n```js\nlet n = 1;\nconsole.log(n);\n```',
    options: ['1', '2'],
    answer: 'a',
  });
  assert.equal(q.code, 'let n = 1;\nconsole.log(n);');
  assert.equal(q.text, 'What prints?');
});

test('keeps an explicit code field on a sentence prompt', () => {
  const q = one({
    question: 'What kind of language is this?',
    code: 'console.log("hello");',
    options: ['scripting', 'compiled'],
    answer: 'a',
  });
  assert.equal(q.code, 'console.log("hello");');
  assert.equal(q.text, 'What kind of language is this?');
});

test('reads a code practice card without treating it as multiple choice', () => {
  const bank = normalizeQuiz({
    title: 'mix',
    questions: [
      { question: 'Pick let', options: ['var', 'let', 'with', 'class'], answer: 'b' },
      {
        question: 'Write paidTotals(payments).',
        type: 'code',
        language: 'javascript',
        starter: 'function paidTotals(payments) {\n  // ...\n}\n',
        tests: [{ input: '[{amount: 10}]', output: '10' }],
        solution: 'function paidTotals(payments) {\n  return payments.reduce((n, p) => n + p.amount, 0);\n}\n',
        hints: ['Use reduce.'],
        explanation: 'Sum the amount field.',
      },
      { question: 'broken', options: ['only-one'] },
    ],
  }, 'mix');
  assert.equal(bank.questions.length, 2);
  assert.equal(bank.skipped.length, 1);
  assert.equal(bank.questions[0].type, 'single');
  const code = bank.questions[1];
  assert.equal(code.type, 'code');
  assert.equal(code.starter.includes('paidTotals'), true);
  assert.equal(code.tests.length, 1);
  assert.equal(code.hints[0], 'Use reduce.');
  assert.deepEqual(code.options, []);
  assert.deepEqual(code.answers, []);
  assert.equal(code.id.startsWith('1::'), true);
});

test('stable code ids survive option shuffling of other cards', () => {
  const a = normalizeQuiz([{
    question: 'Write label(status).',
    type: 'code',
    starter: 'function label(status) {}\n',
    tests: [{ input: '"open"', output: '"open"' }],
    solution: 'function label(status) { return status; }\n',
  }], 't');
  const b = normalizeQuiz([{
    question: 'Write label(status).',
    type: 'code',
    starter: 'function label(status) {}\n',
    tests: [{ input: '"open"', output: '"open"' }],
    solution: 'function label(status) { return status; }\n',
  }], 't');
  assert.equal(a.questions[0].id, b.questions[0].id);
});

test('keeps runnable fields on code tests', () => {
  const q = one({
    question: 'Write last(arr).',
    type: 'code',
    starter: 'function last(arr) {}\n',
    tests: [{ args: [[1, 2, 3]], expected: 3, label: 'three' }],
    solution: 'function last(arr) { return arr[arr.length - 1]; }\n',
  });
  assert.equal(q.tests[0].label, 'three');
  assert.deepEqual(q.tests[0].args, [[1, 2, 3]]);
  assert.equal(q.tests[0].expected, 3);
});

test('keeps expected: null on a code test', () => {
  const q = one({
    question: 'Write first(arr).',
    type: 'code',
    starter: 'function first(arr) {}\n',
    tests: [{ args: [[]], expected: null, label: 'empty' }],
  });
  assert.equal(q.tests[0].expected, null);
});

test('loads the six ready JavaScript language banks', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');
  const { headingId } = await import('./parseQuiz.js');
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../applied-classroom/javascript/language');
  const mods = [
    'variables-and-data-types',
    'conditionals',
    'loops',
    'functions',
    'arrays',
    'objects',
    'maps-and-sets',
  ];
  for (const mod of mods) {
    const quiz = JSON.parse(await readFile(path.join(root, mod, 'quiz.json'), 'utf8'));
    const notes = await readFile(path.join(root, mod, 'notes.md'), 'utf8');
    const headings = new Set([...notes.matchAll(/^#{1,3} (.+)$/gm)].map((m) => headingId(m[1])));
    const bank = normalizeQuiz(quiz);
    assert.equal(bank.skipped.length, 0, mod);
    assert.ok(bank.reading.length >= 1, mod + ' reading');
    const code = bank.questions.filter((q) => q.type === 'code');
    const choice = bank.questions.filter((q) => q.type !== 'code');
    assert.ok(choice.length >= 15, mod + ' choice count');
    assert.equal(code.length, 3, mod + ' code count');
    for (const q of choice) {
      if (q.type === 'boolean') continue;
      assert.ok(q.options.length <= 4, mod);
      assert.ok(q.code && q.code.length > 0, mod + ' missing code: ' + q.text.slice(0, 48));
    }
    for (const q of bank.questions) {
      if (q.reference && q.reference.section) {
        assert.ok(headings.has(headingId(q.reference.section)), mod + ' ' + q.reference.section);
      }
    }
  }
});

test('worked solutions for JavaScript language banks pass their tests', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');
  const { runJavascript } = await import('./runCode.js');
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../applied-classroom/javascript/language');
  const mods = [
    'variables-and-data-types',
    'conditionals',
    'loops',
    'functions',
    'arrays',
    'objects',
    'maps-and-sets',
  ];
  for (const mod of mods) {
    const quiz = JSON.parse(await readFile(path.join(root, mod, 'quiz.json'), 'utf8'));
    const bank = normalizeQuiz(quiz);
    for (const q of bank.questions.filter((row) => row.type === 'code')) {
      const out = runJavascript(q.solution, q.tests);
      assert.equal(out.passed, true, mod + ' ' + q.text.slice(0, 48) + ' ' + JSON.stringify(out.results));
    }
  }
});

test('loads the ready TypeScript language banks', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');
  const { headingId } = await import('./parseQuiz.js');
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../applied-classroom/typescript/language');
  const mods = [
    'types-and-annotations',
    'unions-and-narrowing',
    'functions',
    'arrays-and-tuples',
    'object-types',
    'interfaces',
    'generics',
  ];
  for (const mod of mods) {
    const quiz = JSON.parse(await readFile(path.join(root, mod, 'quiz.json'), 'utf8'));
    const notes = await readFile(path.join(root, mod, 'notes.md'), 'utf8');
    const headings = new Set([...notes.matchAll(/^#{1,3} (.+)$/gm)].map((m) => headingId(m[1])));
    const bank = normalizeQuiz(quiz);
    assert.equal(bank.skipped.length, 0, mod);
    assert.ok(bank.reading.length >= 1, mod + ' reading');
    const code = bank.questions.filter((q) => q.type === 'code');
    const choice = bank.questions.filter((q) => q.type !== 'code');
    assert.ok(choice.length >= 15, mod + ' choice count');
    assert.equal(code.length, 3, mod + ' code count');
    for (const q of choice) {
      if (q.type === 'boolean') continue;
      assert.ok(q.options.length <= 4, mod);
      assert.ok(q.code && q.code.length > 0, mod + ' missing code: ' + q.text.slice(0, 48));
    }
    const tell = /#include|#define|C\+\+|like Python|like Go|like C#|preprocessor|struct /i;
    for (const q of choice) {
      for (const opt of q.options || []) {
        assert.equal(tell.test(opt), false, mod + ' other-language option: ' + opt);
      }
    }
    for (const q of bank.questions) {
      if (q.reference && q.reference.section) {
        assert.ok(headings.has(headingId(q.reference.section)), mod + ' ' + q.reference.section);
      }
    }
  }
});

test('worked solutions for TypeScript language banks pass their tests', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');
  const { runJavascript } = await import('./runCode.js');
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../applied-classroom/typescript/language');
  const mods = [
    'types-and-annotations',
    'unions-and-narrowing',
    'functions',
    'arrays-and-tuples',
    'object-types',
    'interfaces',
    'generics',
  ];
  for (const mod of mods) {
    const quiz = JSON.parse(await readFile(path.join(root, mod, 'quiz.json'), 'utf8'));
    const bank = normalizeQuiz(quiz);
    for (const q of bank.questions.filter((row) => row.type === 'code')) {
      const out = runJavascript(q.solution, q.tests);
      assert.equal(out.passed, true, mod + ' ' + q.text.slice(0, 48) + ' ' + JSON.stringify(out.results));
    }
  }
});

test('rejects a payload that is not a question list', () => {
  assert.throws(() => normalizeQuiz({ foo: 1 }, 't'));
});

test('reads letter-keyed choice objects and letter answers', () => {
  const q = one({
    question: 'What is a constraint?',
    type: 'multiple_choice',
    choices: { A: 'A behavior', B: 'A restriction on design choices', C: 'A user goal' },
    answer: 'B',
  });
  assert.equal(q.type, 'single');
  assert.deepEqual(q.options, ['A behavior', 'A restriction on design choices', 'A user goal']);
  assert.deepEqual(q.answers, [1]);
});

test('loads the Requirements Engineering sampler with nothing skipped', async () => {
  const { SAMPLE } = await import('../data/sample.js');
  const bank = normalizeQuiz(SAMPLE);
  assert.equal(bank.title, 'Requirements Engineering sampler');
  assert.equal(bank.questions.length, SAMPLE.questions.length);
  assert.equal(bank.skipped.length, 0);
});

test('loads the Chapter 1 bank with nothing skipped', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/541-Ch1.json');
  const deck = JSON.parse(await readFile(file, 'utf8'));
  const bank = normalizeQuiz(deck);
  assert.equal(bank.title, 'Requirements Engineering, Chapter 1');
  assert.equal(bank.questions.length, deck.questions.length);
  assert.equal(bank.skipped.length, 0);
});

test('headingId strips quotes and punctuation', () => {
  assert.equal(headingId('Who counts as a "customer"'), 'who-counts-as-a-customer');
});

test('preserves a chapter reference on a question', () => {
  const q = one({
    question: 'Who is a customer?',
    options: ['Only the end user of the product', 'Anyone who benefits from the product'],
    answer: 'b',
    reference: {
      section: 'Who counts as a "customer"',
      book: 'Chapter 2 — Customers and stakeholders',
      page: 4,
      excerpt: 'A customer derives direct or indirect benefit from a product.',
      lecture: 'The job of requirements analysts is to identify and listen to the customers.',
    },
  });
  assert.equal(q.reference.section, 'Who counts as a "customer"');
  assert.equal(q.reference.book, 'Chapter 2 — Customers and stakeholders');
  assert.equal(q.reference.page, 4);
  assert.match(q.reference.excerpt, /benefit/);
  assert.match(q.reference.lecture, /listen to the customers/);
});

test('loads every Module 1 bank with nothing skipped', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../541-Mod1');
  const files = [
    ['Ch1/ch1.json', 31],
    ['Ch2/Ch2.json', 38],
    ['Ch3/Ch3.json', 47],
    ['Ch4/Ch4.json', 47],
    ['Ch5/Ch5.json', 44],
  ];
  for (const [rel, count] of files) {
    const deck = JSON.parse(await readFile(path.join(root, rel), 'utf8'));
    const bank = normalizeQuiz(deck);
    assert.equal(bank.questions.length, count, rel);
    assert.equal(bank.skipped.length, 0, rel);
    for (const q of bank.questions) {
      assert.ok(q.reference && q.reference.section, rel + ' missing notes section');
      assert.ok(q.reference.page >= 1, rel + ' missing book page');
      assert.ok(q.reference.excerpt, rel + ' missing excerpt');
    }
  }
});

test('loads every 544 Module 1 bank with video quotes that hit the transcript', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../544-Mod-1');
  const files = [
    ['Ch1/SWmaturity.json', 'Ch1/cpsc544_01_v_SWmaturity.txt', 50],
    ['Ch2/processChange.json', 'Ch2/cpsc544_02_v_ProcessChange(2).txt', 49],
    ['Ch3/processAssessment.json', 'Ch3/cpsc544_03_v_ProcessAssessment.txt', 62],
    ['Ch4/cpsc544_04_initial_process_quiz.json', 'Ch4/cpsc544_04_v_InitialProcess.txt', 44],
    ['Ch5/cpsc544_ch5_managing_software_organizations_quiz.json', 'Ch5/cpsc544_05_v_ManagingSWorg.txt', 52],
    ['Agile_XP/agile_xp_quiz.json', 'Agile_XP/Agile_XP_video.txt', 64],
    ['Scrum/Scrum.json', 'Scrum/Scrum_video.txt', 53],
  ];
  for (const [jsonRel, txtRel, count] of files) {
    const deck = JSON.parse(await readFile(path.join(root, jsonRel), 'utf8'));
    const txt = await readFile(path.join(root, txtRel), 'utf8');
    const paras = lectureParagraphs(txt);
    const bank = normalizeQuiz(deck);
    assert.equal(bank.questions.length, count, jsonRel);
    assert.equal(bank.skipped.length, 0, jsonRel);
    for (const q of bank.questions) {
      const quote = q.reference && q.reference.lecture;
      assert.ok(quote, jsonRel + ' missing video quote: ' + q.text.slice(0, 72));
      const hits = matchingLectureIndexes(paras, quote);
      assert.ok(hits.length, jsonRel + ' unmatched video quote for: ' + q.text.slice(0, 72));
    }
  }
});

test('quiz banks keep at most four choices on a card', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');
  const here = path.dirname(fileURLToPath(import.meta.url));
  const files = [
    '../../541-Mod1/Ch1/ch1.json',
    '../../541-Mod1/Ch2/Ch2.json',
    '../../541-Mod1/Ch3/Ch3.json',
    '../../541-Mod1/Ch4/Ch4.json',
    '../../541-Mod1/Ch5/Ch5.json',
    '../../544-Mod-1/Ch1/SWmaturity.json',
    '../../544-Mod-1/Ch3/processAssessment.json',
    '../../544-Mod-1/Scrum/Scrum.json',
  ];
  for (const rel of files) {
    const deck = JSON.parse(await readFile(path.join(here, rel), 'utf8'));
    const bank = normalizeQuiz(deck);
    for (const q of bank.questions) {
      if (q.type === 'boolean') continue;
      assert.ok(q.options.length <= 4, rel + ' has more than 4 options: ' + q.text.slice(0, 72));
    }
  }
});

test('544 Module 1 single-choice answers are not uniquely longest by a wide margin', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../544-Mod-1');
  const files = [
    'Ch1/SWmaturity.json',
    'Ch2/processChange.json',
    'Ch3/processAssessment.json',
    'Ch4/cpsc544_04_initial_process_quiz.json',
    'Ch5/cpsc544_ch5_managing_software_organizations_quiz.json',
    'Agile_XP/agile_xp_quiz.json',
    'Scrum/Scrum.json',
  ];
  for (const rel of files) {
    const deck = JSON.parse(await readFile(path.join(root, rel), 'utf8'));
    const bank = normalizeQuiz(deck);
    for (const q of bank.questions) {
      if (q.type !== 'single' || q.options.length < 3) continue;
      const lens = q.options.map((o) => o.length);
      const max = Math.max(...lens);
      const next = Math.max(...lens.filter((_, i) => i !== q.answers[0]));
      const uniqueMax = lens[q.answers[0]] === max && lens.filter((n) => n === max).length === 1;
      assert.ok(!uniqueMax || max - next < 12, rel + ' longest-correct giveaway: ' + q.text.slice(0, 72));
    }
  }
});

test('lecture quotes, when present, hit a transcript paragraph', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../541-Mod1');
  const files = [
    ['Ch1/ch1.json', 'Ch1/Chapter 1V2.txt'],
    ['Ch2/Ch2.json', 'Ch2/Chapter 2v2.txt'],
    ['Ch3/Ch3.json', 'Ch3/Chapter 3v2.txt'],
    ['Ch4/Ch4.json', 'Ch4/Chapter 4v2.txt'],
    ['Ch5/Ch5.json', 'Ch5/Chapter 5v2.txt'],
  ];
  for (const [jsonRel, txtRel] of files) {
    const deck = JSON.parse(await readFile(path.join(root, jsonRel), 'utf8'));
    const txt = await readFile(path.join(root, txtRel), 'utf8');
    const paras = lectureParagraphs(txt);
    const bank = normalizeQuiz(deck);
    for (const q of bank.questions) {
      const quote = q.reference && q.reference.lecture;
      if (!quote) continue;
      const hits = matchingLectureIndexes(paras, quote);
      assert.ok(hits.length, jsonRel + ' unmatched lecture for: ' + q.text.slice(0, 72));
    }
  }
});
