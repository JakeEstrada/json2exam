# Unions and narrowing

A union is “one of these.” Narrowing is how you prove which one you have so the checker lets you use it.

## What a union is

```ts
type Result = string | number;
type Status = "idle" | "loading" | "error";
```

Only members common to every branch are available without a check. `x.toString()` is fine on `string | number`. `x.toUpperCase()` is not.

Look up **UNIONS AND INTERSECTIONS** and **NARROWING** (`tsts UNIONS`).

## What you should be able to do

- Write `A | B` and a string-literal union.
- Narrow with `typeof`, `===`, and `Array.isArray`.
- Spot a discriminant (`kind: "circle"`) on a union of objects.
- Prefer a union of shapes over one object with many optional fields.

## Assigned reading

- Effective TypeScript, 2nd Edition by Dan Vanderkam — Item 7 *Think of Types as Sets of Values* (PDF p. 59). Item 22 *Understand Type Narrowing* (PDF p. 133).

Cheat sheet: **UNIONS AND INTERSECTIONS**, **NARROWING**, **TYPE GUARDS**.

## Narrowing

```ts
function len(x: string | string[]) {
  if (typeof x === "string") return x.length;
  return x.length;
}
```

Inside the `typeof` branch, `x` is `string`. `Array.isArray` narrows an array union the same way. An `if (x === null)` block excludes `null` from the rest.

A **discriminated union** shares a literal field:

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };
```

Switch on `kind`, then `radius` or `side` is legal.

## Intersections

`A & B` means both. `string & number` is `never`. Object intersections merge properties.

## Coding tasks

Practice the runtime checks TypeScript is modeling: `typeof`, `Array.isArray`, and a `kind` tag.
