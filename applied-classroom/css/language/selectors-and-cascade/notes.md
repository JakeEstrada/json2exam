# Selectors and cascade

Read this page first. The quiz starts with what a rule is, then specificity, then source order.

## What CSS is

CSS is a stylesheet language. You write **rules** that say how HTML elements should appear. It is not a programming language. Duckett: a rule has a **selector** and a **declaration**. Grant: the C in CSS is the cascade.

```css
p {
  font-family: Arial;
}
```

## Rules

Selectors indicate which element the rule applies to. Declarations sit in curly brackets. Each declaration is a **property** and a **value**, separated by a colon. Several properties are separated by semicolons.

```css
h1, h2, h3 {
  font-family: Arial;
  color: yellow;
}
```

## The cascade

When declarations conflict, the browser walks origin, then specificity, then source order. A declaration that wins is the **cascaded value** — at most one per property per element. Later styles override earlier styles when specificity matches. `!important` is a last resort, not a layout tool.

IDs beat classes beat tags. `#page-title` beats `.title`. Two classes beat one class plus some tags.

## What you should be able to do

- Write `selector { property: value; }`.
- Rank ID vs class vs element.
- Predict which of two equal-specificity rules wins (the later one).

## Assigned reading

- HTML and CSS: Design and Build Websites by Jon Duckett — Chapter 10 *Introducing CSS* (PDF p. 233), rules (p. 238–239).
- CSS in Depth, 1st Edition by Keith J. Grant — Chapter 1 (PDF p. 31), origin (p. 36), specificity (p. 40), source order (p. 45).

## Coding tasks

Return a rule string, an ID selector rule, and the winner of two same-specificity declarations.
