# Dicts and sets

Hash maps and unique collections.

## What you should be able to do

- Create dicts, get/set keys, and iterate items.
- Use `.get` for missing keys.
- Use sets for membership and uniqueness.
- Know keys must be hashable.

## Assigned reading

Read these in the local `python/sources/` PDFs. Page numbers in the quiz are **PDF file positions**.

- Python Crash Course, 3rd Edition by Eric Matthes — Chapter 6 *Dictionaries* (PDF p. 129), `get()` (p. 136).
- Fluent Python, 2nd Edition by Luciano Ramalho — set literals / empty set (PDF p. 171).


## Dicts

```python
d = {"a": 1, "b": 2}
d["a"]
d.get("z", 0)
d["c"] = 3
for k, v in d.items():
    print(k, v)
```

## Sets

```python
s = {1, 2, 3}
s.add(4)
2 in s
```

Empty set is `set()`, not `{}` (`{}` is an empty dict).

## Coding tasks

Return Python source for dict and set basics.
