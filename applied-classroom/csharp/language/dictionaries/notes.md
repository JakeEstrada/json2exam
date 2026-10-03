# Dictionaries

Key/value lookup. This is the C# counterpart of a Python dict or a JavaScript Map.

## Initialize

```csharp
var ages = new Dictionary<string, int>();
var known = new Dictionary<string, int> {
    ["Ada"] = 36,
    ["Grace"] = 85
};
```

Generic arguments are key type, then value type.

## Lookup

```csharp
int n = ages["Ada"];          // KeyNotFoundException if missing
bool ok = ages.TryGetValue("Ada", out int age);
int orZero = ages.GetValueOrDefault("Ada");
```

The indexer get throws when the key is absent. Prefer `TryGetValue` when the key might be missing.

## Exists

```csharp
ages.ContainsKey("Ada");
ages.ContainsValue(36);
```

ContainsKey is the membership test for keys. ContainsValue walks values (slower).

## Mutate

`ages["Ada"] = 37` adds or replaces. `Add` throws if the key exists. `Remove` returns whether it was there.

## Coding tasks

Return C# source that creates a dictionary, reads a key, and tests membership.
