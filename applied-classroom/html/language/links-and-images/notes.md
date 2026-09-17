# Links and images

Read this page first. The quiz starts with `href`, then `src` / `alt`.

## Writing links

Links use the `<a>` element. Visitors click anything between the opening `<a>` and the closing `</a>`. You specify the destination with the **href** attribute — not `src`.

```html
<a href="http://www.imdb.com">IMDB</a>
```

Same-site pages use a path (`about.html`, `./notes.html`). Other sites use a full URL. Email links use `mailto:`.

## Adding images

`<img>` is empty (no closing tag). It needs **src** (where the file is) and **alt** (a text description if you cannot see the image). `title` may add a tooltip; it does not replace alt.

```html
<img src="images/quokka.jpg" alt="A family of quokka" />
```

If the image is only decoration, alt is still required — use empty quotes.

## What you should be able to do

- Write `<a href="...">` for pages, sites, and `mailto:`.
- Add `<img src="..." alt="...">` and explain alt.
- Not swap href and src.

## Assigned reading

- HTML and CSS: Design and Build Websites by Jon Duckett — Chapter 4 *Links* (PDF p. 81), *Writing Links* (p. 84). Chapter 5 *Images* (PDF p. 101), *Adding Images* (p. 106).

## Coding tasks

Return an anchor, an image, and a mailto link as strings.
