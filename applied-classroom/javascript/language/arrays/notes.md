# Arrays and common array methods

## What you should be able to do

- Create, index, and length-check arrays.
- Mutate with `push`/`pop`/`shift`/`unshift`/`splice` only when you mean to.
- Copy with `slice` / spread; know that copies are shallow.
- Use `map`, `filter`, `reduce`, `find`, `some`, `every`, `includes`.
- Filter customer rows and total payments without mutating the source.

## Assigned reading

- Eloquent JavaScript, 4th Edition by Marijn Haverbeke — Chapter 4 *Data Structures: Objects and Arrays* (PDF p. 100), *Further arrayology* (PDF p. 121), Chapter 5 *Filtering arrays* (PDF p. 146) and *Transforming with map*.

## Arrays are objects

`[10, 20, 30]` is a list of values with numeric indices. It is an object. `typeof [] === "object"`. Length is `arr.length`.

```js
const amounts = [10, 20];
amounts.push(5);       // mutates, length 3
const copy = amounts.slice(); // new array, same number values (primitives copied)
```

`slice(start, end)` — start inclusive, end exclusive. `slice()` copies all.

`indexOf` returns `-1` when missing. Do not use `if (arr.indexOf(x))`; index `0` is found but falsy.

## map, filter, reduce

These three build **new** arrays or values. They do not delete from the original.

```js
const paid = rows.filter((row) => row.status === "paid");
const ids = paid.map((row) => row.id);
const total = paid.reduce((sum, row) => sum + row.amount, 0);
```

`filter` keeps elements for which the test is truthy. `map` always returns the same length. `reduce` needs an initial value when the array might be empty (`reduce` on `[]` without a seed throws).

Chaining is fine: `rows.filter(...).map(...).reduce(...)`.

## From C++

- Not `std::vector` of a fixed element type. Mixed contents are allowed; do not rely on that.
- `map`/`filter` are closer to algorithms that return new containers, not in-place `erase`.
- Index `0` exists. There is no `.at()` bounds throw by default; missing index is `undefined`.

## Worked examples

Paid customers, new array, source untouched:

```js
function paidIds(customers) {
  return customers
    .filter((c) => c.status === "paid")
    .map((c) => c.id);
}
```

Total payments:

```js
function sumPayments(payments) {
  return payments.reduce((n, p) => n + p.amount, 0);
}
```

## Common mistakes

- `map` when you meant `filter` (you get `undefined` holes in spirit, actually a same-length array of junk).
- Mutating in `map`’s callback.
- `for...in` on arrays.
- `arr[-1]` is a property named `"-1"`, not the last element. Use `arr[arr.length - 1]` or `arr.at(-1)`.

## Predict the output

```js
const src = [1, 2, 3];
const a = src.map((n) => n * 2);
const b = src.filter((n) => n > 1);
console.log(src.length, a.join(), b.join());
```

## Find the bug

```js
function onlyPaid(rows) {
  return rows.map((row) => {
    if (row.status === "paid") return row;
  });
}
```

Length stays the same; unpaid slots become `undefined`. Use `filter`.

## Coding tasks

1. **Basic.** `last(arr)` — last element or `undefined` if empty.
2. **Applied.** `paidTotals(payments)` — sum `amount` where `status === "paid"`.
3. **Applied.** `groupCount(rows, status)` — how many rows have that status, using `reduce` (not a manual `for` if you can avoid it).

## Hints

1. `arr[arr.length - 1]`.
2. `filter` then `reduce`, or one `reduce`.
3. Start the accumulator at `0`.

## Worked solutions

Predict: `3 2,4,6 2,3`.

```js
function last(arr) {
  return arr[arr.length - 1];
}

function paidTotals(payments) {
  return payments
    .filter((p) => p.status === "paid")
    .reduce((n, p) => n + p.amount, 0);
}

function groupCount(rows, status) {
  return rows.reduce((n, row) => n + (row.status === status ? 1 : 0), 0);
}
```
