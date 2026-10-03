# Iterators and generators

`for...of` walks an iterator. `function*` can pause with `yield`.

## What you should be able to do

- Know `for...of` calls `next()` until `done`.
- Write a `function*` that yields values.
- Know the generator starts frozen until the first `next`.

## Assigned reading

- Eloquent JavaScript, 4th Edition - generator functions / `yield` (PDF p. 302).
- JavaScript: The Definitive Guide, 7th Edition - Iterators and Generators (PDF p. 347).

## Iterators

An iterator is an object with `next()` returning `{ value, done }`. Arrays, strings, Maps, and Sets are iterable.

## Generators

```js
function* powers(n) {
  for (let current = n; ; current *= n) {
    yield current;
  }
}
```

Calling `powers(3)` does not run the body yet.

## yield

Each `next` runs until the next `yield`, then pauses. The yielded value is `value`.

## Coding tasks

Return JavaScript source for a generator and a yield.
