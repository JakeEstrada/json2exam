# Positioning

Read this page first. The quiz starts with `static`, then relative/absolute/fixed, then stacking.

## Static and positioned

The initial value of `position` is **static**. Everything in earlier layout chapters was static. Change it to anything else and the element is **positioned**. Static elements are not positioned.

Positioning is different from flex and grid: it can **remove elements from normal document flow** and place them somewhere else, overlapping others.

## Types

- **relative** — offset from where it would have been; the original space is kept.
- **absolute** — taken out of flow; placed relative to the nearest positioned ancestor (or the page).
- **fixed** — relative to the viewport.
- **sticky** — a newer type: acts like relative until a threshold, then sticks.

```css
.badge {
  position: relative;
  top: -0.25rem;
  left: -0.25rem;
}
```

Duckett's layout chapter also lists normal flow, relative, absolute, and floats as ways to control where each element sits.

## Stacking

`z-index` only applies to positioned elements (and a few others such as flex items in later CSS). Stacking contexts are the hidden side effect: a positioned ancestor with z-index becomes a new world for its descendants.

## What you should be able to do

- Name static vs relative vs absolute vs fixed vs sticky.
- Know absolute looks for a positioned ancestor.
- Not use absolute for every column (use flex/grid).

## Assigned reading

- CSS in Depth, 1st Edition by Keith J. Grant — Chapter 7 (PDF p. 205–206).
- HTML and CSS: Design and Build Websites by Jon Duckett — Chapter 15 *Layout* (PDF p. 365–366).

## Coding tasks

Return relative, fixed, and sticky snippets.
