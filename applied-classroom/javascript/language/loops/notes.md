# Loops

Read this page, then start the quiz. The first cards are these shapes. Traps come later.

## What you should be able to do

- Write a C-style `for` and a `while`.
- Walk an array with `for...of`.
- Use `break` / `continue`.
- Leave `for...in` for object keys, not arrays.

## Assigned reading

Eloquent JavaScript, 4th Edition — *while and do loops* (PDF p. 59), *for loops* (PDF p. 63), *Breaking Out of a Loop* (PDF p. 65). Same topic in the cheat sheet: **CONTROL FLOW**.

JavaScript loops look like C / C#, not Python. `{ }` is the block. There is no preprocessor and no `for i in range`.

## while and do loops

`while` tests **before** the body. If the test is already false, the body never runs.

```js
let n = 0;
while (n <= 12) {
  console.log(n);
  n = n + 2;
}
```

`do { ... } while (test)` runs once first. You almost never need it on this deck.

## for loops

Three parts: start, test, update.

```js
for (let i = 0; i < rows.length; i++) {
  total += rows[i].amount;
}
```

## Walking arrays

Default for a list of values:

```js
for (const row of rows) {
  console.log(row);
}
```

`for...in` yields **keys** (`"0"`, `"1"`), including inherited names. Do not use it on arrays.

## Breaking Out of a Loop

`break` leaves the loop. `continue` skips the rest of this pass.

```js
for (const row of rows) {
  if (row.status !== "paid") continue;
  return row;
}
```

## From C++

- `rows.length`, not `.size()`.
- `rows[i]` off the end is `undefined`, not a throw.
- `for (const row of rows)` is the range-for.

## Worked examples

```js
function paidTotal(rows) {
  let sum = 0;
  for (const row of rows) {
    if (row.status === "paid") sum += row.amount;
  }
  return sum;
}
```

## Common mistakes

- `for (const i in rows)` on an array.
- `forEach` when you needed `break` (`forEach` cannot break).
- `i <= rows.length` (reads `undefined` at the end).

## Predict the output

```js
const out = [];
for (let i = 0; i < 3; i++) out.push(i);
// [0, 1, 2]
```

## Find the bug

`for (const i in rows)` when you wanted each payment object.

## Coding tasks

`sumTo`, `firstEven`, `countPaid` — after the basic cards.

## Hints

Use a counting `for` or `for...of`. Seed counters at `0`.

## Worked solutions

On the code card after the tests pass, or **Show solution**.
