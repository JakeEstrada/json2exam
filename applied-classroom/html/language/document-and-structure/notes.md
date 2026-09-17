# Document and structure

Read this page first. The quiz starts with what HTML even is, then tags, then the document tree.

## What HTML is

HTML is a **markup language**. You wrap content in tags so the browser knows what is a heading, a paragraph, or a title. It is not a programming language. There is no loop, no function, and no stylesheet here — CSS is a different language.

A page is a tree of **elements**. Structure is the whole point: same idea as headings in a Word document, applied to a web page.

## What you should be able to do

- Open and close tags, and name the difference between a tag and an element.
- Put attributes on the opening tag (`name="value"` in double quotes).
- Build `<html>`, `<head>` / `<title>`, and `<body>`.
- Know that only the body is shown in the main browser window.

## Assigned reading

Read these in the local `html/sources/` PDF. Page numbers in the quiz are **PDF file positions**.

- HTML and CSS: Design and Build Websites by Jon Duckett — Chapter 1 *Structure* (PDF p. 19), *A Closer Look at Tags* (p. 30), *Attributes Tell Us More About Elements* (p. 32), *Body, Head & Title* (p. 34).

## Tags and elements

```html
<p>Hello</p>
```

The characters in the brackets indicate the tag's purpose. `p` stands for paragraph. The closing tag has a forward slash after `<`. People say “tag” and “element” interchangeably, but an element is the opening tag, the closing tag, and the content between them.

Empty elements (`<img>`, `<input>`) have no content between tags.

## Attributes

```html
<p lang="en-us">Paragraph in English</p>
```

Attributes provide additional information about the contents of an element. They appear on the opening tag. A name, an equals sign, a value in double quotes. Write the name in lowercase.

## Document skeleton

```html
<html>
  <head>
    <title>This is the Title of the Page</title>
  </head>
  <body>
    <h1>This is the Body of the Page</h1>
    <p>Anything within the body of a web page is displayed in the main browser window.</p>
  </body>
</html>
```

`<head>` holds information about the page (the title on the tab). `<body>` holds what the visitor sees.

## Coding tasks

The in-browser runner executes JavaScript. Practice by returning markup strings: a skeleton, a paragraph, and a generic wrap.
