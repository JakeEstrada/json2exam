# Recursion

A function that calls itself. Each call has its own parameters. The stack grows until a base case returns.

## What you should be able to do

- Write a base case that is actually reached.
- Return the recursive result. Dropping it computes nothing.
- Walk a tree, where a loop over one list is the wrong shape.
- Know the call stack can overflow. JavaScript engines do not give you reliable tail-call elimination.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Recursion* (PDF p. 88-89).

## Recursion

```js
function power(base, exponent) {
  if (exponent === 0) return 1;
  return base * power(base, exponent - 1);
}
power(2, 3); // 8
```

`power(2, 3)` waits on `power(2, 2)`, which waits on `power(2, 1)`, which waits on `power(2, 0)`. Then the multiplications finish on the way back: 1, 2, 4, 8.

The book notes this style is often slower than a loop for a straight product. Use it when the data branches.

## Base case

Without `exponent === 0`, every call makes another call. That is a `RangeError: Maximum call stack size exceeded`, not an infinite `while` that you can break from the outside easily.

The base case must be a value the recursion actually moves toward. `power(2, -1)` with only the `=== 0` check never hits it.

## Call stack

Each call stores its own `base` and `exponent`. The inner `exponent - 1` does not change the outer parameter.

A tree sum is the shape recursion is for:

```js
function sumTree(node) {
  const kids = node.children || [];
  let total = node.value;
  for (const kid of kids) total += sumTree(kid);
  return total;
}
```

Memoizing a pure function means storing results you already computed so a later call with the same arguments does not walk that branch again.

## Coding tasks

Write `power`, `sumTree`, and `flatten`.
