# Tables and media

Read this page first. The quiz starts with rows and cells, then captions and images sitting with structure.

## Basic table structure

`<table>` creates a table. You write it **row by row**. `<tr>` starts a row (table row). Each cell is `<td>` (table data). Close the row with `</tr>`.

```html
<table>
  <tr>
    <td>15</td>
    <td>15</td>
    <td>30</td>
  </tr>
</table>
```

Headings for columns (or rows) use `<th>`, not bold `<td>`. A caption is `<caption>` as the first child of the table. Images still use `<img src alt>` when a cell holds a picture.

## What you should be able to do

- Build `table` / `tr` / `td`.
- Use `th` for headings.
- Not use tables for page layout.

## Assigned reading

- HTML and CSS: Design and Build Websites by Jon Duckett — Chapter 6 *Tables* (PDF p. 133), *Basic Table Structure* (p. 138). Images remain Chapter 5 (p. 106) when a cell contains a picture.

## Coding tasks

Return a row, a header row, and a small table from arrays.
