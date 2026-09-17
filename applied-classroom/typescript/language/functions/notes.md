# Functions

Annotate parameters. Return types on public functions help readers. Types on the function value can infer the parameters.

## Defining a function

```ts
function add(a: number, b: number): number {
  return a + b;
}

const add2 = (a: number, b: number): number => a + b;

type BinaryOp = (a: number, b: number) => number;
const add3: BinaryOp = (a, b) => a + b;
```

The last form is **contextual typing**: the variable’s type fills in `a` and `b`.

Look up **FUNCTIONS** (`tsts FUNCTIONS`).

## What you should be able to do

- Annotate parameters and a return type.
- Write an optional parameter (`b?: number`) and a default (`b = 10`).
- Type a rest parameter as an array (`...nums: number[]`).
- Prefer a function type on the binding when several functions share a shape.

## Assigned reading

- Effective TypeScript, 2nd Edition by Dan Vanderkam — Item 12 *Apply Types to Entire Function Expressions When Possible* (PDF p. 83). Item 9 *Prefer Type Annotations to Type Assertions* (PDF p. 72).

Cheat sheet: **FUNCTIONS**.

## Optional, default, rest

```ts
function f(a: number, b?: number): void {}
function g(a: number, b: number = 10): void {}
function h(...nums: number[]): number {
  return nums.reduce((n, x) => n + x, 0);
}
```

Optional parameters follow required ones. `b?` is `number | undefined`. A default makes `b` a `number` inside the body.

A missing `return` still yields `undefined` at runtime. Annotate that as `void` if callers should ignore it.

## Object parameters

For more than a couple of inputs, take one options object:

```ts
function createUser({ name, age = 0 }: { name: string; age?: number }) {}
```

## Coding tasks

The runner is JavaScript. Write `add`, a defaulted greeter, and a rest-parameter sum.
