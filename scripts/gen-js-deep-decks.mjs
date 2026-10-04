#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const ELO = 'Eloquent JavaScript, 4th Edition by Marijn Haverbeke';
const DEF = 'JavaScript: The Definitive Guide, 7th Edition by David Flanagan';
const YDK = "You Don't Know JS Yet: Scope & Closures, 2nd Edition by Kyle Simpson";

function cite(section, book, page, excerpt, books) {
  const ref = { section, book, page, excerpt };
  if (books && books.length) ref.books = books;
  return ref;
}

function mc(question, options, answer, explanation, ref, code, level = 2) {
  return { question, type: 'multiple', level, options, answer, explanation, reference: ref, code };
}

function jsCode(question, starter, solution, tests, section, book, page, excerpt, hints) {
  return {
    question,
    type: 'code',
    level: 3,
    language: 'javascript',
    starter,
    solution,
    tests,
    hints: hints || [],
    explanation: 'Run it. The tests call your function.',
    reference: cite(section, book, page, excerpt),
  };
}

function sourceCard(fn, source, section, book, page, excerpt) {
  return {
    question: 'Return JavaScript: ' + source.replace(/\n/g, '\\n'),
    type: 'code',
    level: 3,
    language: 'javascript',
    starter: 'function ' + fn + '() {\n  return "";\n}',
    solution: 'function ' + fn + '() {\n  return ' + JSON.stringify(source) + ';\n}',
    tests: [{ call: fn + '()', expected: source }],
    hints: [],
    explanation: 'Type the JavaScript source as a string. The runner cannot await a live promise.',
    reference: cite(section, book, page, excerpt),
  };
}

function writeDeck(folder, title, notes, questions, reading) {
  writeFileSync(folder + '/notes.md', notes.trim() + '\n');
  writeFileSync(folder + '/quiz.json', JSON.stringify({ title, questions, reading }, null, 2) + '\n');
  writeFileSync(folder + '/README.md', '# ' + title + '\n\nRead notes.md, then take the quiz.\n');
  console.log('wrote', folder, questions.length);
}

const eloMap = 'The map method transforms an array by applying a function to all of its elements and building a new array from the returned values.';
const eloFilter = 'Note how the filter function, rather than deleting elements from the existing array, builds up a new array with only the elements that pass';
const eloReduce = 'The parameters to reduce are, apart from the array, a combining function and a start value.';
const defReduceEmpty = 'Calling reduce() on an empty array with no initial value argument causes a TypeError.';
const defSome = 'Note that both every() and some() stop iterating array elements as soon as they know what value to return.';
const defSlice = 'The slice() method returns a slice, or subarray, of the specified array.';
const defSort = 'a.sort();               // a == [1111, 222, 33, 4]; alphabetical order';
const defForEach = 'None of the methods described here modify the array on which they are invoked';

const arrayNotes = `# Array methods

\`map\`, \`filter\`, and \`reduce\` build new values. \`splice\` and \`sort\` change the array you already have.

## What you should be able to do

- Pick \`map\`, \`filter\`, \`reduce\`, \`find\`, \`some\`, or \`every\` for the job.
- Know which methods copy and which mutate.
- Pass a comparator to \`sort\`. Default sort is string order.
- Avoid \`array.map(parseInt)\`.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Filtering arrays* / *Transforming with map* / *Summarizing with reduce* (PDF p. 146-149).
- JavaScript: The Definitive Guide, 7th Edition - array methods, \`slice\` / \`splice\`, and \`sort\` (PDF p. 184-194).

## map

\`map\` calls your function once per element and builds a **new** array of the same length. The callback return value becomes the new element. \`forEach\` ignores the callback return and itself returns \`undefined\`.

\`\`\`js
[1, 2, 3].map((n) => n * 2);          // [2, 4, 6]
[1, 2, 3].forEach((n) => n * 2);      // undefined
\`\`\`

The callback is \`(element, index, array)\`. That second argument is why this is a trap:

\`\`\`js
["10", "10", "10"].map(parseInt);     // [10, NaN, 2]
["10", "10", "10"].map(Number);       // [10, 10, 10]
\`\`\`

\`parseInt(string, radix)\` receives the index as the radix. Index 1 is an illegal radix. Index 2 parses \`"10"\` as binary.

## filter

\`filter\` builds a new array of elements whose predicate is truthy. It does not delete from the original. It skips holes in a sparse array, so the result is dense.

\`\`\`js
[5, 4, 3, 2, 1].filter((x) => x < 3); // [2, 1]
\`\`\`

## reduce

\`reduce\` folds the array into one value. Pass a start value.

\`\`\`js
[1, 2, 3, 4].reduce((sum, n) => sum + n, 0); // 10
\`\`\`

With no start value, the first element is the start and the callback begins at the second element. \`[7].reduce((a, b) => a + b)\` returns \`7\` and never calls the function. \`[].reduce((a, b) => a + b)\` throws \`TypeError\`.

## some and every

\`some\` is "there exists". \`every\` is "for all". Both stop as soon as the answer is known. \`some([])\` is \`false\`. \`every([])\` is \`true\` (there is no counterexample).

## slice and splice

\`slice(start, end)\` copies. The end index is excluded. Negative indexes count from the end. The original array stays.

\`splice(start, deleteCount, ...items)\` mutates. It returns the deleted elements, not the array.

\`\`\`js
[1, 2, 3, 4].slice(1, 3);   // [2, 3], original unchanged
const a = [1, 2, 3, 4];
a.splice(1, 2);             // returns [2, 3], a is [1, 4]
\`\`\`

## sort

\`sort()\` with no comparator converts elements to strings. \`[33, 4, 1111, 222].sort()\` becomes \`[1111, 222, 33, 4]\`.

A comparator returns a negative number to put the first argument earlier, \`0\` if they are tied, and a positive number to put the first argument later. \`sort\` mutates and also returns the same array. Since ES2019 it is stable: ties keep their old order.

\`\`\`js
nums.slice().sort((a, b) => a - b);   // numeric copy
\`\`\`

## Coding tasks

Write \`doubleEvens\`, \`sum\`, and \`numericSorted\` without mutating the caller's array.
`;

