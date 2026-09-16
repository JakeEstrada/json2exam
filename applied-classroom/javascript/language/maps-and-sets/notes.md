# Maps, Sets, and choosing a collection

## What you should be able to do

- State when an array, a plain object, a `Map`, or a `Set` is the right tool.
- Use `Map` for key/value data whose keys are not already safe property names.
- Use `Set` for uniqueness and membership.
- Group appointments by provider without `in` prototype traps.
- Avoid using `map` (the array method) when you mean `Map` (the collection).

## Assigned reading

- Eloquent JavaScript, 4th Edition by Marijn Haverbeke — Chapter 6 *Maps* (PDF p. 173).
- JavaScript: The Definitive Guide, 7th Edition by David Flanagan — standard-library Map and Set after you finish Chapter 3 objects (cite pages only if you open them and verify).

## Why not a plain object as a dictionary

Objects can look like maps:

```js
const ages = { Boris: 39, Liang: 22 };
"Jack" in ages;      // false
"toString" in ages;  // true  inherited
```

`toString` is on `Object.prototype`. Using objects as maps is unsafe unless you create `Object.create(null)` or you only use known keys and `Object.hasOwn`.

Property names are strings (or symbols). You cannot key an object by another object.

## Map

```js
const ages = new Map();
ages.set("Boris", 39);
ages.get("Boris");           // 39
ages.has("Jack");            // false
ages.delete("Boris");
ages.size;
for (const [name, age] of ages) { /* ... */ }
```

Keys can be any value, compared with `SameValueZero` (like `===` but `NaN` matches `NaN`).

Group appointments:

```js
function byProvider(appts) {
  const groups = new Map();
  for (const appt of appts) {
    const list = groups.get(appt.providerId) || [];
    list.push(appt);
    groups.set(appt.providerId, list);
  }
  return groups;
}
```

## Set

```js
const seen = new Set();
seen.add(3);
seen.add(3);
seen.size;          // 1
seen.has(3);        // true
```

Unique patient ids: `new Set(rows.map((r) => r.patientId))`.

`Set` is not a map. There is no value beside membership.

## Choosing a collection

| Need | Use |
|---|---|
| Ordered list, duplicates OK, index | Array |
| Record with fixed field names (`id`, `status`) | Object |
| Dynamic keys, unknown names, non-string keys, frequent add/delete | Map |
| Uniqueness / “have I seen this” | Set |
| Transform a list | `array.map` — not `Map` |

## From C++

- `Map` ≈ `std::unordered_map` (no guaranteed hash-order in your head; iteration is insertion order in JS).
- `Set` ≈ `std::unordered_set`.
- Plain objects are not `std::map<string, T>` because of the prototype chain.

## Worked examples

Unique providers from appointments:

```js
function providerIds(appts) {
  return [...new Set(appts.map((a) => a.providerId))];
}
```

## Common mistakes

- `if (key in obj)` on a dictionary object.
- Using array `map` when you needed a `Map`.
- Assuming `Map` keys stringify: object keys stay the same reference.
- Forgetting `Map` methods (`get`/`set`) and writing `map[key]` (that sets a property on the Map object, not an entry).

## Predict the output

```js
const m = new Map();
m.set("toString", 1);
console.log(m.has("toString"), "toString" in {});
```

## Find the bug

```js
function tally(rows) {
  const out = {};
  for (const row of rows) {
    const k = row.kind;
    if (!out[k]) out[k] = 0;
    out[k] += 1;
  }
  return out;
}
tally([{ kind: "toString" }]);
```

If `out[k]` hits a function on the prototype, `if (!out[k])` is false for `toString` because the method is truthy — you skip initializing and then `out[k] += 1` concatenates or fails. Use `Map` or `Object.create(null)` or `Object.hasOwn`.

## Coding tasks

1. **Basic.** `unique(ids)` — array of unique values preserving first-seen order (`Set`).
2. **Applied.** `groupAppointments(appts)` — `Map` from `providerId` to array of appointments.
3. **Applied.** `chooseCollection(need)` — return `"array"`, `"object"`, `"map"`, or `"set"` for a short need string: `"list"`, `"record"`, `"dict"`, `"unique"`.

## Hints

1. `return [...new Set(ids)]`.
2. `get` or empty array, `push`, `set`.
3. A small `switch` or dictionary of your own (not user keys).

## Worked solutions

Predict: `true true` — `in {}` sees inherited `toString`. `m.has("toString")` is a real entry.

```js
function unique(ids) {
  return [...new Set(ids)];
}

function groupAppointments(appts) {
  const groups = new Map();
  for (const appt of appts) {
    const list = groups.get(appt.providerId);
    if (list) list.push(appt);
    else groups.set(appt.providerId, [appt]);
  }
  return groups;
}

function chooseCollection(need) {
  switch (need) {
    case "list": return "array";
    case "record": return "object";
    case "dict": return "map";
    case "unique": return "set";
    default: return "array";
  }
}
```
