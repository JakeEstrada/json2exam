# Comparisons, truthiness, and control flow

Read this first. The quiz starts with `===` and a plain `if`, then truthiness traps.

JavaScript `if` looks like C: `if (test) { ... }`. Compare with `===`. `==` coerces and is the usual source of surprises. Look up **TYPE COERCION** and **CONTROL FLOW** in the cheat sheet.

## What you should be able to do

- Compare with `===` / `!==` unless you can state why `==` is required.
- List falsy values and explain why `"0"` and `[]` are truthy.
- Use `&&`, `||`, and `??` as control, not only as booleans.
- Write `if` / `else if` / `else` and `switch` without fall-through bugs.
- Use `for`, `while`, and `for...of` to walk payments and appointments.

## Assigned reading

- Eloquent JavaScript, 4th Edition by Marijn Haverbeke — *Boolean values* and *Comparison* (PDF p. 40), *Automatic type conversion* (PDF p. 43), Chapter 2 *Control flow* (PDF p. 56) and *Conditional execution* (PDF p. 57).
- JavaScript: The Definitive Guide, 7th Edition by David Flanagan — Chapter 4 *Expressions and Operators* (PDF p. 79).

## Strict equality and coercion

`===` compares type and value. `==` coerces, then compares.

```js
0 === false          // false
0 == false           // true
"" == false          // true
null == undefined    // true
null === undefined   // false
"10" == 10           // true
"10" === 10          // false
```

Prefer `===`. The one common `==` idiom some teams still use is `value == null` to catch both `null` and `undefined`.

## Truthiness

Falsy: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`.

Everything else is truthy, including `"0"`, `"false"`, `[]`, `{}`, and `new Date()`.

```js
const amount = 0;
if (amount) { /* skipped: 0 is a real payment */ }
if (amount != null) { /* runs */ }
```

A missing payment and a zero payment are different business events. Do not test amounts with `if (amount)`.

## Logical operators

- `&&` / `||` return an **operand**, not necessarily a boolean.
- `??` (nullish coalescing) substitutes only for `null` or `undefined`.

```js
const name = customer.name || "guest";     // empty string becomes "guest"
const name2 = customer.name ?? "guest";    // empty string stays ""
const active = customer && customer.active;
```

`||` is wrong for defaulting numbers when `0` is legal.

## Control flow

Statements run top to bottom until a branch or loop says otherwise.

```js
function checkoutLabel(order) {
  if (!order) return "missing";
  if (order.status === "paid") return "paid";
  if (order.status === "pending" && order.amount > 0) return "awaiting";
  return "blocked";
}
```

`switch` compares with `===`. Always `break` (or `return`) unless you want fall-through on purpose.

```js
switch (status) {
  case "paid":
    return "green";
  case "pending":
  case "review":
    return "amber";
  default:
    return "gray";
}
```

Loops: `for (let i = 0; i < rows.length; i++)`, `while (cond)`, `for (const row of rows)`. `for...in` walks keys; do not use it on arrays.

## From C++

- No `if (p)` pointer check that means “non-null object” unless you also exclude `0` and `""`.
- `switch` does not require integers; strings work.
- `&&` / `||` short-circuit like C++, but the result is the operand.
- There is no `do` requirement; `do { } while` exists but is rare.

## Worked examples

Gate a checkout. `0` must remain payable.

```js
function canCharge(order) {
  if (order == null) return false;
  if (order.status !== "open") return false;
  const amount = Number(order.amount);
  return Number.isFinite(amount) && amount >= 0;
}

canCharge({ status: "open", amount: 0 });   // true
canCharge({ status: "open", amount: "" });  // false
```

## Common mistakes

- `if (list)` is true for `[]`. Check `list.length`.
- Defaulting with `||` and wiping `0`.
- Forgetting `break` in `switch`.
- Using `for...in` on an array and getting `"0"`, `"1"` plus inherited keys.

## Predict the output

1. `console.log(null || "x", 0 || "x", 0 ?? "x");`
2. `const n = 0; console.log(n ? "yes" : "no");`
3. `let s = "pending"; switch (s) { case "paid": console.log("a"); case "pending": console.log("b"); default: console.log("c"); }`

## Find the bug

```js
function firstPaid(rows) {
  for (const row of rows) {
    if (row.amount) return row;
  }
  return null;
}
firstPaid([{ amount: 0, id: 1 }, { amount: 20, id: 2 }]);
```

Skips the zero-dollar invoice.

## Coding tasks

1. **Basic.** `isOpenStatus(status)` — true for `"open"` or `"pending"` only, using `===`.
2. **Applied.** `checkoutState(order)` — `"missing"` if no order; `"zero"` if amount is `0`; `"ready"` if amount `> 0` and status is `"open"`; otherwise `"blocked"`.
3. **Applied.** `countTruthyFlags(flags)` — count how many entries in an array are truthy. Do not coerce the count itself with `+ ""`.

## Hints

1. A small `===` chain or an array plus `includes`.
2. Test `order == null` first. Convert amount only after that.
3. `for...of` and a counter.

## Worked solutions

Predict: `x x 0` — `0 ?? "x"` keeps `0`. Then `no`. Then `b` and `c` (fall-through).

Find the bug: `if (row.amount != null && Number.isFinite(Number(row.amount)))`.

```js
function isOpenStatus(status) {
  return status === "open" || status === "pending";
}

function checkoutState(order) {
  if (order == null) return "missing";
  const amount = Number(order.amount);
  if (order.amount === "" || !Number.isFinite(amount)) return "blocked";
  if (amount === 0) return "zero";
  if (amount > 0 && order.status === "open") return "ready";
  return "blocked";
}

function countTruthyFlags(flags) {
  let n = 0;
  for (const flag of flags) if (flag) n += 1;
  return n;
}
```
