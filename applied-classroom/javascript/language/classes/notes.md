# Classes

`class` is syntax for a constructor function plus a prototype. Methods are shared. Fields and `#` privates live on the instance.

## What you should be able to do

- Write a constructor, a method, and `new`.
- Say where a method lives versus an instance field.
- Declare `#private` fields. They are not `obj._secret` by convention. They are invisible outside the class.
- Extend a class and call `super` before using `this`.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Classes* (PDF p. 167), private properties (PDF p. 169-170), inheritance (PDF p. 185-186).

## Classes

```js
class Rabbit {
  constructor(type) {
    this.type = type;
  }
  speak(line) {
    console.log(this.type + ": " + line);
  }
}
const killer = new Rabbit("killer");
```

`new` creates an object whose prototype is `Rabbit.prototype`, runs `constructor` with `this` set to that object, and returns the object (unless the constructor returns a different object).

`speak` is on `Rabbit.prototype`, not copied onto each rabbit. `class` declarations are in the temporal dead zone until that line runs. The class body is strict. Calling `Rabbit()` without `new` throws.

## Private properties

```js
class Counter {
  #n = 0;
  inc() {
    this.#n += 1;
    return this.#n;
  }
}
```

A public field such as `speed = 0` is created on each instance, not on the prototype. `#` names must be declared in the class. Reading them outside the class is a syntax error, not a runtime miss.

An arrow stored in a field is created per instance and closes over the instance `this`. A method on the prototype gets `this` from the call.

## Inheritance

```js
class StepCounter extends Counter {
  constructor(start, step) {
    super(start);
    this.step = step;
  }
}
```

`extends` sets the prototype chain. In a derived constructor, `this` is unavailable until `super(...)` returns. `super.inc()` calls the parent method. `instanceof` walks that chain: `new StepCounter(0, 1) instanceof Counter` is true.

## Coding tasks

Write `Counter`, `StepCounter`, and `hasSpeak`.
