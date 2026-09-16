# Functions, scope, and closures

## What you should be able to do

- Declare functions as expressions, declarations, and arrows.
- Explain parameters as local bindings, including defaults and extra arguments.
- Trace block scope vs function scope (`let`/`const` vs `var`).
- Use a closure to keep private state (status machine, running total).
- Contrast JS closures with C++ nested functions (which C++ does not have) and with capturing `this` later.

## Assigned reading

- Eloquent JavaScript, 4th Edition by Marijn Haverbeke — Chapter 3 *Functions* (PDF p. 74), *Defining a function* (PDF p. 75), *Bindings and scopes*, *Closure* (PDF p. 86).
- You Don't Know JS Yet by Kyle Simpson — Chapter 1 *What’s the Scope?* (PDF p. 19) and Chapter 7 *Using Closures* (PDF p. 149). Local file: *You Don't Know JS Yet: Scope & Closures, 2nd Edition*.

## Defining a function

A function is a value. You can bind it, pass it, and return it.

```js
const square = function (x) {
  return x * x;
};

function paid(row) {
  return row.status === "paid";
}

const tax = (amount) => amount * 0.08;
```

Declarations are hoisted (you can call them above the line). `const fn = function () {}` is not. Arrow functions do not bind their own `this` (module 5–6 and later). For these drills, prefer named functions or `const` arrows without `this`.

Missing `return` yields `undefined`. Extra arguments are ignored; missing ones are `undefined` unless you set defaults: `function greet(name = "guest")`.

## Bindings and scopes

Each call creates a new environment for parameters and local `let`/`const`. Nested functions see outer bindings.

```js
function outer(rate) {
  function addTax(amount) {
    return amount + amount * rate;
  }
  return addTax(100);
}
```

`var` ignores block braces and attaches to the function. `let`/`const` honor blocks. That is why `for (let i …)` is not `for (var i …)`.

JS is lexically scoped: where you **write** the function decides what it can see, not where you **call** it.

## Closure

If an inner function outlives the call that created it, it still sees those bindings. That pairing is a **closure**.

```js
function wrapValue(n) {
  let local = n;
  return () => local;
}
const a = wrapValue(1);
const b = wrapValue(2);
a(); // 1
b(); // 2
```

Each call to `wrapValue` makes a different `local`. The inner function keeps a live link, not a snapshot: if `local` were mutated, later reads would see the new value.

```js
function makeStatusMachine(initial) {
  let status = initial;
  return {
    get() { return status; },
    set(next) { status = next; return status; },
  };
}
```

`status` is not on the returned object. Callers cannot write `machine.status = "hacked"` unless you expose it.

## From C++

- No nested functions in standard C++. Closures here are closer to capturing lambdas (`[=]` / `[&]`) that outlive the stack frame — in JS that is normal and safe for heap bindings.
- JS locals live as long as something references them. You do not get a dangling stack pointer from returning an inner function.
- There is no `static` local in the C sense; a closure variable is the replacement.

## Worked examples

Running total of payments without a global:

```js
function makeLedger() {
  let total = 0;
  return {
    add(amount) {
      total += amount;
      return total;
    },
    value() { return total; },
  };
}
const day = makeLedger();
day.add(40);
day.add(12);
day.value(); // 52
```

## Common mistakes

- Forgetting `return`.
- Creating functions in a `var` loop and capturing the same `i`.
- Mutating a closed-over object and being surprised that every alias sees it.
- Treating a closure as a copy of a primitive that cannot change — it can if you reassign the binding.

## Predict the output

```js
function make() {
  let n = 0;
  return () => { n += 1; return n; };
}
const f = make();
console.log(f(), f(), make()());
```

## Find the bug

```js
function adders() {
  var fns = [];
  for (var i = 0; i < 3; i++) {
    fns.push(function () { return i; });
  }
  return fns;
}
adders()[0]();
```

All three return `3`. `var i` is one binding. Use `let i` or wrap `i` in its own closure.

## Coding tasks

1. **Basic.** `applyDiscount(rate)` returns a function `(amount) => amount * (1 - rate)`.
2. **Applied.** `makeStatusMachine(initial)` with `get` and `set` as above. `set` should ignore `undefined`.
3. **Applied.** `makeIdFactory(prefix)` — each call to the returned function yields `prefix-1`, `prefix-2`, …

## Hints

1. Return an arrow that closes over `rate`.
2. Keep `status` in the outer function, not as a property.
3. Close over a counter starting at 0.

## Worked solutions

Predict: `1 2 1` — the third call is a new machine.

Find the bug: `for (let i = 0; i < 3; i++)`.

```js
function applyDiscount(rate) {
  return (amount) => amount * (1 - rate);
}

function makeStatusMachine(initial) {
  let status = initial;
  return {
    get() { return status; },
    set(next) {
      if (next === undefined) return status;
      status = next;
      return status;
    },
  };
}

function makeIdFactory(prefix) {
  let n = 0;
  return function nextId() {
    n += 1;
    return prefix + "-" + n;
  };
}
```
