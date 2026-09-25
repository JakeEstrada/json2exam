# Json2Exam

**Live site:** [Json2Exam.com](https://Json2Exam.com)

A personal CS study classroom that is becoming a **fullstack** product: courses, Leitner quizzes, lessons, in-browser code practice, PDF books, owner sign-in, and private progress — with a public recruiter view only when you choose to publish it.

Anyone may study. AskGPT is open when `OPENAI_API_KEY` is set. Progress stays behind owner sign-in. Visitors do not see rings, completion greens, or how far you are.

---

## Product direction

| Layer | Today | Next (fullstack) |
| --- | --- | --- |
| **Frontend** | React 18 + Vite SPA (plain JS) | Same study UI; clearer private vs public surfaces |
| **API** | `/api/login`, `/api/progress`, `/api/ask`, `/api/speak` | Same routes (or equivalents) with durable storage |
| **Auth** | Single owner account (`OWNER_USERNAME` / `OWNER_PASSWORD`) | Keep owner-private by default |
| **Progress** | Saved when signed in; file-backed on the server | Durable store so progress syncs across PCs |
| **Recruiters** | No progress visible | Explicit publish/share later — not automatic |

**Multi-device:** Browser `localStorage` alone is per machine. Cross-PC progress needs the progress API **plus** durable storage (for example Vercel Blob, KV, or a small database). Local `npm run dev` can write `data/jake-progress.json`; typical serverless deploys need something that survives across instances.

---

## Stack

- **App:** React 18, Vite, plain JavaScript (TypeScript is a course in the catalog, not the app language)
- **API:** Node handlers under `api/` (wired in Vite for local, serverless-style on deploy)
- **Study content:** `applied-classroom/` (notes, `quiz.json`, PDFs)
- **Tests:** `node --test` on `lib/` and data helpers

---

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
| `OWNER_USERNAME` / `OWNER_PASSWORD` | Sign-in for private progress tracking. |
| `VITE_LECTURE_VIDEO_BASE` | Public base URL for CPSC 544 lecture videos (Cloudflare R2). Files are `{base}/Ch1/….mp4`. |

Without an API key, AskGPT is unavailable (older canned Chapter 1 replies still exist for that deck). Without owner credentials, visitors can study and use AskGPT, but cannot save progress.

---

## What you study

Home groups courses as Software engineering, Languages, Algorithms, Systems, Quality, and Platform (last).

**Ready language ramps** (lesson, then quiz, colorful code on every multiple-choice card, three in-browser practice functions):

- **TypeScript** — types, unions, functions, arrays/tuples, object types, interfaces, generics
- **JavaScript** — variables, conditionals, loops, functions, arrays, objects, maps and sets
- **Python** — variables, conditionals, loops, functions, lists, dicts and sets, comprehensions
- **HTML** — document structure, text and lists, links and images, semantics, forms, tables, accessibility
- **CSS** — selectors and cascade, box model, type and color, flexbox, grid, positioning, responsive

Code cards run in the browser via a JavaScript `Function` runner. TypeScript types are erased. HTML, CSS, and Python practice cards are JS functions that **return markup, CSS, or Python source strings**.

**LeetCode topic drills (ready):** arrays, strings/hash, linked lists, trees, graphs, dynamic programming — pattern recognition + Python sketches; reference opens leetcode.com.

**Also in the catalog:** data structures, algorithms, **Electronics** (PCB Chapter 1 + SpaceX sourcing interview prep), database, API, testing, debugging, system design, and Platform Build (mostly planned folders). Graduate leftovers (Requirements Engineering, process / agile) sit at the bottom.

Ordered path, books, and which decks are ready vs planned: [`applied-classroom/STUDY_PLAN.md`](applied-classroom/STUDY_PLAN.md). Source book lists live under each course’s `sources.md` / `sources/`.

---

## How a deck works

1. Open a course, then a Language (or Module) deck.
2. Read the lesson (and cheat sheet lookup on JS/TS/Python). Use the speaker for read-aloud where available.
3. Start the quiz. Basics (Leitner level 1) come first; traps and code cards later. LeetCode decks shuffle (`deal: random`).
4. Right answers climb boxes; wrong answers drop. Cards retire at the mastery box.
5. **Show in book** jumps to the cited PDF page (file position, not printed folio). LeetCode cards link out to the problem page instead.

You can still upload or paste a standalone JSON quiz from the home page.

---

## Owner progress (private)

1. Sign in from the masthead with the owner account.
2. Progress posts to `/api/progress` (Bearer token from login).
3. Signed-in owner sees progress rings and deck completion.
4. Guests see the same courses **without** personal progress UI.

Progress stays private until a future publish/share feature exists. Do not treat the live site as a recruiter dashboard yet.

---

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
| `code` / `passage` | no | Snippet or problem text on the card (highlighted for JS/TS/HTML/CSS/Python). |
| `solution` / `solutionLanguage` | no | Shown after a correct answer (e.g. Python sketch on LeetCode cards). |
| `reference` | no | `{ section, book, page, excerpt }` or `{ url }` for external problem links. |
| `deal` | no | Deck-level; `random` shuffles (LeetCode). Default is box-ordered. |
| `reading` | no | Deck-level chapter map for **Show in book**. |
| `starter` / `tests` / `solution` | code cards | Runner calls your function with `args` and compares `expected`. |

The parser is forgiving: strips `a)` / `A.` option labels when several match, accepts several answer shapes, and skips broken questions with a named reason instead of killing the whole file.

---

## Scheduling (Leitner)

Every card starts in box 1. Correct → up one box. Wrong → down (floor 1). Retires at the last box (default three boxes = two correct in a row for new cards). The next card is drawn from the lowest occupied box (unless the deck sets `deal: random`).

Language decks prefer basics first when everything is still level 1. Older graduate decks keep a random draw among level-1 cards.

---

## Repo layout

```
src/
  App.jsx                 screens, deal/check, resume after login
  styles.css
  components/             Lesson, Course, QuestionCard, Loader, Login, …
  lib/                    parseQuiz, leitner, runCode, highlight, speech, learningLog, …
  data/                   catalog, appliedClassroom, 541/544 wiring
api/                      ask, speak, login, progress (owner-gated where needed)
applied-classroom/        courses, language decks, LeetCode topics, studio stubs, PDFs, STUDY_PLAN.md
541-Mod1/  544-Mod-1/     graduate leftover modules
data/                     local progress file (dev); not a public recruiter feed
```

`lib/` has no React; tests are plain `node --test`.

---

## Fullstack roadmap (this repo)

1. **Keep studying** — content and Leitner UX stay the product core.
2. **Durable private progress** — replace ephemeral file writes on deploy with Blob/KV/DB so login works the same on every PC.
3. **Owner-only dashboard** — richer personal stats still hidden from guests.
4. **Optional public profile** — when ready, flip a publish switch for recruiters; default remains private.
5. **Hardening** — session secrets, rate limits, and clear env docs as the backend grows.

---

## Keyboard

`esc` saves and exits the deck (or closes Settings / the side pane first). `1`–`9` or `a`–`j` picks an option. `enter` checks multi-select or advances.

---

## Notes

- Dark / Light follows the OS; toggle in the masthead (stored in `localStorage`).
- `prefers-reduced-motion` disables transitions.
- `cardbox-standalone.html` is an older single-file CDN build for opening off disk, not the main app.
- Lecture video URLs for 544 point at a public R2 host by default. Override with `VITE_LECTURE_VIDEO_BASE` if you host them yourself.
- Product brief for generating quiz JSON: [`applied-classroom/JSON2EXAM.md`](applied-classroom/JSON2EXAM.md).
