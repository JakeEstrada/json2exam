# Variables, primitive types, and type conversion

Read this page first. The quiz starts with “what JavaScript even is,” then `let` / `const`, then the sharp edges (`typeof null`, `"5" + 1`).

## What JavaScript is

It is a **scripting language**. The engine reads a `.js` file and runs it. No compile/link step, no `#include`, no `#define`. Built-ins (`Array`, `Math`, `console`) are already there.

To use *your* other file:

```js
import { add } from "./math.js";
```

That is a module import, not a C preprocessor.

The **syntax is C-like**: braces, `for (let i = 0; i < n; i++)`. It is not Python. Indentation is not syntax. You do not write types on variables (`int x`); types live on values. `let x = 1` then `x = "hi"` is legal. TypeScript is a separate cheat sheet (`tsts`) that adds types and then erases them.

Look up **VARIABLES AND TYPES** in the cheat sheet (`jsjs VARIABLES`).

## What you should be able to do

- Choose `let` or `const` and explain why `var` is the wrong default.
- Name the primitive types you will actually meet: number, string, boolean, `null`, `undefined`, bigint, symbol.
- Tell a primitive apart from an object (including arrays).
- Convert with `Number`, `String`, and `Boolean` on purpose, and predict what `+` vs `-` will do to mixed types.
- Spot `NaN` and empty values when cleaning customer and payment records.

## Assigned reading

Read these in the local `javascript/sources/` PDFs. Page numbers in the quiz are **PDF file positions**.

- Eloquent JavaScript, 4th Edition by Marijn Haverbeke — Chapter 1 *Values, Types, and Operators* (PDF p. 31), including *Values*, *Boolean values*, *Empty values*, and *Automatic type conversion* (PDF p. 43). Then Chapter 2 *Bindings* (PDF p. 50).
- JavaScript: The Definitive Guide, 7th Edition by David Flanagan — Chapter 3 *Types, Values, and Variables* (PDF p. 41), especially explicit conversion with `Number`, `String`, and `Boolean` (PDF p. 65).

## Values and primitive types

JavaScript programs move **values**. A number, a string, and `true` are values. So are objects, but objects are a different kind of value: they have identity and can change.

Primitives you will use every day:

- **number** — IEEE-754 double. Integers and floats share one type. `0.1 + 0.2` is not exactly `0.3`. There is no separate `int`.
- **string** — immutable text. `"paid"` cannot have a character overwritten in place.
- **boolean** — `true` and `false` only.
- **null** and **undefined** — two empty values. `undefined` is “nobody put a value here.” `null` is often “we know this is empty.” Treat them as related but not identical (`null == undefined` is true; `null === undefined` is false).
- **bigint** and **symbol** — exist; you will rarely need them in these modules.

`typeof null` is `"object"` (a language lie). Check null with `value === null`.

Arrays and plain objects are not primitives. `typeof []` is `"object"`. Use `Array.isArray` when the distinction matters.

## Bindings: let, const, and var

A **binding** is a name that grasps a value. It does not box the value the way a C++ `int x` occupies a slot of ints.

```js
let status = "open";
status = "closed";      // let can be retargeted

const taxRate = 0.08;
// taxRate = 0.09;      // TypeError: assignment to constant

const customer = { id: 1 };
customer.id = 2;        // allowed: the binding still grasps the same object
```

- `let` — block-scoped, reassignable.
- `const` — block-scoped, not reassignable. The object it grasps may still mutate.
- `var` — function-scoped, hoisted. Do not use it in new code.

If you never reassign, prefer `const`. That is the opposite of “make everything `let` because C++ `const` is annoying.”

## Type conversion

JavaScript will convert types quietly. That is coercion.

```js
8 * null        // 0     null becomes 0
"5" - 1         // 4     string becomes number
"5" + 1         // "51"  + prefers concatenation
"five" * 2      // NaN
false == 0      // true  == coerces
false === 0     // false === does not
```

Convert on purpose:

