# Box model

Read this page first. The quiz starts with content / padding / border / margin, then `box-sizing`.

## Boxes

Every element is a box. Duckett: every box has **border**, **margin**, and **padding**. Border separates boxes. Margin sits outside the border (a gap between boxes). Padding is the space between the border and the content.

```css
p {
  padding: 10px;
  margin: 1em;
  border: 1px solid #665544;
}
```

## Width and box-sizing

The default box model counts `width` as the content box. Padding and border add extra, so `width: 70%` plus padding can overflow the parent. Grant: with `box-sizing: border-box`, padding doesn't make the element wider; it makes the inner content narrower.

```css
.main, .sidebar {
  box-sizing: border-box;
}
```

Avoid magic numbers (26% because it looked right on one screen). Prefer `border-box` or `calc()`.

## What you should be able to do

- Name content, padding, border, margin.
- Explain content-box vs border-box.
- Set padding and margin without swapping them.

## Assigned reading

- HTML and CSS: Design and Build Websites by Jon Duckett — Chapter 13 *Boxes* (PDF p. 307), *Border, Margin & Padding* (p. 314), *padding* (p. 320).
- CSS in Depth, 1st Edition by Keith J. Grant — Chapter 3 (PDF p. 83), default box model (p. 87), border-box (p. 88).

## Coding tasks

Return padding/margin rules and a border-box snippet.
