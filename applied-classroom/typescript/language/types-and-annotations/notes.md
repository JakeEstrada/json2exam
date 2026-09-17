# Types and annotations

Read this page first. The quiz starts with what TypeScript even is, then annotations, then the sharp edges (`String` vs `string`, `any` vs `unknown`).

## What TypeScript is

TypeScript is JavaScript plus a type checker. You write `.ts`. `tsc` type-checks and emits `.js`. The engine runs that JavaScript. **Types are erased.**

```ts
let count: number = 0;
count = 1;
```

becomes `let count = 0; count = 1;` at runtime. There is no `#include`, no preprocessor, and no runtime `typeof(T)`.

The syntax is still C-like JavaScript: braces, `for (let i = 0; i < n; i++)`. Types go on names. `let x: number = 1` then `x = "hi"` is a compile error.

Look up **BASIC TYPES** and **MENTAL MODEL** in the cheat sheet (`tsts BASIC TYPES`).

## What you should be able to do

- Explain that `.ts` compiles to `.js` and types do not exist at runtime.
- Write `: string`, `: number`, `: boolean` on a binding or parameter.
- Prefer inference for initialized locals; annotate parameters and empty arrays.
- Use lowercase `string` / `number` / `boolean`, not the wrapper objects.
- Reach for `unknown` instead of `any` when the value is untrusted.

## Assigned reading

Read these in the local `typescript/sources/` PDFs. Page numbers in the quiz are **PDF file positions**.

- Effective TypeScript, 2nd Edition by Dan Vanderkam — Chapter 1 *Getting to Know TypeScript* (PDF p. 27), especially Item 1 (TypeScript compiles to JavaScript) and Item 3 (code generation is independent of types, PDF p. 38). Item 7 *Think of Types as Sets of Values* (PDF p. 59). Item 9 *Prefer Type Annotations to Type Assertions* (PDF p. 72).

Cheat sheet: **MENTAL MODEL**, **BASIC TYPES**, **ANY UNKNOWN NEVER VOID**.

## Annotations and inference

```ts
let s: string = "hello";
let n = 42;              // inferred number
const y = 42;            // literal type 42
const items: string[] = [];
```

Do not annotate what is already inferred. Do annotate function parameters and empty containers (`[]` is `any[]` unless you say otherwise).

A type assertion (`value as string`) is not the same as an annotation. Prefer `const name: string = value`.

## string versus String

Always lowercase. `String`, `Number`, and `Boolean` are wrapper object types and almost never what you want.

## any, unknown, never, void

- `any` turns the checker off for that name.
- `unknown` is the safe top type. You must narrow before using it.
- `void` means “ignore the return.”
- `never` means “does not return at all” (throw, infinite loop, exhaustive leftover).

## Coding tasks

The in-browser runner executes JavaScript. Practice the runtime side of these types: convert, label, and pick a defined value.
