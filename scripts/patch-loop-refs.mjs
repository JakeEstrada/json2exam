#!/usr/bin/env node
/** Curated multi-book citations for Python and JavaScript loops decks. */
import { readFileSync, writeFileSync } from 'node:fs';

const CC = 'Python Crash Course, 3rd Edition by Eric Matthes';
const FL = 'Fluent Python, 2nd Edition by Luciano Ramalho';
const ELO = 'Eloquent JavaScript, 4th Edition by Marijn Haverbeke';
const DEF = 'JavaScript: The Definitive Guide, 7th Edition by David Flanagan';
const GOOD = 'JavaScript: The Good Parts by Douglas Crockford';
const YDK = "You Don't Know JS Yet: Scope & Closures, 2nd Edition by Kyle Simpson";

const PY = {
  range: {
    book: CC,
    page: 96,
    excerpt: 'Using range() to Make a List of Numbers If you want to make a list of numbers, you can convert the results of range() directly into a list using the list() function. When you wrap list() around a call to the range() function, the output will be a list of numbers.',
    books: [{
      book: FL,
      page: 92,
      excerpt: 'The problem with Example 2-11 is that, in essence, it behaves like this code: row = [\'_\'] * 3; board = []; for i in range(3): board.append(row). The same row is appended three times to board.',
    }],
  },
  forList: {
    book: CC,
    page: 89,
    excerpt: 'When you’re using loops for the first time, keep in mind that the set of steps is repeated once for each item in the list, no matter how many items are in the list.',
    books: [{
      book: FL,
      page: 61,
      excerpt: 'A for loop may be used to do lots of different things: scanning a sequence to count or pick items, computing aggregates (sums, averages), or any number of other processing tasks.',
    }],
  },
  colon: {
    book: CC,
    page: 94,
    excerpt: 'If you accidentally forget the colon, you’ll get a syntax error because Python doesn’t know exactly what you’re trying to do. SyntaxError: expected \':\'. If the interpreter can identify a possible fix it will suggest one, like adding a colon at the end of a line.',
    books: [{
      book: FL,
      page: 61,
      excerpt: 'A for loop may be used to do lots of different things: scanning a sequence to count or pick items, computing aggregates (sums, averages), or any number of other processing tasks.',
    }],
  },
  while: {
    book: CC,
    page: 156,
    excerpt: 'The while loop is then set to keep running as long as the value of current_number is less than or equal to 5. The += operator is shorthand for current_number = current_number + 1. Python repeats the loop as long as the condition current_number <= 5 is true.',
    books: [{
      book: FL,
      page: 61,
      excerpt: 'A for loop may be used to do lots of different things: scanning a sequence to count or pick items, computing aggregates (sums, averages), or any number of other processing tasks.',
    }],
  },
  break: {
    book: CC,
    page: 160,
    excerpt: 'Rather than breaking out of a loop entirely without executing the rest of its code, you can use the continue statement to return to the beginning of the loop, based on the result of a conditional test.',
    books: [{
      book: FL,
      page: 61,
      excerpt: 'A for loop may be used to do lots of different things: scanning a sequence to count or pick items, computing aggregates (sums, averages), or any number of other processing tasks.',
    }],
  },
  continue: {
    book: CC,
    page: 160,
    excerpt: 'Using continue in a Loop Rather than breaking out of a loop entirely without executing the rest of its code, you can use the continue statement to return to the beginning of the loop, based on the result of a conditional test.',
    books: [{
      book: FL,
      page: 61,
      excerpt: 'A for loop may be used to do lots of different things: scanning a sequence to count or pick items, computing aggregates (sums, averages), or any number of other processing tasks.',
    }],
  },
  unpack: {
    book: CC,
    page: 89,
    excerpt: 'When you’re using loops for the first time, keep in mind that the set of steps is repeated once for each item in the list, no matter how many items are in the list.',
    books: [{
      book: FL,
      page: 70,
      excerpt: 'As we iterate over the list, passport is bound to each tuple. The for loop knows how to retrieve the items of a tuple separately - this is called unpacking.',
    }],
  },
};

