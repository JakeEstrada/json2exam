# Array methods

`map`, `filter`, and `reduce` build new values. `splice` and `sort` change the array you already have.

## What you should be able to do

- Pick `map`, `filter`, `reduce`, `find`, `some`, or `every` for the job.
- Know which methods copy and which mutate.
- Pass a comparator to `sort`. Default sort is string order.
- Avoid `array.map(parseInt)`.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Filtering arrays* / *Transforming with map* / *Summarizing with reduce* (PDF p. 146-149).
- JavaScript: The Definitive Guide, 7th Edition - array methods, `slice` / `splice`, and `sort` (PDF p. 184-194).

## map

`map` calls your function once per element and builds a **new** array of the same length. The callback return value becomes the new element. `forEach` ignores the callback return and itself returns `undefined`.

```js
[1, 2, 3].map((n) => n * 2);          // [2, 4, 6]
[1, 2, 3].forEach((n) => n * 2);      // undefined
```

The callback is `(element, index, array)`. That second argument is why this is a trap:

```js
["10", "10", "10"].map(parseInt);     // [10, NaN, 2]
["10", "10", "10"].map(Number);       // [10, 10, 10]
```

`parseInt(string, radix)` receives the index as the radix. Index 1 is an illegal radix. Index 2 parses `"10"` as binary.

## filter

`filter` builds a new array of elements whose predicate is truthy. It does not delete from the original. It skips holes in a sparse array, so the result is dense.

```js
[5, 4, 3, 2, 1].filter((x) => x < 3); // [2, 1]
```

## reduce

`reduce` folds the array into one value. Pass a start value.

```js
[1, 2, 3, 4].reduce((sum, n) => sum + n, 0); // 10
```

With no start value, the first element is the start and the callback begins at the second element. `[7].reduce((a, b) => a + b)` returns `7` and never calls the function. `[].reduce((a, b) => a + b)` throws `TypeError`.

## some and every

`some` is "there exists". `every` is "for all". Both stop as soon as the answer is known. `some([])` is `false`. `every([])` is `true` (there is no counterexample).

## slice and splice

`slice(start, end)` copies. The end index is excluded. Negative indexes count from the end. The original array stays.

`splice(start, deleteCount, ...items)` mutates. It returns the deleted elements, not the array.

```js
[1, 2, 3, 4].slice(1, 3);   // [2, 3], original unchanged
const a = [1, 2, 3, 4];
a.splice(1, 2);             // returns [2, 3], a is [1, 4]
```

## sort

`sort()` with no comparator converts elements to strings. `[33, 4, 1111, 222].sort()` becomes `[1111, 222, 33, 4]`.

A comparator returns a negative number to put the first argument earlier, `0` if they are tied, and a positive number to put the first argument later. `sort` mutates and also returns the same array. Since ES2019 it is stable: ties keep their old order.

```js
nums.slice().sort((a, b) => a - b);   // numeric copy
```

## Coding tasks

Write `doubleEvens`, `sum`, and `numericSorted` without mutating the caller's array.
