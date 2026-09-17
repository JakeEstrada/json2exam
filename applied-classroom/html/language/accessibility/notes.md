# Accessibility

Read this page first. The quiz starts with labels, then inclusive controls, then keyboard access.

## Labels

Visible labels are not decoration. Duckett: each form control should have its own `<label>` so the form is accessible to vision-impaired users. Wrap the control or wire `for` to `id`.

```html
<label>Age: <input type="text" name="age" /></label>
```

## Meaningful images

`alt` should describe the image if you cannot see it. Duckett: it should give an accurate description so screen reader software can understand the content. Decorative images still carry `alt`, with empty quotes.

```html
<img src="images/quokka.jpg" alt="A family of quokka" />
<img src="line.png" alt="" />
```

## Inclusive controls

A control that is on or off still has to communicate that state. Inclusive Components starts with toggle buttons: purpose is simple, but it is easy to forget a name, a pressed state, or a keyboard path.

`aria-pressed` is one way a button exposes on/off. Checkboxes and radio buttons are the primitives of interactive forms — use the native control when it already does the job.

## Keyboard access

If a feature appears only on hover, keyboard users never get it. Pickering's todo example: delete that exists only on hover is inaccessible from the keyboard.

Name every button with text (or aria-label if the text is visually hidden on purpose). Decorative images keep `alt=""`. Meaningful images keep a real alt.

## What you should be able to do

- Label every control.
- Prefer native buttons/inputs; add ARIA only when you invent a widget.
- Make actions work with a keyboard, not hover alone.

## Assigned reading

- HTML and CSS: Design and Build Websites by Jon Duckett — *Labelling Form Controls* (PDF p. 170), *Adding Images* / alt (PDF p. 106).
- Inclusive Components by Heydon Pickering — *Toggle buttons* (PDF p. 8), *Checkboxes and radio buttons* (p. 9), todo list keyboard note (p. 39).

## Coding tasks

Return a labeled input, a named button, and an image whose alt is empty when decorative.
