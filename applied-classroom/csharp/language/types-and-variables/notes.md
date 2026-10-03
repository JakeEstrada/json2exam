# Types and variables

C# is statically typed. The compiler checks names before the program runs.

## Types

`int`, `long`, `double`, `bool`, `string`, and `char` are the everyday built-ins. `var` asks the compiler to infer a type from the initializer. It is still a real type.

## Variables

```csharp
int count = 0;
string name = "Ada";
var total = 1.5;
```

A local must be assigned before you read it. Fields get a default (`0`, `null`, `false`).

## Null

Reference types can be `null`. `string?` in nullable context means "string or null". Value types need `int?` for a missing number.

## Coding tasks

Return C# source for a typed local and a nullable int.
