# Flexbox

Read this page first. The quiz starts with the container, then axes, then alignment.

## Flexbox principles

`display: flex` on an element turns it into a **flex container**. Its direct children become **flex items**. By default, items sit in a row, left to right. The container fills the available width like a block element. Items share height based on their content.

```css
.nav {
  display: flex;
}
```

You can also use `display: inline-flex` for a container that behaves more like inline-block.

## Main axis and cross axis

Flex layout is defined in terms of a main axis and a cross axis. Talk start/end on those axes rather than only left/right. `flex-direction` points the main axis (`row` or `column`). `justify-content` packs along the main axis. `align-items` packs along the cross axis.

```css
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

## Sizing

You do not need all twelve new properties on day one. `display: flex` gets you far. `flex` on an item (`flex: 1`, `flex: none`, `flex: 0 0 200px`) is the usual size control. `margin: auto` on an item can push neighbors apart.

## What you should be able to do

- Make a row with `display: flex`.
- Space items with `justify-content` / `align-items`.
- Grow one item with `flex: 1`.

## Assigned reading

- CSS in Depth, 1st Edition by Keith J. Grant — Chapter 5 *Flexbox* (PDF p. 144), principles (p. 145), margins between items (p. 152).

## Coding tasks

Return a flex row, a centered row, and space-between.
