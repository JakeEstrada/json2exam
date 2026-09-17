# Text and lists

Read this page first. The quiz starts with headings, then paragraphs, then the three list types.

## Headings

HTML has six levels of headings, `<h1>` through `<h6>`. `<h1>` is the main heading. `<h2>` is a subheading. Further sections use `<h3>` and so on. Browsers show them at different sizes. Size is not the reason to pick a level — the outline is.

```html
<h1>This is a Main Heading</h1>
<h2>This is a Level 2 Heading</h2>
```

## Paragraphs

```html
<p>A paragraph is a block of text.</p>
```

Do not fake a paragraph with `<div>` or with `<br>` between sentences. Use `<p>`. Emphasis inside a paragraph is `<em>` or `<strong>`, not a new heading.

## Lists

HTML gives you three lists:

- **Ordered** (`<ol>` of `<li>`) — numbered steps, a recipe, a contract.
- **Unordered** (`<ul>` of `<li>`) — bullet points, no implied order.
- **Definition** (`<dl>` of `<dt>` / `<dd>`) — a term and its definition.

```html
<ol>
  <li>Preheat the oven.</li>
  <li>Mix the batter.</li>
</ol>
<ul>
  <li>Eggs</li>
  <li>Flour</li>
</ul>
```

## What you should be able to do

- Pick `h1`–`h6` for outline, not for font size.
- Wrap copy in `<p>`.
- Build ordered, unordered, and nested lists.

## Assigned reading

- HTML and CSS: Design and Build Websites by Jon Duckett — Chapter 2 *Text* (PDF p. 47), *Headings* (p. 50). Chapter 3 *Lists* (PDF p. 69), including ordered, unordered, and definition lists (p. 70).

## Coding tasks

Return heading markup, then `<ul>` / `<ol>` strings from an array of items.
