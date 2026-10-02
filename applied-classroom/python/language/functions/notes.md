# Functions

`def`, parameters, return, and scope.

## What you should be able to do

- Define functions with `def` and a colon.
- Use positional args, defaults, and `return`.
- Know that default mutable args are a trap.

## Assigned reading

Read these in the local `python/sources/` PDFs. Page numbers in the quiz are **PDF file positions**.

- Python Crash Course, 3rd Edition by Eric Matthes - Chapter 8 *Functions* (PDF p. 167), optional/default arguments (p. 176).
- Fluent Python, 2nd Edition by Luciano Ramalho - mutable defaults (PDF p. 378).


## def

```python
def add(a, b):
    return a + b
```

## Defaults and keyword args

```python
def greet(name, title="friend"):
    return f"{title}: {name}"

greet("Ada")
greet("Ada", title="Dr")
```

## Mutable default trap

```python
def append_item(x, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(x)
    return bucket
```

Never use `bucket=[]` as a default.

## Coding tasks

Return Python source for small function definitions.