```js
Number("40")     // 40
Number("")       // 0
Number("  ")     // 0
Number(null)     // 0
Number(undefined)// NaN
String(40)       // "40"
Boolean(0)       // false
Boolean("0")     // true  non-empty string
```

`NaN` is a number. `Number.isNaN(x)` is the check. `x === NaN` is always false.

## From C++

| C++ | JavaScript |
|---|---|
| `int` / `double` | one `number` type |
| `std::string` is mutable | JS strings are immutable |
| `const int x` | `const` on a binding, not on object internals |
| uninitialized local is UB | missing value is `undefined` |
| `NULL` / `nullptr` | both `null` and `undefined` |
| `static_cast<int>(s)` | `Number(s)` may yield `NaN` instead of throwing |

## Worked examples

A payments file mixes types. You want numeric amounts.

```js
function asAmount(raw) {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

asAmount("40.5");  // 40.5
asAmount(40.5);    // 40.5
asAmount("");      // null  (Number("") is 0, which would look like a real payment)
asAmount("due");   // null
```

Empty string is a common trap: `Number("") === 0`. Reject it before converting if `0` is a legal payment.

## Common mistakes

- Using `var` and wondering why a loop index leaks.
- Reassigning `const` instead of mutating or copying the object.
- Trusting `==` with `null`, `""`, and `0`.
- Treating `typeof null` as a null check.
- Using `+` to add numbers stored as strings (`"10" + "4"` is `"104"`).

## Predict the output

1. `const n = 0; console.log(Boolean(n), Boolean("0"));`
2. `console.log("4" + 2, "4" - 2);`
3. `let p = { amount: 10 }; const q = p; q.amount = 3; console.log(p.amount);`
4. `console.log(Number(undefined), Number(null));`

Answers are under **Worked solutions**.

## Find the bug

```js
function total(rows) {
  let sum = 0;
  for (const row of rows) sum += row.amount;
  return sum;
}
total([{ amount: "10" }, { amount: "4" }]);
```

This concatenates to `"0104"` if the first `+=` hits a string… actually `sum` starts at `0` (number), `0 + "10"` becomes `"010"` then `"0104"`. The bug is unconverted strings plus `+`.

## Coding tasks

Write these in the quiz code cards, or in Node. The app will not execute them.

1. **Basic.** `asBooleanFlag(value)` — true only for boolean `true` or the strings `"true"` / `"1"` (case-insensitive). Everything else false.
2. **Applied.** `normalizePayments(rows)` — each row has `id` and `amount`. Skip rows whose amount cannot be a finite number. Return `{ id, amount: number }`. Empty string is invalid.
3. **Applied.** `describeCustomer(c)` — return `"Ada (#12)"` from `{ name: "Ada", id: 12 }`. Missing name becomes `"customer"`; missing id becomes `"?"`.

## Hints

1. Compare with `===` after `String(value).trim().toLowerCase()`.
2. Reuse `asAmount`. `Number.isFinite` rejects `NaN` and infinities.
3. Template literals: `` `${name} (#${id})` ``.

## Worked solutions

Predict the output:

1. `false true` — `0` is falsy; `"0"` is a non-empty string.
2. `"42" 2` — `+` concatenates; `-` forces numbers.
3. `3` — `p` and `q` grasp the same object.
4. `NaN 0` — `undefined` will not coerce to 0 for `Number`; `null` will.

Find the bug: convert first, `sum += Number(row.amount)`, or better, reject non-finite amounts.

```js
function asBooleanFlag(value) {
  if (value === true) return true;
  const s = String(value).trim().toLowerCase();
  return s === "true" || s === "1";
}

function asAmount(raw) {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function normalizePayments(rows) {
  const out = [];
  for (const row of rows) {
    const amount = asAmount(row.amount);
    if (amount === null || row.id === undefined || row.id === null) continue;
    out.push({ id: row.id, amount });
  }
  return out;
}

function describeCustomer(c) {
  const name = (c && c.name) || "customer";
  const id = c && (c.id !== undefined && c.id !== null) ? c.id : "?";
  return `${name} (#${id})`;
}
```
