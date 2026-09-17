# Type and color

Read this page first. The quiz starts with color, then type, then relative units.

## Color

Duckett's color chapter is how to specify colors, contrast, and background color. In CSS that is usually `color` for text and `background-color` for the box.

```css
h1 {
  color: yellow;
  background-color: navy;
}
```

Values you will actually type: keywords (`navy`), hex (`#334455`), `rgb()`, sometimes `hsl()`. Contrast matters: yellow on white fails even if the rule is valid.

## Type

The text chapter is size and typeface, then bold/italic/capitals, then spacing. `font-family` names a typeface (Duckett's Arial example). `font-size` sets size. `font-weight` and `font-style` are not a new heading tag.

## Relative units

Pixels are absolute: 5px always means the same thing. `em` and `rem` are relative. The meaning of `2em` depends on which element (and sometimes which property) you use it on. Viewport units (`vh`, `vw`) are relative to the viewport.

```css
body { font-size: 100%; }
h1 { font-size: 2rem; }
```

## What you should be able to do

- Set `color` and `background-color`.
- Set `font-family` and `font-size`.
- Prefer `rem` for type size when you want scaling without nested `em` surprises.

## Assigned reading

- HTML and CSS: Design and Build Websites by Jon Duckett — Chapter 11 *Color* (PDF p. 253), Chapter 12 *Text* (PDF p. 271). Chapter 10 still has the Arial/yellow rule (p. 239).
- CSS in Depth, 1st Edition by Keith J. Grant — Chapter 2 *Working with relative units* (PDF p. 56).

## Coding tasks

Return a color declaration, a font stack, and a rem size.