const JS = {
  forCount: {
    book: ELO,
    page: 64,
    excerpt: 'This program is exactly equivalent to the earlier even-number-printing example. The only change is that all the statements that are related to the “state” of the loop are grouped together after for. The parentheses after a for keyword must contain two semicolons.',
    books: [
      { book: GOOD, page: 36, excerpt: 'The conventional form is controlled by three optional clauses: the initialization, the condition, and the increment. First, the initialization is done, which typically initializes the loop variable. Then, the condition is evaluated.' },
      { book: DEF, page: 73, excerpt: 'Bindings declared as part of a for, for/in, or for/of loop have the loop body as their scope, even though they technically appear outside of the curly braces.' },
      { book: YDK, page: 111, excerpt: 'for (const i = 0; keepGoing; /* nothing here */ ) { keepGoing = (Math.random() > 0.5); } There’s no reason to declare i in that position with a const, since the whole point of such a variable in that position is to be used for counting iterations.' },
    ],
  },
  forOf: {
    book: ELO,
    page: 118,
    excerpt: 'When a for loop uses the word of after its variable definition, it will loop over the elements of the value given after of. This works not only for arrays but also for strings and some other data structures.',
    books: [
      { book: DEF, page: 73, excerpt: 'Bindings declared as part of a for, for/in, or for/of loop have the loop body as their scope, even though they technically appear outside of the curly braces.' },
      { book: YDK, page: 31, excerpt: 'for (let student of students) { That statement assigns a value to student for each iteration of the loop.' },
      { book: GOOD, page: 61, excerpt: 'The for in statement can loop over all of the property names in an object. The enumeration will include all of the properties including functions and prototype properties that you might not be interested in, so it is necessary to filter out the values you don\'t want.' },
    ],
  },
  while: {
    book: ELO,
    page: 61,
    excerpt: 'A statement starting with the keyword while creates a loop. The word while is followed by an expression in parentheses and then a statement, much like if. The loop keeps entering that statement as long as the expression produces a value that gives true when converted to Boolean.',
    books: [
      { book: GOOD, page: 36, excerpt: 'The conventional form is controlled by three optional clauses: the initialization, the condition, and the increment. First, the initialization is done, which typically initializes the loop variable. Then, the condition is evaluated.' },
      { book: DEF, page: 73, excerpt: 'Bindings declared as part of a for, for/in, or for/of loop have the loop body as their scope, even though they technically appear outside of the curly braces.' },
      { book: YDK, page: 111, excerpt: 'for (const i = 0; keepGoing; /* nothing here */ ) { keepGoing = (Math.random() > 0.5); } The whole point of such a variable in that position is to be used for counting iterations.' },
    ],
  },
  doWhile: {
    book: ELO,
    page: 62,
    excerpt: 'A do loop is a control structure similar to a while loop. It differs only on one point: a do loop always executes its body at least once, and it starts testing whether it should stop only after that first execution.',
    books: [
      { book: GOOD, page: 36, excerpt: 'If the condition is omitted, then a condition of true is assumed. If the condition is true, then the statement is executed, then the increment is done, and then the loop repeats.' },
    ],
  },
  break: {
    book: ELO,
    page: 65,
    excerpt: 'Breaking Out of a Loop Having the looping condition produce false is not the only way a loop can finish. The break statement has the effect of immediately jumping out of the enclosing loop.',
    books: [
      { book: GOOD, page: 36, excerpt: 'The conventional form is controlled by three optional clauses: the initialization, the condition, and the increment.' },
    ],
  },
};

function apply(file, pick) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  data.questions.forEach((q) => {
    const ref = pick(q);
    if (!ref) return;
    q.reference = {
      ...(q.reference && q.reference.section ? { section: q.reference.section } : {}),
      book: ref.book,
      page: ref.page,
      excerpt: ref.excerpt,
      ...(ref.books ? { books: ref.books } : {}),
    };
  });
  const cited = new Map();
  data.questions.forEach((q) => {
    const rows = q.reference ? [{ book: q.reference.book, page: q.reference.page }, ...(q.reference.books || [])] : [];
    rows.forEach((row) => {
      if (!row.book) return;
      if (!cited.has(row.book)) cited.set(row.book, row.page);
    });
  });
  data.reading = [...cited.entries()].map(([book, page]) => ({ book, page }));
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

apply('applied-classroom/python/language/loops/quiz.json', (q) => {
  const t = String(q.question || '');
  if (/range/.test(t)) return PY.range;
  if (/while|indented body of a while|\+\+i|Infinite while/.test(t)) return /indented|introduces/.test(t) ? PY.colon : PY.while;
  if (/break/.test(t) || /else\?/.test(t)) return PY.break;
  if (/continue/.test(t)) return PY.continue;
  if (/index and value|enumerate/.test(t)) return PY.unpack;
  if (/loop values|for i in range\(len|keys of a dict|for item in rows|for i in range\(n\)/.test(t)) return PY.forList;
  return PY.forList;
});

apply('applied-classroom/javascript/language/loops/quiz.json', (q) => {
  const t = String(q.question || '');
  const code = String(q.code || '');
  if (/of items|for\.\.\.of|word of|of`/.test(t + code) || /of items/.test(code)) return JS.forOf;
  if (/do loop|always runs once|do \{/.test(t + code)) return JS.doWhile;
  if (/break/.test(t)) return JS.break;
  if (/while|When does this test/.test(t)) return JS.while;
  if (/forEach|for\.\.\.in|in rows/.test(t + code)) return JS.forOf;
  return JS.forCount;
});

console.log('patched python and javascript loops');
