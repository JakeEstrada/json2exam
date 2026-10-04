# Closures

A closure is a function plus the bindings it can still see from where it was created.

## What you should be able to do

- Explain why `wrapValue(1)` and `wrapValue(2)` do not share `local`.
- Treat a closure as a live link, not a snapshot.
- Predict a `for (var i)` loop of functions versus `for (let i)`.
- Hide state by returning functions that close over a `let`.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Closure* (PDF p. 86-87).
- You Don't Know JS Yet: Scope & Closures, 2nd Edition - *Live Link, Not a Snapshot* (PDF p. 156) and `let` in a loop (PDF p. 162).

## Closure

```js
function wrapValue(n) {
  let local = n;
  return () => local;
}
const wrap1 = wrapValue(1);
const wrap2 = wrapValue(2);
wrap1(); // 1
wrap2(); // 2
```

Each call to `wrapValue` creates a new environment. The returned function keeps that environment after `wrapValue` has returned. The call site of `wrap1()` does not matter. What matters is where the function was created.

`multiplier(2)` returns `number => number * factor`. `twice(5)` is 10 because `factor` is still 2.

## Live link

Closing over a variable does not copy its value at creation time. Later assignments are visible.

```js
function later() {
  let name = "Ada";
  const greet = () => name;
  name = "Grace";
  return greet;
}
later()(); // "Grace"
```

Two functions that close over the same `let` share that binding. Reassigning it is visible to both.

A closure also keeps the binding alive. If the inner function is still reachable, a large object it closes over cannot be collected.

## Loop bindings

`var` has one binding for the whole function. Functions created in `for (var i = 0; i < 3; i++)` all read that same `i`, which is `3` after the loop.

`for (let i = 0; i < 3; i++)` creates a new `i` per iteration. Each function returns its own index: 0, 1, then 2.

## Coding tasks

Write `makeMultiplier`, `makeCounter`, and `capture` so each call keeps its own bindings.
