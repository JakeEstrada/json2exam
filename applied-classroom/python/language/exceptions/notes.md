# Exceptions

Catch failures without crashing, then decide what to do.

## What you should be able to do

- Wrap risky code in `try` / `except`.
- Catch a specific exception type, not a bare `except:`.
- Use `else` and `finally`.
- `raise` your own error when a precondition fails.

## Assigned reading

- Python Crash Course, 3rd Edition - *Using try-except Blocks* / `ZeroDivisionError` (PDF p. 231-232).

## try and except

```python
try:
    print(5 / 0)
except ZeroDivisionError:
    print("cannot divide by zero")
```

Python runs the `try` body. If that exception type is raised, the matching `except` runs.

## else and finally

`else` runs when no exception was raised. `finally` always runs.

```python
try:
    n = int(text)
except ValueError:
    n = 0
else:
    use(n)
finally:
    log("done")
```

## Raising

```python
if age < 0:
    raise ValueError("age must be >= 0")
```

## Coding tasks

Return Python source for a try/except and a raise.