const arrayQuestions = [
  mc('What does map return?',
    ['The original array, mutated', 'A new array of the same length', 'undefined', 'Only the elements that pass a test'],
    'b', 'The callback return values become the new elements.',
    cite('map', ELO, 147, eloMap),
    '[1, 2, 3].map((n) => n * 2);', 1),
  mc('What does forEach return?',
    ['A new array of callback results', 'The original array', 'undefined', 'The last callback return'],
    'c', 'forEach is for side effects. The callback return is ignored.',
    cite('map', DEF, 184, defForEach),
    '[1, 2, 3].forEach((n) => n * 2);', 1),
  mc('["10", "10", "10"].map(parseInt) is…',
    ['[10, 10, 10]', '[10, NaN, 2]', '[NaN, NaN, NaN]', 'a thrown TypeError'],
    'b', 'map passes the index as parseInt\'s radix. Use Number, or (s) => parseInt(s, 10).',
    cite('map', ELO, 147, eloMap),
    '["10", "10", "10"].map(parseInt);', 3),
  mc('filter compared with deleting inside a loop…',
    ['Removes elements from the same array', 'Builds a new array and leaves the original', 'Always returns the same length', 'Throws if the predicate is false'],
    'b', 'The book version pushes keepers into a fresh array.',
    cite('filter', ELO, 146, eloFilter),
    '[5, 4, 3, 2, 1].filter((x) => x < 3);', 1),
  mc('[5, 4, 3, 2, 1].filter((x) => x < 3) is…',
    ['[5, 4, 3]', '[2, 1]', '[1, 2]', '[5, 4]'],
    'b', 'Order of survivors is preserved. It does not sort them.',
    cite('filter', DEF, 185, 'a.filter(x => x < 3)         // => [2, 1]; values less than 3'),
    '[5, 4, 3, 2, 1].filter((x) => x < 3);', 2),
  mc('reduce([1, 2, 3, 4], (a, b) => a + b, 0) is…',
    ['10', '24', '4', 'undefined'],
    'a', 'Start at 0, then add each element.',
    cite('reduce', ELO, 148, eloReduce),
    '[1, 2, 3, 4].reduce((a, b) => a + b, 0);', 1),
  mc('[].reduce((a, b) => a + b) does what?',
    ['Returns 0', 'Returns undefined', 'Throws TypeError', 'Returns []'],
    'c', 'No start value and no first element. Pass 0 if the array might be empty.',
    cite('reduce', DEF, 187, defReduceEmpty),
    '[].reduce((a, b) => a + b);', 3),
  mc('[7].reduce((a, b) => a + b) with no start value…',
    ['Throws, because the callback needs two numbers', 'Returns 7 and does not call the callback', 'Returns 0', 'Returns undefined'],
    'b', 'One element and no initial value: that element is the result.',
    cite('reduce', DEF, 187, 'If you call it with only one value—either an array with one element and no initial value or an empty array and an initial value—it simply returns that one value without ever calling the reduction function.'),
    '[7].reduce((a, b) => a + b);', 3),
  mc('some and every stop early when…',
    ['The array is sparse', 'The answer is already known', 'The callback returns 0', 'You forget the start value'],
    'b', 'some returns on the first truthy predicate. every returns on the first falsy one.',
    cite('some and every', DEF, 186, defSome),
    '[1, 2, 3, 4, 5].some((x) => x % 2 === 0);', 2),
  mc('every([]) is…',
    ['false', 'true', 'undefined', 'a thrown TypeError'],
    'b', 'There is no element that fails the test. some([]) is false.',
    cite('some and every', DEF, 186, defSome),
    '[].every(() => false);', 3),
  mc('slice(1, 3) on [1, 2, 3, 4]…',
    ['Mutates the array to [1, 4] and returns [2, 3]', 'Returns [2, 3] and leaves the original', 'Returns [2, 3, 4]', 'Returns [1, 2, 3]'],
    'b', 'End is exclusive. slice copies.',
    cite('slice and splice', DEF, 190, defSlice),
    '[1, 2, 3, 4].slice(1, 3);', 2),
  mc('splice(1, 2) on [1, 2, 3, 4] returns…',
    ['[1, 4], the array after deletion', '[2, 3], the deleted elements', 'undefined', '[1, 2, 3, 4]'],
    'b', 'The array itself becomes [1, 4]. The return value is what was removed.',
    cite('slice and splice', DEF, 191, 'a.splice(1,2)   // => [2,3]; a is now [1,4]'),
    'const a = [1, 2, 3, 4];\na.splice(1, 2);', 2),
  mc('[33, 4, 1111, 222].sort() with no comparator is…',
    ['[4, 33, 222, 1111]', '[1111, 222, 33, 4]', '[33, 4, 222, 1111]', 'a thrown TypeError'],
    'b', 'Default sort compares strings. "1111" comes before "4".',
    cite('sort', DEF, 194, defSort),
    '[33, 4, 1111, 222].sort();', 2),
  mc('A numeric sort comparator (a, b) => a - b means…',
    ['Negative puts a first, positive puts b first', 'Always sort descending', 'Return true to swap', 'The original array is copied first'],
    'a', 'sort still mutates. Copy with slice if you need the old order.',
    cite('sort', DEF, 194, 'a.sort((a,b) => b-a);   // a == [1111, 222, 33, 4]; reverse numerical order'),
    'nums.slice().sort((a, b) => a - b);', 2),
  mc('find when nothing matches returns…',
    ['-1', 'null', 'undefined', '[]'],
    'c', 'findIndex returns -1. find returns undefined.',
    cite('some and every', DEF, 185, 'Unlike filter(), however, these two methods stop iterating the first time the predicate finds an element. When that happens, find() returns the matching element, and findIndex() returns the index of the'),
    '[1, 2, 3].find((n) => n > 9);', 2),
  mc('[1, [2, [3]]].flat() is…',
    ['[1, 2, 3]', '[1, 2, [3]]', '[[1, 2, 3]]', '[1, [2, [3]]]'],
    'b', 'flat() defaults to depth 1. flat(Infinity) goes all the way.',
    cite('map', DEF, 188, 'let a = [1, [2, [3, [4]]]];'),
    '[1, [2, [3]]].flat();', 3),
  mc('Which chain leaves the source array unchanged?',
    ['arr.sort((a, b) => a - b)', 'arr.splice(0, 1)', 'arr.filter(Boolean).map(Number)', 'arr.reverse()'],
    'c', 'filter and map copy. sort, splice, and reverse mutate.',
    cite('filter', ELO, 146, eloFilter),
    'nums.filter((n) => n % 2 === 0).map((n) => n * 2);', 2),
  mc('Why is a hole in a sparse array different under filter than under map?',
    ['filter calls the predicate on the hole', 'map keeps the hole; filter skips holes and returns a dense array', 'Both throw on holes', 'map deletes holes'],
    'b', 'Flanagan: filter skips missing elements and the result is always dense.',
    cite('filter', DEF, 185, 'Note that filter() skips missing elements in sparse arrays and that its return value is always dense.'),
    'const sparse = [1, , 3];\nsparse.map((n) => n);\nsparse.filter(() => true);', 3),
  jsCode(
    'Write doubleEvens(nums): a new array of the even numbers, each doubled. Do not mutate nums.',
    'function doubleEvens(nums) {\n}\n',
    'function doubleEvens(nums) {\n  return nums.filter((n) => n % 2 === 0).map((n) => n * 2);\n}\n',
    [
      { call: 'doubleEvens([1, 2, 3, 4])', expected: [4, 8] },
      { label: 'does not mutate', setup: 'const nums = [1, 2]; doubleEvens(nums);', call: 'nums', expected: [1, 2] },
    ],
    'Coding tasks', ELO, 147, eloMap,
    ['filter, then map.'],
  ),
  jsCode(
    'Write sum(nums). An empty array sums to 0.',
    'function sum(nums) {\n}\n',
    'function sum(nums) {\n  return nums.reduce((total, n) => total + n, 0);\n}\n',
    [
      { call: 'sum([1, 2, 3, 4])', expected: 10 },
      { call: 'sum([])', expected: 0 },
    ],
    'Coding tasks', ELO, 148, eloReduce,
    ['Pass 0 as the start value.'],
  ),
  jsCode(
    'Write numericSorted(nums): a new array in ascending numeric order. Do not mutate nums.',
    'function numericSorted(nums) {\n}\n',
    'function numericSorted(nums) {\n  return nums.slice().sort((a, b) => a - b);\n}\n',
    [
      { call: 'numericSorted([10, 2, 1])', expected: [1, 2, 10] },
      { label: 'does not mutate', setup: 'const nums = [10, 2]; numericSorted(nums);', call: 'nums', expected: [10, 2] },
    ],
    'Coding tasks', DEF, 194, defSort,
    ['slice() first, then sort with a - b.'],
  ),
];

const eloClosure = 'A function that references bindings from local scopes around it is called a closure.';
const eloEnv = 'When called, the function body sees the environment in which it was created, not the environment in which it is called.';
const ydkLive = 'Closure is actually a live link, preserving access to the full variable itself.';
const ydkLet = 'Since we’re using let, three i’s are created, one for each loop, so each of the three closures just work as expected.';

const closureNotes = `# Closures

A closure is a function plus the bindings it can still see from where it was created.

## What you should be able to do

- Explain why \`wrapValue(1)\` and \`wrapValue(2)\` do not share \`local\`.
- Treat a closure as a live link, not a snapshot.
- Predict a \`for (var i)\` loop of functions versus \`for (let i)\`.
- Hide state by returning functions that close over a \`let\`.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Closure* (PDF p. 86-87).
- You Don't Know JS Yet: Scope & Closures, 2nd Edition - *Live Link, Not a Snapshot* (PDF p. 156) and \`let\` in a loop (PDF p. 162).

## Closure

\`\`\`js
function wrapValue(n) {
  let local = n;
  return () => local;
}
const wrap1 = wrapValue(1);
const wrap2 = wrapValue(2);
wrap1(); // 1
wrap2(); // 2
\`\`\`

Each call to \`wrapValue\` creates a new environment. The returned function keeps that environment after \`wrapValue\` has returned. The call site of \`wrap1()\` does not matter. What matters is where the function was created.

\`multiplier(2)\` returns \`number => number * factor\`. \`twice(5)\` is 10 because \`factor\` is still 2.

## Live link

Closing over a variable does not copy its value at creation time. Later assignments are visible.

\`\`\`js
function later() {
  let name = "Ada";
  const greet = () => name;
  name = "Grace";
  return greet;
}
later()(); // "Grace"
\`\`\`

Two functions that close over the same \`let\` share that binding. Reassigning it is visible to both.

A closure also keeps the binding alive. If the inner function is still reachable, a large object it closes over cannot be collected.

## Loop bindings

\`var\` has one binding for the whole function. Functions created in \`for (var i = 0; i < 3; i++)\` all read that same \`i\`, which is \`3\` after the loop.

\`for (let i = 0; i < 3; i++)\` creates a new \`i\` per iteration. Each function returns its own index: 0, 1, then 2.

## Coding tasks

Write \`makeMultiplier\`, \`makeCounter\`, and \`capture\` so each call keeps its own bindings.
`;

