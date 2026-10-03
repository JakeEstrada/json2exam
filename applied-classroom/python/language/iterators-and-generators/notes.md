# Iterators and generators

How `for` really works, and how `yield` pauses a function.

## What you should be able to do

- Describe the iterator protocol: `iter` / `next`.
- Write a generator function that `yield`s values.
- Know a generator is exhausted after one pass.
- Prefer a generator when you do not need a full list in memory.

## Assigned reading

- Fluent Python, 2nd Edition - generator expressions / local scope (PDF p. 63) and the data-model special methods (PDF p. 41).

## Iterables

A `for` loop calls `iter(xs)`, then `next` until `StopIteration`. Lists, dicts, files, and ranges are iterable.

## Generators

```python
def squares(n):
    for i in range(n):
        yield i * i
```

Calling `squares(4)` returns a generator, not a list. Each `yield` produces one value and pauses.

## yield

`return` in a generator ends iteration. `yield from xs` forwards another iterable.

## Coding tasks

Return Python source for a small generator.
