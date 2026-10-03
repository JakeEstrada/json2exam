# Methods

Named operations with typed parameters and a return type.

## Methods

```csharp
static int Add(int a, int b) {
    return a + b;
}
```

Instance methods omit `static` and can use `this`.

## Parameters

`ref` passes a variable to be reassigned. `out` is a result the callee must assign. `in` is a readonly ref. Prefer returning a value or a tuple before `out`.

## Overloads

Same name, different parameter lists. Optional arguments must come last.

## Coding tasks

Return C# source for a method and a call.