const closureQuestions = [
  mc('Eloquent\'s definition: a closure is a function that…',
    ['Copies every outer variable when it is created', 'References bindings from local scopes around it', 'Runs only once', 'Cannot return a value'],
    'b', 'The function and those surrounding bindings travel together.',
    cite('Closure', ELO, 87, eloClosure),
    'function wrapValue(n) {\n  let local = n;\n  return () => local;\n}', 1),
  mc('wrapValue(1)() and wrapValue(2)() return…',
    ['2 and 2, because local is global', '1 and 2, because each call has its own local', 'undefined and undefined', '1 and 1'],
    'b', 'Each invocation of wrapValue builds a fresh environment.',
    cite('Closure', ELO, 86, 'let wrap1 = wrapValue(1);\n let wrap2 = wrapValue(2);\n console.log(wrap1());\n // → 1\n console.log(wrap2());\n // → 2'),
    'wrapValue(1)();\nwrapValue(2)();', 1),
  mc('multiplier(2) returns a function. twice(5) is 10 because…',
    ['5 is closed over and factor is ignored', 'factor is still 2 in the environment where the arrow was created', 'twice is a global', 'Arrow functions ignore parameters'],
    'b', 'The call to twice does not create factor. multiplier did.',
    cite('Closure', ELO, 87, eloEnv),
    'function multiplier(factor) {\n  return (number) => number * factor;\n}\nconst twice = multiplier(2);\ntwice(5);', 2),
  mc('A closure sees which environment?',
    ['The environment where it is called', 'The environment where it was created', 'Only global bindings', 'The caller\'s parameters'],
    'b', 'Call site does not rebuild the closed-over bindings.',
    cite('Closure', ELO, 87, eloEnv),
    'const twice = multiplier(2);\ntwice(5);', 2),
  mc('Closure is a snapshot of the value. That claim is…',
    ['True for let, false for var', 'False. It is a live link to the variable', 'True, which is why loops are safe', 'Only true for const'],
    'b', 'You can read and write the closed-over variable later.',
    cite('Live link', YDK, 156, ydkLive),
    'let name = "Ada";\nconst greet = () => name;\nname = "Grace";\ngreet();', 2),
  mc('later() assigns name = "Grace" after creating greet. greet() returns…',
    ['"Ada"', '"Grace"', 'undefined', 'the function later'],
    'b', 'greet reads name when it runs, not when it was created.',
    cite('Live link', YDK, 156, 'We’re not limited to merely reading a value; the closed-over variable can be updated (re-assigned) as well!'),
    'function later() {\n  let name = "Ada";\n  const greet = () => name;\n  name = "Grace";\n  return greet;\n}', 2),
  mc('Three functions saved from for (var i = 0; i < 3; i++) all return…',
    ['0, 1, and 2', '3', 'undefined', 'the function objects'],
    'b', 'var i is one binding. After the loop it is 3.',
    cite('Loop bindings', YDK, 161, 'var keeps = [];\n\nfor (var i = 0; i < 3; i++) {'),
    'for (var i = 0; i < 3; i++) {\n  fns.push(() => i);\n}', 2),
  mc('The same loop with let i returns…',
    ['3, 3, and 3', '0, 1, and 2', 'undefined', 'a SyntaxError'],
    'b', 'Each iteration gets its own i.',
    cite('Loop bindings', YDK, 162, ydkLet),
    'for (let i = 0; i < 3; i++) {\n  fns.push(() => i);\n}', 2),
  mc('Two arrows returned from one call, both reading the same let count…',
    ['Each has a private copy of the number', 'Share that one binding', 'See count only if it is const', 'Throw when count changes'],
    'b', 'One environment, two functions.',
    cite('Live link', YDK, 156, ydkLive),
    'function pair() {\n  let count = 0;\n  return [() => count, (n) => { count = n; }];\n}', 3),
  mc('Why can a returned inner function still read a local after the outer call finished?',
    ['Locals are copied onto the heap at return', 'The binding stays reachable through the function', 'JavaScript promotes every let to global', 'The call stack never pops'],
    'b', 'If something still references the inner function, the closed-over binding stays alive.',
    cite('Closure', ELO, 87, eloClosure),
    'function make() {\n  let secret = 1;\n  return () => secret;\n}', 2),
  mc('makeCounter()() then again on the same function returns 1 then 2. A second makeCounter() starts at…',
    ['3, because count is global', '1, because that call has its own count', '0', 'undefined'],
    'b', 'Each factory call creates a new binding.',
    cite('Closure', ELO, 86, 'This feature—being able to reference a specific instance of a local binding in an enclosing scope—is called closure.'),
    'function makeCounter() {\n  let n = 0;\n  return () => ++n;\n}', 2),
  mc('An inner function that never reads an outer local…',
    ['Still observably closes over those locals', 'Does not show closure over them', 'Is a syntax error', 'Freezes the outer variables'],
    'b', 'Simpson\'s test is observable use. Unused outer bindings are not kept for that function.',
    cite('Live link', YDK, 156, ydkLive),
    'function outer() {\n  let unused = [1, 2, 3];\n  return function inner() { return 1; };\n}', 3),
  mc('A callback passed to an event or ajax call is a closure when…',
    ['It is an arrow', 'It reads a binding from the function that registered it, later', 'It is named', 'It returns a promise'],
    'b', 'The outer call has finished before the callback runs, and the callback still sees those bindings.',
    cite('Loop bindings', YDK, 162, 'The onRecord(..) callback is going to be invoked at some point in the future'),
    'function lookup(id) {\n  return function onRecord(record) {\n    return id + ":" + record.name;\n  };\n}', 2),
  mc('Closing over a huge array you no longer need…',
    ['Lets the array be collected immediately', 'Keeps the array alive while the function is reachable', 'Copies only the array length', 'Is a syntax error'],
    'b', 'Drop the reference, or don\'t close over the array, if you need it collected.',
    cite('Live link', YDK, 168, 'The Closure Lifecycle and Garbage Collection (GC) Since closure is inherently tied to a function instance'),
    'function hold(rows) {\n  return () => rows.length;\n}', 3),
  mc('const versus let for a closed-over binding…',
    ['const is a snapshot; let is a live link', 'Both are live links. const only forbids reassignment', 'let copies; const closes', 'Neither can be read inside an inner function'],
    'b', 'You can still mutate an object held by const. You cannot reassign the binding.',
    cite('Live link', YDK, 156, ydkLive),
    'const box = { n: 1 };\nconst read = () => box.n;\nbox.n = 2;', 3),
  jsCode(
    'Write makeMultiplier(factor), returning a function of one number.',
    'function makeMultiplier(factor) {\n}\n',
    'function makeMultiplier(factor) {\n  return (number) => number * factor;\n}\n',
    [{ setup: 'const twice = makeMultiplier(2);', call: 'twice(5)', expected: 10 }],
    'Coding tasks', ELO, 87, 'function multiplier(factor) {\n   return number => number * factor;\n }',
    ['Return an arrow that multiplies by factor.'],
  ),
  jsCode(
    'Write makeCounter(). Each call to the returned function returns 1, then 2, then 3. Two counters do not share state.',
    'function makeCounter() {\n}\n',
    'function makeCounter() {\n  let n = 0;\n  return function next() {\n    n += 1;\n    return n;\n  };\n}\n',
    [
      { setup: 'const a = makeCounter();', call: '[a(), a()]', expected: [1, 2] },
      { setup: 'const a = makeCounter(); const b = makeCounter(); a();', call: 'b()', expected: 1 },
    ],
    'Coding tasks', ELO, 86, eloClosure,
    ['Close over let n = 0.'],
  ),
  jsCode(
    'Write capture(n): an array of n functions. The function at index i returns i. Use let, not var.',
    'function capture(n) {\n}\n',
    'function capture(n) {\n  const fns = [];\n  for (let i = 0; i < n; i++) fns.push(() => i);\n  return fns;\n}\n',
    [{ setup: 'const fns = capture(3);', call: '[fns[0](), fns[1](), fns[2]()]', expected: [0, 1, 2] }],
    'Coding tasks', YDK, 162, ydkLet,
    ['for (let i = 0; i < n; i++)'],
  ),
];

const eloRec = 'A function that calls itself is called recursive.';
const eloPower = 'console.log(power(2, 3));\n // → 8';
const eloStack = 'It is perfectly okay for a function to call itself, as long as it doesn’t do it so often that it overflows the stack.';

const recursionNotes = `# Recursion

A function that calls itself. Each call has its own parameters. The stack grows until a base case returns.

## What you should be able to do

- Write a base case that is actually reached.
- Return the recursive result. Dropping it computes nothing.
- Walk a tree, where a loop over one list is the wrong shape.
- Know the call stack can overflow. JavaScript engines do not give you reliable tail-call elimination.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Recursion* (PDF p. 88-89).

## Recursion

\`\`\`js
function power(base, exponent) {
  if (exponent === 0) return 1;
  return base * power(base, exponent - 1);
}
power(2, 3); // 8
\`\`\`

\`power(2, 3)\` waits on \`power(2, 2)\`, which waits on \`power(2, 1)\`, which waits on \`power(2, 0)\`. Then the multiplications finish on the way back: 1, 2, 4, 8.

The book notes this style is often slower than a loop for a straight product. Use it when the data branches.

## Base case

Without \`exponent === 0\`, every call makes another call. That is a \`RangeError: Maximum call stack size exceeded\`, not an infinite \`while\` that you can break from the outside easily.

The base case must be a value the recursion actually moves toward. \`power(2, -1)\` with only the \`=== 0\` check never hits it.

## Call stack

Each call stores its own \`base\` and \`exponent\`. The inner \`exponent - 1\` does not change the outer parameter.

A tree sum is the shape recursion is for:

\`\`\`js
function sumTree(node) {
  const kids = node.children || [];
  let total = node.value;
  for (const kid of kids) total += sumTree(kid);
  return total;
}
\`\`\`

Memoizing a pure function means storing results you already computed so a later call with the same arguments does not walk that branch again.

## Coding tasks

Write \`power\`, \`sumTree\`, and \`flatten\`.
`;

