# Classes

Types with fields, properties, and constructors.

## Classes

```csharp
class Dog {
    public string Name { get; }
    public int Age { get; private set; }

    public Dog(string name, int age) {
        Name = name;
        Age = age;
    }

    public void Sit() { }
}
```

## Properties

`{ get; set; }` is an auto-property. Use `private set` or `init` to restrict writes. Fields stay private.

## Inheritance

`class SearchDog : Dog` calls `base(name, age)`. `virtual` / `override` for methods you expect to replace.

## Coding tasks

Return C# source for a class, a property, and a constructor.
