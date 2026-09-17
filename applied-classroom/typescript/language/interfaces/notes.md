# Interfaces

`interface` names an object shape. `type` can name that too, plus unions and computed types. For a plain object API, either works. Know the differences.

## interface versus type

```ts
interface State {
  name: string;
  capital: string;
}

type TState = {
  name: string;
  capital: string;
};
```

Look up **INTERFACES**, **TYPE ALIASES**, and **INTERFACE VS TYPE** (`tsts INTERFACES`).

## What you should be able to do

- Declare an interface with fields and a method.
- `extend` one interface from another.
- Use `type` for a union (`string | number`).
- Remember declaration merging: two `interface Window` blocks combine; two `type` aliases with the same name do not.

## Assigned reading

- Effective TypeScript, 2nd Edition by Dan Vanderkam — Item 13 *Know the Differences Between type and interface* (PDF p. 86).

Cheat sheet: **INTERFACES**, **TYPE ALIASES**, **INTERFACE VS TYPE**.

## Extending

```ts
interface User {
  id: number;
  name: string;
}

interface Admin extends User {
  level: number;
}
```

`Admin` has `id`, `name`, and `level`. `implements` on a class is an assertion that the class matches. Structural typing still lets a matching object pass without `implements`.

## When type is required

Unions, tuples, mapped types, and `typeof` aliases need `type`:

```ts
type Id = string | number;
type Pair = [string, number];
```

Use `interface` for public object shapes that might be extended or merged. Use `type` for unions and computed types.

## Coding tasks

Build a user record, promote it to an admin-shaped object, and read a field by name.
