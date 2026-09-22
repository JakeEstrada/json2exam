# Comprehensions

Build lists, sets, and dicts from iterators in one expression.

## What you should be able to do

- Write list comprehensions with optional `if`.
- Write dict and set comprehensions.
- Prefer a comprehension when it stays readable; otherwise use a loop.

## Assigned reading

Read these in the local `python/sources/` PDFs. Page numbers in the quiz are **PDF file positions**.

- Python Crash Course, 3rd Edition by Eric Matthes — Chapter 4 list comprehensions (PDF p. 98).
- Fluent Python, 2nd Edition by Luciano Ramalho — set literals (PDF p. 171).


## List comprehensions

```python
squares = [n * n for n in nums]
positives = [n for n in nums if n > 0]
```

## Dict and set

```python
index = {name: i for i, name in enumerate(names)}
unique = {n for n in nums}
```

## Coding tasks

Return Python source for small comprehensions.
