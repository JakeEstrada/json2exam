# Classes

Objects, methods, and `__init__`. This deck is past the beginner syntax cards.

## What you should be able to do

- Define a class and construct an instance.
- Store state on `self` inside `__init__`.
- Call methods on an instance.
- Know that inheritance uses `class Child(Parent):`.

## Assigned reading

- Python Crash Course, 3rd Edition - *Creating and Using a Class* / `__init__()` (PDF p. 196-198).
- Fluent Python, 2nd Edition - special methods that make objects behave like built-ins (PDF p. 41).

## Classes

```python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def sit(self):
        print(self.name + " sits")

my_dog = Dog("Willie", 6)
my_dog.sit()
```

`__init__` runs when you call `Dog(...)`. The first parameter is `self`, the instance.

## Methods

A method is a function on the class. You call it on the instance: `my_dog.sit()`. Python passes `self`.

## Inheritance

```python
class SearchDog(Dog):
    def __init__(self, name, age):
        super().__init__(name, age)
```

`super()` calls the parent constructor.

## Coding tasks

Return Python source for a small class and an instance.
