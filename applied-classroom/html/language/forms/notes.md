# Forms

Read this page first. The quiz starts with how a form is submitted, then controls, then labels.

## How forms work

A visitor fills in a form and presses a button. The **name** of each control is sent to the server along with the value. The server processes it and often returns a new page.

```html
<form action="/vote" method="post">
  <label>Username: <input type="text" name="user" /></label>
  <button type="submit">Submit</button>
</form>
```

## Form controls

Single-line text, password, textarea, radio, checkbox, drop-down, submit, file upload. Radio buttons: pick one of a set (shared `name`). Checkboxes: zero or more.

## Labels

Each control should have its own `<label>`. That makes the form accessible. Two patterns: wrap the control, or point `for` at the control's `id`.

```html
<label>Age: <input type="text" name="age" /></label>
<input id="female" type="radio" name="gender" value="f">
<label for="female">Female</label>
```

## What you should be able to do

- Build a `form` with `action` / `method` and named controls.
- Pair every input with a label.
- Choose radio vs checkbox vs text.

## Assigned reading

- HTML and CSS: Design and Build Websites by Jon Duckett — Chapter 7 *Forms* (PDF p. 151), *Form Controls* (p. 155), *How Forms Work* (p. 156), *Labelling Form Controls* (p. 170).

## Coding tasks

Return a labeled text field, a submit button, and a wrapping form.
