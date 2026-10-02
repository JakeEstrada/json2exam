# Lists

Ordered, mutable sequences.

## What you should be able to do

- Create, index, and slice lists.
- Append / extend / pop without confusing copy vs alias.
- Prefer list methods and slices over manual reshuffles when clear.

## Assigned reading

Read these in the local `python/sources/` PDFs. Page numbers in the quiz are **PDF file positions**.

- Python Crash Course, 3rd Edition by Eric Matthes - Chapter 3 *Introducing Lists* (PDF p. 71), indexing (p. 73); Chapter 4 slices (p. 99) and copying (p. 101).


## Create and index

```python
xs = [1, 2, 3]
xs[0]   # 1
xs[-1]  # 3
```

## Slice

```python
xs[1:3]   # [2, 3]
xs[:]     # shallow copy
```

## Mutate

```python
xs.append(4)
xs.extend([5, 6])
xs.pop()
xs[0] = 99
```

## Alias vs copy

```python
a = [1, 2]
b = a       # same list
c = a[:]    # new list, same items
```

## Coding tasks

Return Python source for list creation and a safe copy.
