# Objects, references, mutation, and copying

## What you should be able to do

- Create objects with literals, read/write properties, and use `in` / optional chaining carefully.
- Explain reference identity: two literals with the same fields are still different objects.
- Mutate vs copy; shallow copy vs nested copy.
- Update one task in a list without aliasing the others.
- Contrast with C++ value objects and pointers.

## Assigned reading

- Eloquent JavaScript, 4th Edition by Marijn Haverbeke — Chapter 4 *Objects* (PDF p. 100) and *Mutability* (PDF p. 110).
- JavaScript: The Definitive Guide, 7th Edition by David Flanagan — object mutability in Chapter 3 (PDF p. 62).

## Objects

An object groups named properties.

```js
const task = { id: 7, status: "open", tags: ["billing"] };
task.status;        // "open"
task["status"];     // same
task.assignee;      // undefined
```

`const` prevents rebinding `task`, not changing `task.status`.

Optional chaining: `row.customer?.name` is `undefined` if `customer` is nullish. It does not invent a customer.

## Mutability and identity

Numbers and strings are immutable. Objects are not.

```js
let object1 = { value: 10 };
let object2 = object1;
let object3 = { value: 10 };
object1 == object2;  // true  same identity
object1 == object3;  // false different objects
object1.value = 15;
object2.value;       // 15
object3.value;       // 10
```

`==` / `===` on objects compare **identity**, not field-by-field equality.

## Copying

Shallow copy: `{ ...task }` or `Object.assign({}, task)`. Nested objects and arrays are still shared.

```js
const copy = { ...task };
copy.status = "done";       // task.status still "open"
copy.tags.push("late");     // task.tags also has "late"
```

For nested updates, copy each level you change:

```js
function updateTask(tasks, id, patch) {
  return tasks.map((task) => {
    if (task.id !== id) return task;
    return { ...task, ...patch };
  });
}
```

Unrelated tasks keep the same object identity. The matched task is a new object.

`structuredClone(task)` deep-copies many values (not functions). Use it when you truly need a snapshot.

## From C++

- A JS object is closer to a pointer to a heap struct than to a `struct` passed by value.
- `const Task t` in C++ can still sit in a vector of values. `const task = {…}` is a const **binding**.
- There is no `operator==` on fields unless you write it (`JSON.stringify` is a blunt instrument).

## Worked examples

Appointments share a nested customer by mistake:

```js
const customer = { id: 1, name: "Ada" };
const a = { when: "9am", customer };
const b = { when: "2pm", customer };
b.customer.name = "Ada Lovelace";
a.customer.name; // also changed
```

Give each appointment its own shallow copy of customer if they must diverge: `{ ...customer }`.

## Common mistakes

- `const copy = original` (alias, not copy).
- Spreading once and mutating a nested array.
- Using `==` to test “same data.”
- `for...in` without `Object.hasOwn` picking up prototype keys.

## Predict the output

```js
const t = { id: 1, status: "open" };
const u = { ...t, status: "done" };
console.log(t.status, u.status, t === u);
```

## Find the bug

```js
function setStatus(tasks, id, status) {
  const t = tasks.find((x) => x.id === id);
  t.status = status;
  return tasks;
}
```

Mutates the caller’s array in place. Fine if that is the API; surprising if callers expected immutability. Return a new array if the rest of the app copies.

## Coding tasks

1. **Basic.** `withStatus(task, status)` — new object, other fields copied shallowly.
2. **Applied.** `updateTask(tasks, id, patch)` — new array; unmatched tasks are the same references.
3. **Applied.** `renameCustomer(appt, name)` — new appointment and new customer object; do not mutate the input.

## Hints

1. `{ ...task, status }`.
2. `map` and the spread in the match arm.
3. `{ ...appt, customer: { ...appt.customer, name } }`.

## Worked solutions

Predict: `open done false`.

```js
function withStatus(task, status) {
  return { ...task, status };
}

function updateTask(tasks, id, patch) {
  return tasks.map((task) => (task.id === id ? { ...task, ...patch } : task));
}

function renameCustomer(appt, name) {
  return { ...appt, customer: { ...appt.customer, name } };
}
```
