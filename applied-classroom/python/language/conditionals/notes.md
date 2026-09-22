# Conditionals

Comparisons, truthiness in `if`, and branches.

## What you should be able to do

- Compare with `==`, `!=`, `<`, `<=`, `>`, `>=`.
- Use `is` / `is not` for `None`.
- Write `if` / `elif` / `else` with indented blocks.
- Combine with `and`, `or`, `not`.

## Assigned reading

Read these in the local `python/sources/` PDFs. Page numbers in the quiz are **PDF file positions**.

- Python Crash Course, 3rd Edition by Eric Matthes — Chapter 5 *if Statements* (PDF p. 109), equality tests (p. 111), Boolean expressions (p. 115).


## Comparisons

```python
x == 3
x != 3
x is None
x is not None
```

`==` tests equality of value. `is` tests identity. Use `is` for `None`.

## If / elif / else

```python
if status == "paid":
    total += amount
elif status == "pending":
    waiting += 1
else:
    skipped += 1
```

Colons end the header. The body is indented.

## Boolean operators

```python
if amount and customer:
    charge(customer, amount)
if not ready:
    return
```

`and` / `or` short-circuit and return an operand, not always a bool.

## Coding tasks

Return Python source for a small `if` that gates a checkout.