const recursionQuestions = [
  mc('power(2, 3) in the book returns…',
    ['6', '8', '9', 'undefined'],
    'b', '2 * 2 * 2, with power(2, 0) as 1.',
    cite('Recursion', ELO, 88, eloPower),
    'function power(base, exponent) {\n  if (exponent === 0) return 1;\n  return base * power(base, exponent - 1);\n}', 1),
  mc('A recursive function is one that…',
    ['Calls itself', 'Is declared with function*', 'Uses a for loop', 'Returns a closure'],
    'a', 'The call stack holds each invocation until the base case returns.',
    cite('Recursion', ELO, 88, eloRec),
    'return base * power(base, exponent - 1);', 1),
  mc('What happens if power never hits exponent === 0?',
    ['It returns undefined', 'The stack overflows', 'JavaScript rewrites it as a loop', 'It returns 0'],
    'b', 'The book\'s limit is overflowing the stack.',
    cite('Base case', ELO, 88, eloStack),
    'function power(base, exponent) {\n  return base * power(base, exponent - 1);\n}', 2),
  mc('Each recursive call\'s parameters…',
    ['Are the same bindings as the caller', 'Are a fresh set for that call', 'Are globals', 'Are frozen copies of the original arguments only'],
    'b', 'exponent - 1 is the next call\'s parameter. The caller\'s exponent stays.',
    cite('Call stack', ELO, 88, eloRec),
    'return base * power(base, exponent - 1);', 2),
  mc('power(2, 0) must return 1 because…',
    ['0 to any power is 0', 'That is the base case the multiplications build on', 'JavaScript defines 2 ** 0 as undefined', 'The function should throw'],
    'b', 'Any positive exponent bottoms out there.',
    cite('Base case', ELO, 88, 'if (exponent == 0) {\n     return 1;\n   }'),
    'power(2, 0);', 1),
  mc('Forgetting return in front of the recursive call…',
    ['Still multiplies on the way back', 'Returns undefined and throws away the inner result', 'Is a syntax error', 'Makes the function tail-call optimized'],
    'b', 'The inner call may run, but its value is discarded.',
    cite('Recursion', ELO, 88, 'return base * power(base, exponent - 1);'),
    'function power(base, exponent) {\n  if (exponent === 0) return 1;\n  base * power(base, exponent - 1);\n}', 2),
  mc('Why does the book still show a loop for a simple product?',
    ['Recursion is illegal for numbers', 'The recursive power was about three times slower in typical engines', 'Loops cannot multiply', 'Recursion cannot return numbers'],
    'b', 'Use recursion when it makes the branching structure clearer, not by habit.',
    cite('Recursion', ELO, 88, 'However, this implementation has one problem: in typical JavaScript implementations, it’s about three times slower than a version using a'),
    'function power(base, exponent) {\n  let result = 1;\n  for (let i = 0; i < exponent; i++) result *= base;\n  return result;\n}', 2),
  mc('A tree of nodes with children is a better fit for recursion than one loop because…',
    ['Loops cannot read objects', 'Each child is another list to walk, nested arbitrarily deep', 'Trees are arrays', 'Recursion is always faster'],
    'b', 'The book: some problems are easier with recursion than with loops, usually ones that branch.',
    cite('Call stack', ELO, 89, 'Recursion is not always just an inefficient alternative to looping.'),
    'function sumTree(node) {\n  let total = node.value;\n  for (const kid of node.children || []) total += sumTree(kid);\n  return total;\n}', 2),
  mc('JavaScript tail calls…',
    ['Are eliminated in every browser, so deep recursion is free', 'Are in the spec, but you should not rely on engines to remove the stack frame', 'Are a syntax error', 'Only work for arrows'],
    'b', 'Write a base case. Do not count on the stack disappearing.',
    cite('Call stack', ELO, 88, eloStack),
    'return power(base, exponent - 1);', 3),
  mc('power(2, -1) with only an exponent === 0 base case…',
    ['Returns 0.5', 'Never hits the base case and overflows', 'Returns -1', 'Is a SyntaxError'],
    'b', 'The exponent moves away from 0. Guard the precondition or switch direction.',
    cite('Base case', ELO, 88, eloStack),
    'power(2, -1);', 3),
  mc('sumTree({ value: 1, children: [{ value: 2 }, { value: 3 }] }) is…',
    ['6', '1', '5', 'undefined'],
    'a', '1 + 2 + 3. Missing children is an empty list, not a crash.',
    cite('Call stack', ELO, 89, 'Some problems really are easier to solve with recursion than with loops.'),
    'sumTree({ value: 1, children: [{ value: 2 }, { value: 3 }] });', 2),
  mc('flatten([1, [2, [3]], 4]) by recurring on arrays should be…',
    ['[1, 2, 3, 4]', '[1, [2, [3]], 4]', '10', '[4, 3, 2, 1]'],
    'a', 'A non-array is a one-element list. An array is the concat of flattening each item.',
    cite('Recursion', ELO, 88, eloRec),
    'function flatten(value) {\n  if (!Array.isArray(value)) return [value];\n  return value.flatMap(flatten);\n}', 2),
  mc('Mutual recursion means…',
    ['A function calls itself twice', 'Two functions call each other', 'A loop inside a function', 'A generator yields twice'],
    'b', 'isEven calls isOdd and the other way around. Both still need a base case.',
    cite('Recursion', ELO, 88, eloRec),
    'function isEven(n) {\n  if (n === 0) return true;\n  return isOdd(n - 1);\n}', 3),
  mc('Memoizing a pure recursive function stores…',
    ['Every local variable of the caller', 'Results for arguments you have already computed', 'The call stack on disk', 'Only the base case'],
    'b', 'The next call with the same arguments returns the stored result.',
    cite('Call stack', ELO, 89, 'Worrying about efficiency can be a distraction.'),
    'const seen = new Map();\nfunction fib(n) {\n  if (seen.has(n)) return seen.get(n);\n}', 3),
  mc('The stack frame for a recursive call is popped when…',
    ['The function is declared', 'That call returns', 'The program starts', 'You use let'],
    'b', 'Until then it holds that call\'s locals. That is why depth costs memory.',
    cite('Call stack', ELO, 88, eloStack),
    'return base * power(base, exponent - 1);', 2),
  jsCode(
    'Write power(base, exponent) for exponent >= 0. power(base, 0) is 1.',
    'function power(base, exponent) {\n}\n',
    'function power(base, exponent) {\n  if (exponent === 0) return 1;\n  return base * power(base, exponent - 1);\n}\n',
    [
      { call: 'power(2, 3)', expected: 8 },
      { call: 'power(5, 0)', expected: 1 },
    ],
    'Coding tasks', ELO, 88, eloPower,
    ['Base case first, then return base * power(base, exponent - 1).'],
  ),
  jsCode(
    'Write sumTree(node). node has value and an optional children array.',
    'function sumTree(node) {\n}\n',
    'function sumTree(node) {\n  const kids = node.children || [];\n  return kids.reduce((total, kid) => total + sumTree(kid), node.value);\n}\n',
    [{
      call: 'sumTree({ value: 1, children: [{ value: 2 }, { value: 4, children: [{ value: 8 }] }] })',
      expected: 15,
    }],
    'Coding tasks', ELO, 89, 'Some problems really are easier to solve with recursion than with loops.',
    ['Add node.value to the sum of sumTree on each child.'],
  ),
  jsCode(
    'Write flatten(value). Arrays are walked. Anything else becomes a one-element array.',
    'function flatten(value) {\n}\n',
    'function flatten(value) {\n  if (!Array.isArray(value)) return [value];\n  return value.reduce((out, item) => out.concat(flatten(item)), []);\n}\n',
    [{ call: 'flatten([1, [2, [3]], 4])', expected: [1, 2, 3, 4] }],
    'Coding tasks', ELO, 88, eloRec,
    ['If it is not an array, return [value].'],
  ),
];

const eloClass = 'The class keyword starts a class declaration, which allows us to define a constructor and a set of methods together.';
const eloField = 'Unlike methods, such properties are added to instance objects and not the prototype.';
const eloPrivate = 'To declare a private method, put a # sign in front of its name.';
const eloExtends = 'The use of the word extends indicates that this class shouldn’t be directly based on the default Object prototype but on some other class.';

