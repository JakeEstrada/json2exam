# LINQ

Query operators over sequences. Deeper than a `for` loop when you are filtering and projecting.

## Where and Select

```csharp
var names = people
    .Where(p => p.Age >= 18)
    .Select(p => p.Name)
    .ToList();
```

`Where` filters. `Select` maps. Execution is deferred until you enumerate or call `ToList`.

## Deferred execution

Building the query does not walk the source. Changing the source before `ToList()` changes the result. Call `ToList` when you need a snapshot.

## Aggregates

`Any`, `All`, `First`, `FirstOrDefault`, `Count`, `Sum`. `First` throws if empty; `FirstOrDefault` returns default.

## Coding tasks

Return C# LINQ that filters and projects.
