# Responsive

Read this page first. The quiz starts with one site for every viewport, then media queries, then mobile first.

## Responsive design

Do not maintain `m.example.com` plus a desktop site. Serve the same HTML and CSS. Render differently from **viewport size**. Ethan Marcotte named this **responsive design**.

Duckett's layout chapter already flags different screen sizes and fixed vs liquid layouts.

## Media queries

A media query can change the design at a breakpoint:

```css
.nav { display: block; }

@media (min-width: 40em) {
  .nav { display: flex; }
}
```

`min-width` is the mobile-first query: base styles are the small screen; larger viewports add layout.

## Mobile first

Design the constrained layout first. Then progressive-enhance for large screens. Grant: once your mobile experience works, use progressive enhancement to augment it for large-screen users.

A mobile layout is mostly no-frills. Hide a menu behind a control instead of copying a second website.

## What you should be able to do

- Explain one codebase, many viewports.
- Write a `min-width` media query.
- Put small-screen CSS outside the query.

## Assigned reading

- CSS in Depth, 1st Edition by Keith J. Grant — Chapter 8 *Responsive design* (PDF p. 229–231).
- HTML and CSS: Design and Build Websites by Jon Duckett — Chapter 15 *Layout* (PDF p. 365–366).

## Coding tasks

Return a media query wrapper, a mobile-first pair, and a fluid width.
