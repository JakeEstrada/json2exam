# Semantic elements

Read this page first. The quiz starts with class and id, then HTML5 landmarks versus a pile of `div`s.

## Extra markup

After the grouped tags (text, lists, links, images, tables, forms), leftover tools still matter: comments, global attributes (`class`, `id`), grouping when no other element fits, and `<meta>`.

## Class and id

Every element can carry a **class** (several elements may share one) or an **id** (unique in the page). These are global attributes. `class` is how you mark a family of elements for CSS. `id` names one.

```html
<p class="important">For a one-year period...</p>
```

## HTML5 layout elements

For a long time authors used `<div id="header">` and friends. HTML5 adds elements that **define the structure of a page**: `<header>`, `<nav>`, `<article>`, `<section>`, `<aside>`, `<footer>`. They are helpful alternatives to `div`. A `div` is still fine when no landmark fits.

```html
<header>
  <h1>Course</h1>
  <nav><a href="/">Home</a></nav>
</header>
<article>
  <h2>Lesson</h2>
  <p>Read this first.</p>
</article>
```

## What you should be able to do

- Choose `class` vs `id`.
- Prefer `header` / `nav` / `article` / `footer` over anonymous `div`s for those roles.
- Leave `div` for generic grouping.

## Assigned reading

- HTML and CSS: Design and Build Websites by Jon Duckett — Chapter 8 *Extra Markup* (PDF p. 183), global attributes (p. 184), *Class Attribute* (p. 191). Chapter 17 *HTML5 Layout* (PDF p. 435), new layout elements (p. 436), traditional `div` layouts (p. 438).

## Coding tasks

Return a header, a nav list, and an article as strings.
