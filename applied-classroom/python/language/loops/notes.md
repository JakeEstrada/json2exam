# Loops

`while`, `for`, `range`, and walking sequences.

## What you should be able to do

- Write `while` and `for` loops with indented bodies.
- Use `range`, `break`, and `continue`.
- Prefer `for x in items` over manual indexes when you only need values.

## Assigned reading

Read these in the local `python/sources/` PDFs. Page numbers in the quiz are **PDF file positions**.

- Python Crash Course, 3rd Edition by Eric Matthes — Chapter 4 *Working with Lists* / `range()` (PDF p. 95); Chapter 7 *User Input and while Loops* (PDF p. 155).


## while

```python
i = 0
while i < n:
    print(i)
    i += 1
```

## for and range

```python
for i in range(n):
    print(i)

for item in rows:
    print(item)
```

`range(n)` yields 0 .. n-1. `range(a, b)` is half-open.

## break and continue

```python
for x in nums:
    if x < 0:
        continue
    if x == 0:
        break
    use(x)
```

## Coding tasks

Return Python source for a counting loop and a walk over a list.
