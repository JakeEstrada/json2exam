# Variables and types

Read this page first. The quiz starts with names and values, then truthiness, then conversion.

## What you should be able to do

- Bind a name with `=`; rebind freely (types live on values).
- Name the core builtins: `int`, `float`, `str`, `bool`, `None`.
- Convert with `int()`, `float()`, `str()`, `bool()` without surprise.
- Know `True` / `False` / `None` are capitalized.

## Assigned reading

Read these in the local `python/sources/` PDFs. Page numbers in the quiz are **PDF file positions**.

- Python Crash Course, 3rd Edition by Eric Matthes — Chapter 2 *Variables and Simple Data Types* (PDF p. 53), *Variables* (p. 54), numbers (p. 64). Boolean values also appear in Chapter 5 (PDF p. 115).


## Values and names

```python
x = 1
x = "hi"  # legal; the name points at a new value
```

Python names are references. There is no `let` / `const`. Convention: `snake_case` for variables and functions.

## Built-in types

```python
n = 3          # int
rate = 0.1     # float
label = "paid" # str
ok = True      # bool
missing = None # NoneType
```

`type(x)` reports the type of the current value.

## Truthiness

```python
bool(0)      # False
bool("")     # False
bool([])     # False
bool(None)   # False
bool("0")    # True — non-empty string
```

Non-empty containers and non-zero numbers are truthy.

## Conversion

```python
int("40")
float("1.5")
str(40)
bool(1)
```

`int("hi")` raises `ValueError`. Prefer explicit conversion over surprise coercion.

## Coding tasks

The in-browser runner executes JavaScript. Practice by **returning Python source strings**: bind a name, convert a string amount, and drop unusable rows in a small snippet.
