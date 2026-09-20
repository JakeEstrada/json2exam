# Json2Exam

**Live site:** [Json2Exam.com](https://Json2Exam.com)

A personal CS study classroom in the browser. Leitner quizzes, short lessons, in-browser code practice, and local PDF books, organized as courses.

It started as a master’s study tool: paste a chapter into a model, get a JSON quiz, drill the misses. That path did not last. The site stayed, and it now aims at closing CS knowledge gaps. Anyone may study. Only the signed-in owner’s progress is tracked.

React 18 + Vite, plain JavaScript. No TypeScript in the app itself (TypeScript is a course you take here).

## Running it

```bash
npm install
cp .env.example .env   # OPENAI_API_KEY, OWNER_PASSWORD, optional voice / video base
npm run dev            # http://localhost:5173
npm run build          # static bundle in dist/
npm test               # node --test
```

### Environment

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Server-side AskGPT (`/api/ask`) and text-to-speech (`/api/speak`). Never sent to the browser. |
| `OPENAI_MODEL` / `OPENAI_TTS_*` | Optional model and voice defaults. |
| `OWNER_USERNAME` / `OWNER_PASSWORD` | Sign-in for progress tracking and AskGPT. |
| `VITE_LECTURE_VIDEO_BASE` | Public base URL for CPSC 544 lecture videos (Cloudflare R2). Files are `{base}/Ch1/….mp4`. |

Without an API key, AskGPT is unavailable (older canned Chapter 1 replies still exist for that deck). Without owner credentials, visitors can study but cannot save progress or call AskGPT.

## What you study

Home groups courses as Software engineering, Languages, Algorithms, Systems, Quality, and Platform (last).

**Ready language ramps** (lesson, then quiz, colorful code on every multiple-choice card, three in-browser practice functions):

- **TypeScript** — types, unions, functions, arrays/tuples, object types, interfaces, generics
- **JavaScript** — variables, conditionals, loops, functions, arrays, objects, maps and sets
- **HTML** — document structure, text and lists, links and images, semantics, forms, tables, accessibility
- **CSS** — selectors and cascade, box model, type and color, flexbox, grid, positioning, responsive

Code cards run in the browser via a JavaScript `Function` runner. TypeScript types are erased. HTML and CSS practice cards are JS functions that **return markup or CSS strings**.

**Also in the catalog:** data structures, algorithms, LeetCode-style practice, database, API, testing, debugging, system design, and Platform Build (mostly planned folders). Graduate leftovers (Requirements Engineering, process / agile) sit at the bottom.

Ordered path, books, and which decks are ready vs planned: [`applied-classroom/STUDY_PLAN.md`](applied-classroom/STUDY_PLAN.md). Source book lists live under each course’s `sources.md` / `sources/`.

## How a deck works

1. Open a course, then a Language (or Module) deck.
2. Read the lesson (and cheat sheet lookup on JS/TS). Use the speaker for read-aloud where available.
3. Start the quiz. Basics (Leitner level 1) come first; traps and code cards later.
4. Right answers climb boxes; wrong answers drop. Cards retire at the mastery box.
5. **Show in book** jumps to the cited PDF page (file position, not printed folio).

You can still upload or paste a standalone JSON quiz from the home page.

## Question file format

JSON: a top-level array, or an object with a `questions` key.

```json
{
  "title": "Sample deck",
  "questions": [
    {
      "question": "What does const prevent?",
      "type": "multiple",
      "level": 1,
      "options": [
        "Mutating object properties.",
        "Reassigning the binding.",
        "Using the name in another file.",
        "Calling methods on the value."
      ],
      "answer": "b",
      "explanation": "const blocks reassignment. The object it grasps may still mutate.",
      "code": "const n = 1;\n// n = 2;  // TypeError"
    },
    {
      "question": "Write add(a, b) that returns the sum.",
      "type": "code",
      "language": "javascript",
      "starter": "function add(a, b) {\n  // return a number\n}\n",
      "tests": [
        { "label": "ints", "args": [2, 3], "expected": 5 }
      ],
      "solution": "function add(a, b) {\n  return a + b;\n}\n"
    }
  ]
}
```

### Fields

| Field | Required | Notes |
| --- | --- | --- |
| `question` | yes | Also `prompt`, `text`, or `q`. |
| `options` | yes, except `boolean` / `code` | Also `choices`. |
| `answer` | yes for choice types | Letter, text, index, boolean, or multi (`"a, c"` / array). |
| `type` | no | `single` / `multiple`, `multi`, `boolean`, `code`. Inferred when absent. |
| `level` | no | Leitner starting box (language decks use 1–3). |
| `code` | no | Snippet shown on the card (highlighted for JS/TS/HTML/CSS). |
| `reference` | no | `{ section, book, page, excerpt }` for notes + PDF jump. |
| `reading` | no | Deck-level chapter map for **Show in book**. |
| `starter` / `tests` / `solution` | code cards | Runner calls your function with `args` and compares `expected`. |

The parser is forgiving: strips `a)` / `A.` option labels when several match, accepts several answer shapes, and skips broken questions with a named reason instead of killing the whole file.

## Scheduling (Leitner)

Every card starts in box 1. Correct → up one box. Wrong → down (floor 1). Retires at the last box (default three boxes = two correct in a row for new cards). The next card is drawn from the lowest occupied box.

Language decks prefer basics first when everything is still level 1. Older graduate decks keep a random draw among level-1 cards.

## Owner progress

Sign in (masthead) to save progress to the server (`/api/progress`) and to use AskGPT. Visitors see the same courses without rings, completion greens, or a public log of how far the owner is.

## Layout

```
src/
  App.jsx                 screens, deal/check, resume after login
  styles.css
  components/             Lesson, Course, QuestionCard, Loader, …
  lib/                    parseQuiz, leitner, runCode, highlight, speech, …
  data/                   catalog, appliedClassroom, 541/544 wiring
api/                      ask, speak, login, progress (owner-gated where needed)
applied-classroom/        courses, language decks, studio stubs, PDFs, STUDY_PLAN.md
541-Mod1/  544-Mod-1/     graduate leftover modules
```

`lib/` has no React; tests are plain `node --test`.

## Keyboard

`1`–`9` or `a`–`j` picks an option. `enter` checks multi-select or advances. `esc` ends the session.

## Notes

- Dark / Light follows the OS; toggle in the masthead (stored in `localStorage`).
- `prefers-reduced-motion` disables transitions.
- `cardbox-standalone.html` is an older single-file CDN build for opening off disk, not the main app.
- Lecture video URLs for 544 point at a public R2 host by default. Override with `VITE_LECTURE_VIDEO_BASE` if you host them yourself.
