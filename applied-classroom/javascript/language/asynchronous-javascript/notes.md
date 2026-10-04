# Asynchronous JavaScript

The file runs to the end. Callbacks, promise reactions, and timers run later, one turn at a time.

## What you should be able to do

- Read a `.then` chain and an `async` function as the same idea.
- Predict sync code, then promise reactions, then `setTimeout`.
- Use `Promise.all` when the work may overlap, and a `for` loop of `await` when order matters.
- Catch a rejection with `try/catch` around `await`, not around the call that only scheduled work.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Promises* (PDF p. 289-294), `async function` (PDF p. 300), `Promise.all` (PDF p. 306), *The event loop* (PDF p. 308-309).

## Promises

A promise is a receipt for a later value. `Promise.resolve(15)` is already fulfilled. `.then` still runs the callback as a later job, not in the current stack.

`new Promise((resolve, reject) => { ... })` settles when you call one of those functions. `then` returns a new promise. If the callback returns a promise, the chain waits for it. If the callback throws, the chain rejects.

```js
textFile(listFile)
  .then((content) => content.trim().split("\n"))
  .then((names) => textFile(names[0]));
```

## async and await

`async function` always returns a promise. `return 1` fulfills it with 1. `throw` rejects it. The caller does not see that throw synchronously.

`await` pauses that function and lets other turns run. It does not freeze the page by itself. `await` on a non-promise wraps the value and continues after the current stack.

```js
async function load(path) {
  try {
    return await read(path);
  } catch (err) {
    return null;
  }
}
```

A `try` around `setTimeout(() => { throw new Error("Woosh"); }, 20)` does not catch `Woosh`. The timeout runs later, on an empty stack.

## The event loop

One turn runs to completion. A long `while` delays timers. For this script:

```js
console.log("sync");
Promise.resolve().then(() => console.log("promise"));
setTimeout(() => console.log("timeout"), 0);
```

the order is `sync`, then `promise`, then `timeout`. Promise reactions are drained before the next timer.

## Promise.all

`Promise.all` takes an iterable of promises and fulfills with an array of results, in input order. The combined promise rejects as soon as one input rejects. The other jobs are not cancelled. They just do not become the result.

`Promise.all([])` fulfills with `[]`.

`await` inside a `for` loop runs one step at a time. `Promise.all(items.map(...))` starts them together.

## Coding tasks

Return three source strings: an async function, a `Promise.all` map, and `await` inside `try`.
