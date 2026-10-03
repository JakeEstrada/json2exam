# Prototypes and this

How methods are shared, and why `this` depends on the call.

## What you should be able to do

- Read `Object.getPrototypeOf` and know methods can live on a prototype.
- Explain why `obj.method()` sets `this` to `obj`.
- Know a detached method loses `this`, and that arrows close over `this`.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Prototypes* (PDF p. 164) and `this` (PDF p. 163).
- JavaScript: The Definitive Guide, 7th Edition - prototype objects (PDF p. 148).

## Prototypes

Objects inherit properties from a prototype. Many rabbits can share one `speak` function on that prototype.

```js
Object.getPrototypeOf({}) === Object.prototype;
```

## this

```js
speak.call(whiteRabbit, "Hurry");
```

A regular `function` has its own `this` from the call site. Arrow functions do not bind `this`; they see the enclosing one.

## Methods

`whiteRabbit.speak("Hurry")` is a method call: `this` is `whiteRabbit`. `const fn = whiteRabbit.speak; fn()` is not.

## Coding tasks

Return JavaScript source for a method call and an arrow that keeps `this`.
