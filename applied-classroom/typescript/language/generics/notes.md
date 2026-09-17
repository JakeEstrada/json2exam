# Generics

A type parameter is a placeholder the caller fills in. Think of a generic type as a function from types to types.

## identity

```ts
function identity<T>(value: T): T {
  return value;
}

identity("a");          // T inferred as string
identity<number>(1);    // T set explicitly
```

Look up **GENERICS** (`tsts GENERICS`).

## What you should be able to do

- Write `<T>` on a function and use `T` in the parameter and return.
- Add a constraint: `T extends { length: number }`.
- Use `K extends keyof T` to type a property lookup.
- Prefer inference (`identity("a")`) over spelling `<string>` when the argument already proves T.

## Assigned reading

- Effective TypeScript, 2nd Edition by Dan Vanderkam — Chapter 6 *Generics and Type-Level Programming* (PDF p. 241), Item 50 *Think of Generics as Functions Between Types* (PDF p. 242).

Cheat sheet: **GENERICS**.

## Constraints

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
```

`longest("abc", "de")` is `string`. `longest(1, 2)` is an error: `number` has no `length`.

## keyof

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

`getProp(user, "name")` is `string`. `getProp(user, "nope")` is an error.

At runtime this is `obj[key]`. The generic is the compile-time contract. Types are still erased, so you cannot `switch (T)`.

## Coding tasks

Write `identity`, `longest` by `.length`, and `getProp` as JavaScript. The TypeScript generics are what you would add in `.ts`.
