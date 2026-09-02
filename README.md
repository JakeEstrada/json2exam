# Json2Exam

A browser quiz runner that takes a JSON question bank and drills you on it using the
Leitner system: questions you miss come back sooner, questions you get right climb
out of the rotation. React 18 + Vite, plain JS, no TypeScript, no UI framework.

This is a rewrite of the Python CLI version in `QuizApp`, with three question types
instead of one.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static bundle in dist/
npm test         # unit tests for the parser
```

Nothing is served or stored anywhere. The file you drop is read in the browser with
`FileReader` and progress is kept in `localStorage`.

## Question file format

A JSON file, either a top-level array of questions or an object with a `questions` key:

```json
{
  "title": "Network security sampler",
  "questions": [
    {
      "question": "Which protocol is built for moving files between hosts?",
      "options": ["HTTP", "FTP", "SMTP", "IPX"],
      "answer": "b"
    },
    {
      "question": "Hashing is reversible if you know the algorithm.",
      "type": "boolean",
      "answer": false,
      "explanation": "A hash throws information away."
    },
    {
      "question": "Which of these are symmetric ciphers?",
      "type": "multi",
      "options": ["AES", "RSA", "ChaCha20", "ECDSA"],
      "answer": ["a", "c"]
    }
  ]
}
```

### Fields

| Field | Required | Notes |
| --- | --- | --- |
| `question` | yes | Also accepts `prompt`, `text`, or `q`. |
| `options` | yes, except for `boolean` | Also accepts `choices`. Boolean questions default to True/False. |
| `answer` | yes | Also accepts `correct`, `correctAnswer`, `correct_answer`, `answers`, `key`. |
| `type` | no | `single`, `boolean`, or `multi`. Inferred when absent. |
| `explanation` | no | Shown after the question is answered. Also accepts `rationale` or `note`. |

### What the parser tolerates

The three question banks I had lying around were all shaped slightly differently, so
the reader is deliberately forgiving:

- A top-level array works, so a Python `questions = [...]` list pastes in once the
  outer brackets are valid JSON.
- Labels baked into the option text get stripped: `"a) HTTP"`, `"A. HTTP"`, and
  `"1) HTTP"` all become `"HTTP"`. It only strips when two or more options match the
  pattern, so a lone option that happens to start that way survives intact.
- An answer can be a letter (`"b"`), the exact option text (`"FTP"`), a 0-based index
  (`1`), a 1-based index (`2`), a boolean, or several written as one string (`"a, c"`).
- Type is inferred: an array answer means multi, a bare `true`/`false` with no options
  means boolean, everything else is single choice.
- A question that can't be read is skipped with a named reason rather than silently
  dropped, and the rest of the file still loads. Invalid JSON reports the line and
  column instead of a byte offset.

## How the scheduling works

Every question starts in box 1. A right answer moves it up one box, a wrong answer
sends it back down (floor of box 1). A question retires once it reaches the last box,
so the default of three boxes means two correct answers in a row. The next question
is drawn at random from the lowest occupied box, avoiding an immediate repeat when
there's another card at that level.

Two changes from the Python version:

- `get_question_to_ask` sorted the pool by box and then called `random.choice` on the
  whole sorted list, so the sort had no effect and every unmastered question was
  equally likely. `pickNext` draws from the lowest box only.
- The old loop recomputed `progress` at the bottom without using it. Gone.

## Layout

```
src/
  main.jsx                 mount point
  App.jsx                  screen state, answer checking, keyboard handling
  styles.css               all of the CSS, themed with custom properties
  lib/
    parseQuiz.js           JSON -> normalized question bank (pure, tested)
    leitner.js             box math and question selection (pure, tested)
    storage.js             localStorage session, safe when storage is off
  components/
    Loader.jsx             drop zone, paste box, format reference
    BoxTrack.jsx           the row of boxes across the top
    QuestionCard.jsx       question, options, and the verdict
    Settings.jsx           mastery target, shuffle, instant check
    Summary.jsx            end-of-session stats and what you missed
    Masthead.jsx
  data/
    sample.js              the demo deck
```

`lib/` has no React in it, which is why the tests are plain `node --test`.

## Keyboard

`1`–`9` or `a`–`j` picks an option, `enter` checks a multi-select answer or advances
to the next question, `esc` ends the session and shows the summary.

## Notes

- Dark mode follows the OS setting via `prefers-color-scheme`; the tokens are also
  wired to a `data-theme` attribute on `<html>` if you want a manual toggle.
- `prefers-reduced-motion` disables the transitions.
- There's a single-file build (`cardbox-standalone.html`) that runs React from a CDN
  with in-browser Babel. Handy for opening straight off disk, not what you'd ship.
