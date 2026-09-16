# Loops

## What you should be able to do

- Write `while` and `for` loops and know when each shape is clearer.
- Walk an array with `for...of` instead of `for...in`.
- Exit early with `break` (and skip an iteration with `continue`).
- Keep a running total or find-the-first search without off-by-one mistakes.
- Contrast JS loops with C++ `for` over a vector (`size_t` vs `length`, no `at()` throw).

## Assigned reading

Read these sections in *Eloquent JavaScript, 4th Edition by Marijn Haverbeke* (PDF file positions):

- Chapter 2 *Program Structure* — *while and do loops* (PDF p. 59)
- *for loops* (PDF p. 63)
- *Breaking Out of a Loop* (PDF p. 65)
- Chapter 4 *Array loops* when you reach arrays (printed 101 → PDF p. 117)

This deck is the loop chapter. **Show in book** opens those pages, not the functions or Map chapters.

## while and do loops

A `while` loop repeats a body until the test is false.

```js
let n = 0;
while (n <= 12) {
  console.log(n);
  n = n + 2;
}
```

The test runs before each iteration. If it starts false, the body never runs.

`do { ... } while (test)` runs the body once before testing. Use it rarely.

## for loops

Most counting loops follow “bind a counter, test, update.” `for` writes that on one line:

```js
for (let i = 0; i < rows.length; i++) {
  total += rows[i].amount;
}
```

Three parts: init, test, update. Any part may be empty. An empty test means “loop until `break`.”

Prefer `let i` so each iteration can close over its own `i`. `var i` is one binding for the whole function (see Functions).

## Breaking Out of a Loop

`break` jumps out of the innermost loop immediately. `continue` skips the rest of this iteration.

```js
for (let current = 20; ; current = current + 1) {
  if (current % 7 == 0) {
    console.log(current);
    break;
  }
}
// → 21
```

That `for` has no end test. Without `break` it would run forever.

## Walking arrays

Default for a list of payments or appointments: `for...of`.

```js
for (const row of rows) {
  if (row.status === "paid") return row;
}
```

`for...in` walks **keys**, including inherited names. Do not use it on arrays.

`rows.forEach` is fine; you cannot `break` out of it. Use `for...of` or `some`/`find` when you need to stop.

## From C++

- `rows.length` is not a method. There is no `.size()`.
- `rows[i]` on a missing index is `undefined`, not an exception.
- `for (const row of rows)` is closer to a range-for than `for (int i = 0; ...)`.
- Infinite loops are easier than you think: empty `for` tests, forgotten `i++`, `while (true)` without `break`.

## Worked examples

Sum paid amounts:

```js
function paidTotal(rows) {
  let sum = 0;
  for (const row of rows) {
    if (row.status === "paid") sum += row.amount;
  }
  return sum;
}
```

First even number, or `undefined`:

```js
function firstEven(nums) {
  for (const n of nums) {
    if (n % 2 === 0) return n;
  }
  return undefined;
}
```

## Common mistakes

- `for (const i in rows)` — keys are strings; `i + 1` concatenates.
- Using `forEach` when you needed `break`.
- `==` in a loop test that coerces `"7"` and `7`.
- Off-by-one: `i <= rows.length` reads `undefined` at the end.

## Predict the output

```js
let out = [];
for (let i = 0; i < 3; i++) out.push(i);
console.log(out);
```

`[0, 1, 2]`

## Find the bug

```js
function firstPaid(rows) {
  for (const i in rows) {
    if (rows[i].status === "paid") return rows[i];
  }
}
```

`for...in` can pick inherited keys. Use `for...of` or a numeric `for`.

## Coding tasks

1. `sumTo(n)` — add 1 through `n` with a `for` loop. `n < 1` → `0`.
2. `firstEven(nums)` — first even number, else `undefined`. Use `break` or `return`.
3. `countPaid(rows)` — how many rows have `status === "paid"`. Empty list is `0`.

## Hints

- `sumTo`: `for (let i = 1; i <= n; i++)`.
- `firstEven`: `n % 2 === 0`. Return inside the loop.
- `countPaid`: increment a counter; do not `filter` if you are practicing loops.

## Worked solutions

See the solution on each code card after you run the tests, or write the three functions above and check them against the tests in this deck.
