# Error handling

`throw` unwinds the stack until a `catch`, or until it leaves the program. `finally` runs on the way out.

## What you should be able to do

- Throw `new Error` (or a subclass) with a message.
- Catch a specific kind and rethrow the rest.
- Predict `finally`, including a `return` inside it.
- Tell `TypeError`, `ReferenceError`, `RangeError`, and `SyntaxError` apart.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Exceptions* (PDF p. 218) and *Cleaning up after exceptions* (PDF p. 221-222).

## Exceptions

```js
function parsePositive(text) {
  const n = Number(text);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("positive integer required");
  }
  return n;
}
```

`throw` is not a return value. Callers that do not catch it never resume after the call. You can throw any value. Throw an `Error` so you get a message and a stack.

`JSON.parse` throws `SyntaxError` on bad text. That one is catchable. A syntax error in the file itself never runs, so a `try` around the bad tokens does not exist at runtime.

`null.foo` is a `TypeError`. Reading an undeclared name is a `ReferenceError`. `Number` methods and `array.flat` do not throw just because a value is missing. Bounds you invent, such as a negative age, are a `RangeError` if you choose that class.

## finally

`finally` runs when the `try` finishes, when `catch` finishes, and when something throws.

It does not swallow the exception. After `finally`, the error keeps unwinding unless `catch` handled it.

A `return` or `throw` inside `finally` replaces the pending return or exception.

```js
function demo() {
  try { return 1; }
  finally { return 2; }
}
demo(); // 2
```

Mutating an object you already decided to return is different: `finally` can push onto that array and the caller sees the push, because it is the same object.

## Error kinds

Catch what you can recover from. Rethrow the rest.

```js
try {
  return parsePositive(text);
} catch (err) {
  if (!(err instanceof RangeError)) throw err;
  return null;
}
```

An empty `catch { }` is legal and hides every exception, including bugs. That is rarely what you want.

## Coding tasks

Write `parsePositive`, `demoReturn`, and `messageOf`.
