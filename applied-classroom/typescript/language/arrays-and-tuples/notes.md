# Arrays and tuples

`T[]` is a list of T. A tuple is a fixed-length array with a type per index.

## Arrays

```ts
let a: number[] = [1, 2, 3];
let b: Array<number> = [1, 2, 3];
let c: (string | number)[] = [1, "a"];
let d: readonly number[] = [1, 2, 3];
```

`number[]` and `Array<number>` are the same. `readonly` arrays reject `push` and index assignment at compile time. Runtime still has `.push` if you cheat.

Look up **ARRAYS AND TUPLES** (`tsts ARRAYS`).

## What you should be able to do

- Annotate `number[]` and `(string | number)[]`.
- Tell a tuple (`[string, number]`) from an open-ended array.
- Remember that `arr[0]` may be `undefined` if the array is empty (`noUncheckedIndexedAccess`).
- Keep tuple order: name then age is not age then name.

## Assigned reading

- Effective TypeScript, 2nd Edition by Dan Vanderkam — Item 3 discussion of `noUncheckedIndexedAccess` (PDF p. 37). Item 7 *Think of Types as Sets of Values* (PDF p. 59).

Cheat sheet: **ARRAYS AND TUPLES**.

## Tuples

```ts
let pair: [string, number] = ["Ada", 1];
function useToggle(): [boolean, () => void] {
  return [false, () => {}];
}
```

`pair[0]` is `string`. `pair[1]` is `number`. A third element is a type error. `number[]` would allow any length.

## Indexing

Without `noUncheckedIndexedAccess`, `arr[0]` is typed as `T` even for an empty array. With it, `T | undefined`. Guard before you use it.

## Coding tasks

Write `first`, `pair`, and `sum` as JavaScript. The TypeScript types are the contract in the lesson; the runner checks the values.
