# Object types

An object type is a shape: required fields, optional fields, `readonly`. Fresh object literals get extra checking.

## Object type literals

```ts
let user: { name: string; age: number };
function greet(p: { name: string }): string {
  return p.name;
}
```

Extra properties on a **fresh literal** are an error (`excess property checking`). The same extra fields on an existing variable are often allowed (structural typing).

Look up **OBJECT TYPES** (`tsts OBJECT TYPES`).

## What you should be able to do

- Write `{ name: string; age?: number }`.
- Mark `readonly id: number`.
- Predict when a leftover `darkmode` typo is caught (object literal) vs missed (intermediate variable).
- Prefer `Record<string, number>` or `Map` over a string index signature mixed with other fields.

## Assigned reading

- Effective TypeScript, 2nd Edition by Dan Vanderkam — Item 4 *Get Comfortable with Structural Typing* (PDF p. 45). Item 11 / excess property checking (PDF p. 80).

Cheat sheet: **OBJECT TYPES**.

## Optional and readonly

```ts
type User = {
  readonly id: number;
  name: string;
  age?: number;
};
```

`age?` is `number | undefined`. `id` cannot be reassigned through that type. The object at runtime is still a plain object.

## Structural typing

```ts
type Point = { x: number; y: number };
const p = { x: 1, y: 2, z: 3 };
const q: Point = p; // fine: it has x and y
```

Shape matches. You do not declare `implements Point` on a plain object.

## Coding tasks

Pick a field, copy a user, and merge a patch without mutating the source.