const classNotes = `# Classes

\`class\` is syntax for a constructor function plus a prototype. Methods are shared. Fields and \`#\` privates live on the instance.

## What you should be able to do

- Write a constructor, a method, and \`new\`.
- Say where a method lives versus an instance field.
- Declare \`#private\` fields. They are not \`obj._secret\` by convention. They are invisible outside the class.
- Extend a class and call \`super\` before using \`this\`.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Classes* (PDF p. 167), private properties (PDF p. 169-170), inheritance (PDF p. 185-186).

## Classes

\`\`\`js
class Rabbit {
  constructor(type) {
    this.type = type;
  }
  speak(line) {
    console.log(this.type + ": " + line);
  }
}
const killer = new Rabbit("killer");
\`\`\`

\`new\` creates an object whose prototype is \`Rabbit.prototype\`, runs \`constructor\` with \`this\` set to that object, and returns the object (unless the constructor returns a different object).

\`speak\` is on \`Rabbit.prototype\`, not copied onto each rabbit. \`class\` declarations are in the temporal dead zone until that line runs. The class body is strict. Calling \`Rabbit()\` without \`new\` throws.

## Private properties

\`\`\`js
class Counter {
  #n = 0;
  inc() {
    this.#n += 1;
    return this.#n;
  }
}
\`\`\`

A public field such as \`speed = 0\` is created on each instance, not on the prototype. \`#\` names must be declared in the class. Reading them outside the class is a syntax error, not a runtime miss.

An arrow stored in a field is created per instance and closes over the instance \`this\`. A method on the prototype gets \`this\` from the call.

## Inheritance

\`\`\`js
class StepCounter extends Counter {
  constructor(start, step) {
    super(start);
    this.step = step;
  }
}
\`\`\`

\`extends\` sets the prototype chain. In a derived constructor, \`this\` is unavailable until \`super(...)\` returns. \`super.inc()\` calls the parent method. \`instanceof\` walks that chain: \`new StepCounter(0, 1) instanceof Counter\` is true.

## Coding tasks

Write \`Counter\`, \`StepCounter\`, and \`hasSpeak\`.
`;

const classQuestions = [
  mc('class Rabbit { constructor(type) { this.type = type; } speak(line) {} } puts speak on…',
    ['Each instance, as an own property', 'Rabbit.prototype', 'Object.prototype', 'the constructor\'s local variables'],
    'b', 'Methods are shared. new runs the constructor with this set to the new object.',
    cite('Classes', ELO, 167, eloClass),
    'class Rabbit {\n  constructor(type) { this.type = type; }\n  speak(line) {}\n}', 1),
  mc('Rabbit() without new…',
    ['Works the same as new Rabbit()', 'Throws. Constructors from class must be called with new', 'Returns Rabbit.prototype', 'Returns undefined and still sets this'],
    'b', 'class constructors cannot be called as plain functions.',
    cite('Classes', ELO, 167, 'This function cannot be called like a normal function. Constructors, in JavaScript, are called by putting the keyword new in front of them.'),
    'new Rabbit("killer");', 2),
  mc('A class field speed = 0 is stored…',
    ['On the prototype, shared by every instance', 'On each instance', 'As a # private always', 'On Function.prototype'],
    'b', 'Methods go on the prototype. Fields are per object.',
    cite('Private properties', ELO, 169, eloField),
    'class Particle {\n  speed = 0;\n}', 2),
  mc('#n on a class…',
    ['Is a normal property named "n"', 'Must be declared in the class and is invisible outside it', 'Is inherited from Object.prototype', 'Can be read as obj["#n"]'],
    'b', 'Outside the class, mentioning the private name is a syntax error.',
    cite('Private properties', ELO, 169, eloPrivate),
    'class Counter {\n  #n = 0;\n  inc() { this.#n += 1; return this.#n; }\n}', 2),
  mc('Object.hasOwn(new Counter(), "inc") is false because…',
    ['inc was not defined', 'inc lives on Counter.prototype', 'private methods are not functions', 'new does not set the prototype'],
    'b', 'The instance inherits inc. It does not own it.',
    cite('Classes', ELO, 167, eloClass),
    'Object.hasOwn(new Counter(), "inc");\nObject.hasOwn(Counter.prototype, "inc");', 2),
  mc('A derived constructor that uses this before super()…',
    ['Sees this as Object.prototype', 'Throws. this is uninitialized until super returns', 'Works if you assign a field', 'Calls the parent automatically first'],
    'b', 'super(start) has to finish before this.step = step.',
    cite('Inheritance', ELO, 185, 'To initialize a LengthList instance, the constructor calls the constructor of its superclass through the super keyword.'),
    'class StepCounter extends Counter {\n  constructor(start, step) {\n    super(start);\n    this.step = step;\n  }\n}', 3),
  mc('new StepCounter(0, 2) instanceof Counter is…',
    ['false, because instanceof checks the constructor name only', 'true, because the prototype chain includes Counter', 'true only if you copy methods', 'a TypeError'],
    'b', 'instanceof walks prototypes. extends wires that up.',
    cite('Inheritance', ELO, 186, 'The instanceof operator'),
    'new StepCounter(0, 2) instanceof Counter;', 2),
  mc('super.inc() inside a subclass method…',
    ['Calls the subclass inc again', 'Calls inc on the superclass prototype', 'Is the same as this.inc()', 'Is only legal in the constructor'],
    'b', 'super.something reads the parent, which is how an override reuses behavior.',
    cite('Inheritance', ELO, 186, 'We can use super.something to call methods and getters on the superclass’s prototype'),
    'inc() {\n  return super.inc();\n}', 2),
  mc('An arrow in a class field, get = () => this.n, when pulled off the instance…',
    ['Loses this, like a prototype method', 'Still sees the instance, because the arrow closed over this at construction', 'Sees the class constructor', 'Throws a SyntaxError'],
    'b', 'The field initializer runs with this set to the new object. The arrow keeps that this.',
    cite('Private properties', ELO, 169, eloField),
    'class Box {\n  n = 1;\n  get = () => this.n;\n}\nconst f = new Box().get;\nf();', 3),
  mc('class declarations and hoisting…',
    ['You can new the class anywhere above its line', 'The name is in a temporal dead zone until the class line runs', 'They behave like function declarations and are fully initialized first', 'They are not bindings'],
    'b', 'Referencing the class before its statement throws.',
    cite('Classes', ELO, 167, eloClass),
    'class Rabbit {\n  constructor(type) { this.type = type; }\n}', 3),
  mc('If a constructor returns an object, new…',
    ['Ignores that return and always gives you this', 'Uses the returned object instead of this', 'Throws', 'Returns undefined'],
    'b', 'Returning a non-object (or nothing) keeps this. Returning an object replaces it.',
    cite('Classes', ELO, 167, 'Doing so creates a fresh instance object whose prototype is the object from the function’s prototype property, then runs the function with this bound to the new object, and finally returns the object.'),
    'constructor() {\n  return { replaced: true };\n}', 3),
  mc('static parse(text) is called as…',
    ['new Counter().parse(text)', 'Counter.parse(text)', 'Counter.prototype.parse(text)', 'super.parse(text) from outside'],
    'b', 'Static methods sit on the constructor, not on instances.',
    cite('Classes', ELO, 167, eloClass),
    'class Counter {\n  static zero() { return new Counter(); }\n}\nCounter.zero();', 2),
  mc('Omitting constructor in a subclass…',
    ['Leaves this undefined forever', 'Uses a default constructor that calls super(...args)', 'Copies the parent fields by assignment', 'Is a syntax error'],
    'b', 'You only write a constructor when you need extra parameters or extra fields.',
    cite('Private properties', ELO, 170, 'When a class does not declare a constructor, it will automatically get an empty one.'),
    'class Loud extends Counter {}\nnew Loud();', 3),
  mc('Changing Rabbit.prototype.speak later…',
    ['Affects only rabbits created after the change', 'Is seen by instances that still inherit that prototype', 'Is impossible', 'Updates # private methods'],
    'b', 'Instances do not own the method. They look it up.',
    cite('Classes', ELO, 167, eloClass),
    'Rabbit.prototype.speak = function () { return this.type; };', 2),
  mc('A public field and a method of the same name: which wins on the instance?',
    ['The prototype method, always', 'The own field shadows the prototype method', 'A TypeError', 'The one declared first in the file'],
    'b', 'Own properties are found before the prototype chain.',
    cite('Private properties', ELO, 169, eloField),
    'class Box {\n  get = () => this.n;\n  get() { return 0; }\n}', 3),
  jsCode(
    'Write class Counter. new Counter(start).inc() adds 1 and returns the new count. value() reads it. Keep the count private.',
    'class Counter {\n}\n',
    'class Counter {\n  #n;\n  constructor(start = 0) {\n    this.#n = start;\n  }\n  inc() {\n    this.#n += 1;\n    return this.#n;\n  }\n  value() {\n    return this.#n;\n  }\n}\n',
    [
      { setup: 'const c = new Counter(2); c.inc();', call: 'c.value()', expected: 3 },
      { setup: 'const c = new Counter();', call: 'c.inc()', expected: 1 },
    ],
    'Coding tasks', ELO, 170, 'class RandomSource {\n   #max;\n   constructor(max) {\n     this.#max = max;\n   }',
    ['Declare #n. inc returns this.#n after adding 1.'],
  ),
  jsCode(
    'Write class StepCounter extends Counter. constructor(start, step) stores step. inc() calls super.inc() that many times and returns the last count. step is at least 1. Counter is already in the file.',
    'class Counter {\n  #n;\n  constructor(start = 0) {\n    this.#n = start;\n  }\n  inc() {\n    this.#n += 1;\n    return this.#n;\n  }\n  value() {\n    return this.#n;\n  }\n}\nclass StepCounter extends Counter {\n}\n',
    'class Counter {\n  #n;\n  constructor(start = 0) {\n    this.#n = start;\n  }\n  inc() {\n    this.#n += 1;\n    return this.#n;\n  }\n  value() {\n    return this.#n;\n  }\n}\nclass StepCounter extends Counter {\n  constructor(start, step) {\n    super(start);\n    this.step = step;\n  }\n  inc() {\n    let n = this.value();\n    for (let i = 0; i < this.step; i++) n = super.inc();\n    return n;\n  }\n}\n',
    [{ setup: 'const c = new StepCounter(0, 2);', call: 'c.inc()', expected: 2 }],
    'Coding tasks', ELO, 185, eloExtends,
    ['Call super(start) before touching this.'],
  ),
  jsCode(
    'Write hasSpeak(obj): true when obj has a function property named speak, own or inherited.',
    'function hasSpeak(obj) {\n}\n',
    'function hasSpeak(obj) {\n  return typeof obj.speak === "function";\n}\n',
    [
      { setup: 'class Rabbit { speak() {} }', call: 'hasSpeak(new Rabbit())', expected: true },
      { call: 'hasSpeak({})', expected: false },
    ],
    'Coding tasks', ELO, 167, eloClass,
    ['typeof obj.speak === "function" follows the prototype.'],
  ),
];

