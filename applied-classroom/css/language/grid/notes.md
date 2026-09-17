# Grid

Read this page first. The quiz starts with the container, then tracks, then placing items.

## Grid containers

`display: grid` makes a **grid container**. Its children become **grid items**. Grid is two-dimensional: columns and rows. Flexbox is mostly one axis. Grant: the CSS grid lets you define a two-dimensional layout of columns and rows and then place elements within the grid.

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
```

`fr` is a fraction of the leftover space. `1fr 1fr 1fr` is three equal columns.

## Placing items

Some items fill one cell. Others span columns or rows (`grid-column: 1 / 3`). You can place items precisely or let them flow into gaps. `minmax()` lets a track grow between a min and a max.

## With flexbox

Use them together. Grid for the page. Flex for a nav row inside a cell.

## What you should be able to do

- Make a container with `display: grid`.
- Declare columns with `grid-template-columns`.
- Span an item across tracks.

## Assigned reading

- CSS in Depth, 1st Edition by Keith J. Grant — Chapter 6 *Grid layout* (PDF p. 172), grid items (p. 175).

## Coding tasks

Return column templates, a spanning item, and a 2×2 grid.
