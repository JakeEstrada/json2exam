# Files

Read and write text without leaking file handles.

## What you should be able to do

- Open a text file with `with open(path) as f:`.
- Read all text or walk lines.
- Write and append.
- Know that paths are strings or `pathlib.Path`.

## Assigned reading

- Python Crash Course, 3rd Edition - *Reading from a File* (PDF p. 222), working with contents (PDF p. 225).

## Opening a file

```python
with open("pi.txt") as f:
    contents = f.read()
```

`with` closes the file even if a later line raises.

## Reading

`f.read()` is the whole file. `f.readlines()` or `for line in f:` walks lines. `splitlines()` drops newline characters.

## Writing

```python
with open("out.txt", "w") as f:
    f.write("hello\n")
```

`"w"` replaces. `"a"` appends. `"r"` is the default read mode.

## Coding tasks

Return Python source that opens, reads, or writes a file.