const eloThrow = 'Exceptions are a mechanism that makes it possible for code that runs into a problem to raise (or throw) an exception.';
const eloAny = 'An exception can be any value.';
const eloFinally = 'Note that even though the finally code is run when an exception is thrown in the try block, it does not interfere with the exception. After the finally block runs, the stack continues unwinding.';

const errorNotes = `# Error handling

\`throw\` unwinds the stack until a \`catch\`, or until it leaves the program. \`finally\` runs on the way out.

## What you should be able to do

- Throw \`new Error\` (or a subclass) with a message.
- Catch a specific kind and rethrow the rest.
- Predict \`finally\`, including a \`return\` inside it.
- Tell \`TypeError\`, \`ReferenceError\`, \`RangeError\`, and \`SyntaxError\` apart.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Exceptions* (PDF p. 218) and *Cleaning up after exceptions* (PDF p. 221-222).

## Exceptions

\`\`\`js
function parsePositive(text) {
  const n = Number(text);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("positive integer required");
  }
  return n;
}
\`\`\`

\`throw\` is not a return value. Callers that do not catch it never resume after the call. You can throw any value. Throw an \`Error\` so you get a message and a stack.

\`JSON.parse\` throws \`SyntaxError\` on bad text. That one is catchable. A syntax error in the file itself never runs, so a \`try\` around the bad tokens does not exist at runtime.

\`null.foo\` is a \`TypeError\`. Reading an undeclared name is a \`ReferenceError\`. \`Number\` methods and \`array.flat\` do not throw just because a value is missing. Bounds you invent, such as a negative age, are a \`RangeError\` if you choose that class.

## finally

\`finally\` runs when the \`try\` finishes, when \`catch\` finishes, and when something throws.

It does not swallow the exception. After \`finally\`, the error keeps unwinding unless \`catch\` handled it.

A \`return\` or \`throw\` inside \`finally\` replaces the pending return or exception.

\`\`\`js
function demo() {
  try { return 1; }
  finally { return 2; }
}
demo(); // 2
\`\`\`

Mutating an object you already decided to return is different: \`finally\` can push onto that array and the caller sees the push, because it is the same object.

## Error kinds

Catch what you can recover from. Rethrow the rest.

\`\`\`js
try {
  return parsePositive(text);
} catch (err) {
  if (!(err instanceof RangeError)) throw err;
  return null;
}
\`\`\`

An empty \`catch { }\` is legal and hides every exception, including bugs. That is rarely what you want.

## Coding tasks

Write \`parsePositive\`, \`demoReturn\`, and \`messageOf\`.
`;

const errorQuestions = [
  mc('throw new Error("bad") does what to the caller?',
    ['Returns the Error object', 'Unwinds until a catch, or crashes the turn', 'Sets a global errno', 'Converts the function into a promise'],
    'b', 'It is not a return value. Intermediate functions do not have to mention it.',
    cite('Exceptions', ELO, 218, eloThrow),
    'throw new Error("positive integer required");', 1),
  mc('The book says an exception…',
    ['Must be an Error', 'Can be any value', 'Must be a string', 'Must be a number'],
    'b', 'Still throw new Error so stacks and messages work.',
    cite('Exceptions', ELO, 218, eloAny),
    'throw "bad";', 2),
  mc('JSON.parse("{") throws…',
    ['TypeError', 'SyntaxError', 'ReferenceError', 'nothing; it returns null'],
    'b', 'That SyntaxError is catchable. A syntax error in your own file is not, because the file never starts.',
    cite('Error kinds', ELO, 218, eloThrow),
    'JSON.parse("{");', 2),
  mc('null.foo throws…',
    ['ReferenceError', 'TypeError', 'SyntaxError', 'RangeError'],
    'b', 'The name null exists. Reading a property of null is a type error.',
    cite('Error kinds', ELO, 218, eloAny),
    'null.foo;', 2),
  mc('Reading a name that was never declared throws…',
    ['TypeError', 'ReferenceError', 'SyntaxError at the call', 'undefined'],
    'b', 'The binding is missing. A typo of a let in the temporal dead zone is also a ReferenceError.',
    cite('Error kinds', ELO, 218, eloThrow),
    'notDeclared;', 2),
  mc('finally runs…',
    ['Only when the try throws', 'Only when the try succeeds', 'On the way out, success or throw', 'Only if there is no catch'],
    'c', 'Use it for cleanup that must happen either way.',
    cite('finally', ELO, 222, eloFinally),
    'try {\n  work();\n} finally {\n  cleanup();\n}', 1),
  mc('After finally, an exception that was not caught…',
    ['Is swallowed', 'Keeps unwinding', 'Becomes the return value', 'Is converted to null'],
    'b', 'finally does not handle the error. catch does.',
    cite('finally', ELO, 222, eloFinally),
    'try {\n  throw new Error("x");\n} finally {\n  log("out");\n}', 2),
  mc('function demo(){ try { return 1; } finally { return 2; } } returns…',
    ['1', '2', 'undefined', 'an Error'],
    'b', 'A return inside finally replaces the pending return.',
    cite('finally', ELO, 222, 'After the finally block runs, the stack continues unwinding.'),
    'function demo() {\n  try { return 1; }\n  finally { return 2; }\n}', 3),
  mc('try pushes "try" onto an array and returns that array. finally pushes "finally". The caller sees…',
    ['["try"]', '["try", "finally"]', '["finally"]', '["finally", "try"]'],
    'b', 'finally runs before the caller receives the object, and it is the same object.',
    cite('finally', ELO, 222, eloFinally),
    'const log = [];\ntry {\n  log.push("try");\n  return log;\n} finally {\n  log.push("finally");\n}', 3),
  mc('catch (err) { if (!(err instanceof RangeError)) throw err; } …',
    ['Swallows every error', 'Handles RangeError and lets other errors continue', 'Converts the error into a string', 'Is a syntax error'],
    'b', 'Recover from the kind you expect. Do not hide TypeError bugs.',
    cite('Error kinds', ELO, 218, eloThrow),
    'catch (err) {\n  if (!(err instanceof RangeError)) throw err;\n  return null;\n}', 2),
  mc('An empty catch { } …',
    ['Is a syntax error', 'Hides every exception from that try', 'Only hides Error instances', 'Rethrows automatically'],
    'b', 'Legal since ES2019. It also hides programmer mistakes.',
    cite('Exceptions', ELO, 218, eloAny),
    'try {\n  JSON.parse(text);\n} catch {\n  return null;\n}', 2),
  mc('parsePositive("0") should…',
    ['Return 0', 'Throw, if the contract is a positive integer', 'Return NaN', 'Return "0"'],
    'b', '0 is an integer and is not positive. Number("0") is 0.',
    cite('Exceptions', ELO, 218, 'throw new Error("Invalid direction: " + result);'),
    'function parsePositive(text) {\n  const n = Number(text);\n  if (!Number.isInteger(n) || n <= 0) throw new Error("positive integer required");\n  return n;\n}', 2),
  mc('parsePositive("3.5") should throw because…',
    ['Number() cannot parse decimals', 'The contract asks for an integer and 3.5 is not one', 'Strings always throw', '3.5 is a RangeError by default'],
    'b', 'Number.isInteger(3.5) is false.',
    cite('Exceptions', ELO, 218, eloThrow),
    'Number.isInteger(Number("3.5"));', 2),
  mc('err.message on throw new Error("nope") is…',
    ['undefined', '"nope"', 'the stack string only', 'the constructor name'],
    'b', 'error.name is "Error". The stack is separate.',
    cite('Error kinds', ELO, 218, 'throw new Error("Invalid direction: " + result);'),
    'try {\n  throw new Error("nope");\n} catch (err) {\n  err.message;\n}', 1),
  mc('A try around setTimeout(() => { throw new Error("later"); }, 0) …',
    ['Catches "later"', 'Does not catch it. The timer runs on a later turn', 'Prevents the timeout', 'Turns it into a rejected promise automatically'],
    'b', 'The try has finished before the callback runs. That is the async chapter.',
    cite('finally', ELO, 222, eloFinally),
    'try {\n  setTimeout(() => { throw new Error("later"); }, 0);\n} catch (err) {\n  console.log("caught");\n}', 3),
  jsCode(
    'Write parsePositive(text). Return the integer when it is > 0. Otherwise throw new Error("positive integer required").',
    'function parsePositive(text) {\n}\n',
    'function parsePositive(text) {\n  const n = Number(text);\n  if (!Number.isInteger(n) || n <= 0) {\n    throw new Error("positive integer required");\n  }\n  return n;\n}\n',
    [
      { call: 'parsePositive("4")', expected: 4 },
      {
        label: 'rejects 3.5',
        setup: 'let threw = false; try { parsePositive("3.5"); } catch (e) { threw = e instanceof Error && e.message === "positive integer required"; }',
        call: 'threw',
        expected: true,
      },
    ],
    'Coding tasks', ELO, 218, 'throw new Error("Invalid direction: " + result);',
    ['Number.isInteger and n > 0.'],
  ),
  jsCode(
    'Write demoReturn(). try returns 1. finally returns 2.',
    'function demoReturn() {\n}\n',
    'function demoReturn() {\n  try {\n    return 1;\n  } finally {\n    return 2;\n  }\n}\n',
    [{ call: 'demoReturn()', expected: 2 }],
    'Coding tasks', ELO, 222, eloFinally,
    ['The finally return wins.'],
  ),
  jsCode(
    'Write messageOf(fn). Call fn. Return err.message if it throws an Error. If it does not throw, return "ok".',
    'function messageOf(fn) {\n}\n',
    'function messageOf(fn) {\n  try {\n    fn();\n    return "ok";\n  } catch (err) {\n    return err.message;\n  }\n}\n',
    [
      { call: 'messageOf(() => { throw new Error("nope"); })', expected: 'nope' },
      { call: 'messageOf(() => 1)', expected: 'ok' },
    ],
    'Coding tasks', ELO, 218, eloThrow,
    ['try { fn(); return "ok"; } catch (err) { return err.message; }'],
  ),
];

