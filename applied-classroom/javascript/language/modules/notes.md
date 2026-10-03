# Modules

Split a program into files with an explicit interface.

## What you should be able to do

- `export` names and `import` them.
- Know ES modules are strict and have their own scope.
- Prefer named exports for more than one value.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Modules* / ES modules (PDF p. 266-267).
- JavaScript: The Definitive Guide, 7th Edition - `import` and `export` (PDF p. 273).

## export

```js
export function add(a, b) {
  return a + b;
}
export const VERSION = 1;
```

## import

```js
import { add } from "./math.js";
```

The path is a module specifier. In browsers it usually needs a `./` and a file extension.

## default

One default export per module: `export default function load() {}` then `import load from "./load.js"`. Named exports scale better.

## Coding tasks

Return JavaScript source for export and import.