const eloPromise = 'A promise is a receipt representing a value that may not be available yet.';
const eloThen = 'A useful thing about the then method is that it itself returns another promise.';
const eloAsync = 'When such a function or method is called, it returns a promise.';
const eloAll = 'Promise has a static method all that can be used to convert an array of promises into a single promise that resolves to an array of results.';
const eloLoop = 'Asynchronous behavior happens on its own empty function call stack.';
const eloTimeout = 'try {\n   setTimeout(() => {\n     throw new Error("Woosh");\n   }, 20);\n } catch (e) {\n   // This will not run\n   console.log("Caught", e);\n }';

const asyncNotes = `# Asynchronous JavaScript

The file runs to the end. Callbacks, promise reactions, and timers run later, one turn at a time.

## What you should be able to do

- Read a \`.then\` chain and an \`async\` function as the same idea.
- Predict sync code, then promise reactions, then \`setTimeout\`.
- Use \`Promise.all\` when the work may overlap, and a \`for\` loop of \`await\` when order matters.
- Catch a rejection with \`try/catch\` around \`await\`, not around the call that only scheduled work.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Promises* (PDF p. 289-294), \`async function\` (PDF p. 300), \`Promise.all\` (PDF p. 306), *The event loop* (PDF p. 308-309).

## Promises

A promise is a receipt for a later value. \`Promise.resolve(15)\` is already fulfilled. \`.then\` still runs the callback as a later job, not in the current stack.

\`new Promise((resolve, reject) => { ... })\` settles when you call one of those functions. \`then\` returns a new promise. If the callback returns a promise, the chain waits for it. If the callback throws, the chain rejects.

\`\`\`js
textFile(listFile)
  .then((content) => content.trim().split("\\n"))
  .then((names) => textFile(names[0]));
\`\`\`

## async and await

\`async function\` always returns a promise. \`return 1\` fulfills it with 1. \`throw\` rejects it. The caller does not see that throw synchronously.

\`await\` pauses that function and lets other turns run. It does not freeze the page by itself. \`await\` on a non-promise wraps the value and continues after the current stack.

\`\`\`js
async function load(path) {
  try {
    return await read(path);
  } catch (err) {
    return null;
  }
}
\`\`\`

A \`try\` around \`setTimeout(() => { throw new Error("Woosh"); }, 20)\` does not catch \`Woosh\`. The timeout runs later, on an empty stack.

## The event loop

One turn runs to completion. A long \`while\` delays timers. For this script:

\`\`\`js
console.log("sync");
Promise.resolve().then(() => console.log("promise"));
setTimeout(() => console.log("timeout"), 0);
\`\`\`

the order is \`sync\`, then \`promise\`, then \`timeout\`. Promise reactions are drained before the next timer.

## Promise.all

\`Promise.all\` takes an iterable of promises and fulfills with an array of results, in input order. The combined promise rejects as soon as one input rejects. The other jobs are not cancelled. They just do not become the result.

\`Promise.all([])\` fulfills with \`[]\`.

\`await\` inside a \`for\` loop runs one step at a time. \`Promise.all(items.map(...))\` starts them together.

## Coding tasks

Return three source strings: an async function, a \`Promise.all\` map, and \`await\` inside \`try\`.
`;

const asyncQuestions = [
  mc('A promise is…',
    ['A thread', 'A receipt for a value that might not be ready', 'A callback registry that runs inside the caller', 'Only the return type of fetch'],
    'b', 'then registers work for when it settles. Already settled promises still run then later.',
    cite('Promises', ELO, 289, eloPromise),
    'Promise.resolve(15).then((value) => console.log(value));', 1),
  mc('Order of: log("sync"); Promise.resolve().then(() => log("promise")); setTimeout(() => log("timeout"), 0);',
    ['sync, timeout, promise', 'sync, promise, timeout', 'promise, sync, timeout', 'timeout, promise, sync'],
    'b', 'The current stack finishes, then promise reactions, then timers.',
    cite('The event loop', ELO, 309, 'Promises always resolve or reject as a new event.'),
    'console.log("sync");\nPromise.resolve().then(() => console.log("promise"));\nsetTimeout(() => console.log("timeout"), 0);', 2),
  mc('then on a promise returns…',
    ['The original promise', 'A new promise for the callback result', 'The callback return value immediately', 'undefined always'],
    'b', 'That is how a chain waits on a promise returned from a callback.',
    cite('Promises', ELO, 290, eloThen),
    'textFile(name).then((text) => textFile(other));', 2),
  mc('If a then callback throws, the promise returned by then…',
    ['Fulfills with the Error', 'Rejects', 'Is unchanged', 'Retries the callback'],
    'b', 'A throw in a reaction is a rejection of the next promise.',
    cite('Promises', ELO, 294, 'rejection when they throw an exception, and the outcome of the promise when they return a promise.'),
    'Promise.resolve(1).then(() => { throw new Error("Fail"); });', 2),
  mc('Calling an async function…',
    ['Runs it to the end on this stack before you continue', 'Returns a promise immediately', 'Returns the bare return value', 'Throws synchronously if the function throws'],
    'b', 'return 1 fulfills that promise. throw rejects it. The caller must await or then.',
    cite('async and await', ELO, 300, eloAsync),
    'async function add(a, b) {\n  return a + b;\n}', 1),
  mc('await inside an async function…',
    ['Blocks every other script on the page until it finishes', 'Pauses that function and lets other turns run', 'Is legal in any function', 'Converts a rejection into a return value of null'],
    'b', 'await on a plain value wraps it. await on a rejection throws into the async function, which rejects its promise unless you catch.',
    cite('async and await', ELO, 300, 'An async function is marked by the word async before the function keyword.'),
    'const text = await read(path);', 2),
  mc('try { setTimeout(() => { throw new Error("Woosh"); }, 20); } catch (e) {} …',
    ['Prints nothing and swallows Woosh', 'Does not catch Woosh', 'Prevents the timer', 'Rejects a promise'],
    'b', 'The book: the catch will not run. The callback starts on an empty stack.',
    cite('The event loop', ELO, 309, eloTimeout),
    'try {\n  setTimeout(() => { throw new Error("Woosh"); }, 20);\n} catch (e) {\n  console.log("Caught", e);\n}', 2),
  mc('A while loop that burns 50ms after scheduling a 20ms timeout…',
    ['Lets the timeout run at 20ms, in parallel', 'Delays the timeout until the loop finishes', 'Cancels the timeout', 'Throws'],
    'b', 'One turn at a time. The loop is the turn. The timer waits.',
    cite('The event loop', ELO, 309, 'while (Date.now() < start + 50) {}\n console.log("Wasted time until", Date.now() - start);'),
    'setTimeout(fn, 20);\nwhile (Date.now() < start + 50) {}', 3),
  mc('Promise.all of three request promises…',
    ['Fulfills with the first result only', 'Fulfills with an array of results in input order', 'Runs the requests one at a time', 'Ignores rejections'],
    'b', 'One rejection rejects the combined promise. The others are not cancelled.',
    cite('Promise.all', ELO, 306, eloAll),
    'return Promise.all(frame.map((data, i) => request(screenAddresses[i], data)));', 2),
  mc('Promise.all([]) …',
    ['Rejects', 'Fulfills with []', 'Hangs', 'Fulfills with undefined'],
    'b', 'There is no input that can reject.',
    cite('Promise.all', ELO, 306, eloAll),
    'Promise.all([]);', 3),
  mc('await inside a for loop versus Promise.all(items.map(...))',
    ['They start the work the same way', 'The loop waits for each step; map plus all can overlap', 'all always runs in series', 'The loop is a syntax error'],
    'b', 'Use the loop when the next call needs the previous result. Use all when the calls are independent.',
    cite('Promise.all', ELO, 306, eloAll),
    'for (const item of items) {\n  await save(item);\n}\nawait Promise.all(items.map(save));', 2),
  mc('How do you catch a rejection from await read(path)?',
    ['try/catch around the call that created the promise, after you have already left the function', 'try/catch around the await, inside the async function', 'if (promise === Error)', 'window.onerror only'],
    'b', 'await turns rejection into a throw in that function.',
    cite('async and await', ELO, 300, 'try {\n         await withTimeout(joinWifi(networkID, newCode), 50);'),
    'try {\n  return await read(path);\n} catch (err) {\n  return null;\n}', 2),
  mc('read(path).then(handler) with no catch, when read rejects…',
    ['Becomes a normal return of undefined', 'Is an unhandled rejection unless something later catches that chain', 'Is a SyntaxError', 'Retries read'],
    'b', 'Attach catch, or await it inside try.',
    cite('Promises', ELO, 294, 'if (error) reject(error);\n       else resolve(text);'),
    'read(path).then(console.log);', 2),
  mc('Promise.resolve(1).then(() => 2) fulfills with…',
    ['1', '2', 'a function', 'undefined'],
    'b', 'The callback return becomes the next result. The original value is the callback argument, which this arrow ignores.',
    cite('Promises', ELO, 290, eloThen),
    'Promise.resolve(1).then(() => 2);', 1),
  mc('An async function that returns Promise.resolve(5) causes the caller\'s await to see…',
    ['A promise of a promise', '5', 'undefined', 'the async function object'],
    'b', 'await and then flatten a returned promise one level.',
    cite('async and await', ELO, 300, eloAsync),
    'async function n() {\n  return Promise.resolve(5);\n}', 3),
  sourceCard(
    'asyncAdd',
    'async function add(a, b) {\n  return a + b;\n}',
    'async and await', ELO, 300, eloAsync,
  ),
  sourceCard(
    'allFrames',
    'return Promise.all(frame.map((data, i) => request(screenAddresses[i], data)));',
    'Promise.all', ELO, 306, eloAll,
  ),
  sourceCard(
    'loadOrNull',
    'async function load(path) {\n  try {\n    return await read(path);\n  } catch (err) {\n    return null;\n  }\n}',
    'async and await', ELO, 300, 'try {\n         await withTimeout(joinWifi(networkID, newCode), 50);',
  ),
];

const root = 'applied-classroom/javascript/language';
writeDeck(root + '/array-methods', 'JavaScript - Array methods', arrayNotes, arrayQuestions, [
  { book: ELO, page: 147, chapter: 'Higher-order functions' },
  { book: DEF, page: 185, chapter: 'Array methods' },
]);
writeDeck(root + '/closures', 'JavaScript - Closures', closureNotes, closureQuestions, [
  { book: ELO, page: 86, chapter: 'Closure' },
  { book: YDK, page: 156, chapter: 'Using Closures' },
]);
writeDeck(root + '/recursion', 'JavaScript - Recursion', recursionNotes, recursionQuestions, [
  { book: ELO, page: 88, chapter: 'Recursion' },
]);
writeDeck(root + '/classes', 'JavaScript - Classes', classNotes, classQuestions, [
  { book: ELO, page: 167, chapter: 'Classes' },
]);
writeDeck(root + '/error-handling', 'JavaScript - Error handling', errorNotes, errorQuestions, [
  { book: ELO, page: 218, chapter: 'Exceptions' },
]);
writeDeck(root + '/asynchronous-javascript', 'JavaScript - Asynchronous JavaScript', asyncNotes, asyncQuestions, [
  { book: ELO, page: 289, chapter: 'Asynchronous Programming' },
]);

const protoNotes = readFileSync(root + '/prototypes-and-this/notes.md', 'utf8');
if (!protoNotes.includes('## Arrow methods')) {
  const extra = `
## Arrow methods

A method written as \`speak(line) {}\` on a class, or \`speak: function () {}\` on an object, receives \`this\` from the call. Pull it off the object and call it, and \`this\` is \`undefined\` in strict mode.

An arrow never gets that call-site \`this\`.

\`\`\`js
const o = { n: 1, get: () => this };
o.get(); // not o. The arrow sees the this around the object literal.
\`\`\`

A class field arrow is created while the instance is being built, so it closes over that instance:

\`\`\`js
class Box {
  n = 1;
  get = () => this.n;
}
const f = new Box().get;
f(); // 1
\`\`\`

Use a field arrow for a callback you will pass away. Use a prototype method when many instances should share one function.
`;
  writeFileSync(root + '/prototypes-and-this/notes.md', protoNotes.trimEnd() + '\n' + extra);
}

const protoQuiz = JSON.parse(readFileSync(root + '/prototypes-and-this/quiz.json', 'utf8'));
if (!protoQuiz.questions.some((q) => q.question.startsWith('const o = { n: 1, get: () => this }'))) {
  const more = [
    mc('const o = { n: 1, get: () => this }; o.get() uses which this?',
      ['o', 'The this surrounding the arrow, not o', 'Object.prototype', 'undefined only inside class bodies'],
      'b', 'The arrow does not get a method call. At the top of a module, that surrounding this is undefined.',
      cite('Arrow methods', ELO, 163, 'Arrow functions are different—they do not bind their own this but can see the this binding of the scope around them.'),
      'const o = { n: 1, get: () => this };\no.get();', 3),
    mc('class Box { n = 1; get = () => this.n } and const f = new Box().get; f() is…',
      ['a TypeError, this was lost', '1', 'undefined', 'the class Box'],
      'b', 'The field arrow is created with this bound to the new instance.',
      cite('Arrow methods', ELO, 169, eloField),
      'class Box {\n  n = 1;\n  get = () => this.n;\n}\nconst f = new Box().get;\nf();', 3),
    mc('const m = new Box().speak; m() when speak is a prototype method in strict mode…',
      ['Still sees the instance', 'Throws TypeError because this is undefined', 'Returns Box.prototype', 'Calls the constructor again'],
      'b', 'A detached method call has no receiver. Bind it, or use a field arrow, if you must pass it.',
      cite('Arrow methods', ELO, 163, 'Since each function has its own this binding whose value depends on the way it is called, you cannot refer to the this of the wrapping scope in a regular function defined with the function keyword.'),
      'const m = box.speak;\nm();', 2),
  ];
  protoQuiz.questions.push(...more);
  writeFileSync(root + '/prototypes-and-this/quiz.json', JSON.stringify(protoQuiz, null, 2) + '\n');
  console.log('extended prototypes', protoQuiz.questions.length);
}
