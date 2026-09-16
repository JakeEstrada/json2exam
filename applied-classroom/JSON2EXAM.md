# Json2Exam — what this app is, and what to add

Paste this file into ChatGPT when asking for quiz JSON, code-exercise specs, or a code review of the repo. It is the product brief, not a tutorial.

Repo: Vite + React 18 SPA (`cardbox`). Home page title: Json2Exam. Personal CS study tool. Leitner boxes. OpenAI TTS and AskGPT. No login, no database, no code runner.

---

## What it does today

### 1. Load a JSON exam

Three ways in:

- Drag/drop or file picker on the home page (`Upload JSON`).
- Built-in courses from `src/data/catalog.js`.
- Applied Classroom topics under `applied-classroom/**/quiz.json` (empty until you paste questions).

`src/lib/parseQuiz.js` normalizes messy LLM JSON into a bank. It accepts:

- Top-level array of questions, or `{ title, questions }` (also `items` / `cards` / `quiz` / `deck`).
- Question text as `question`, `prompt`, `text`, or `q`.
- Choices as `options` array or `choices` object `{ A, B, C, D }`.
- Answer as letter (`"b"`), option text, 0-based index, 1-based index, boolean, or array for multi.
- Types: `single` / `multiple` / `multiple_choice`, `multi` / `select_all`, `boolean` / `true_false`. Inferred if omitted.
- Optional `explanation`.
- Optional `reference` object (see below).
- Optional `brain` / `brainId` to attach a canned AskGPT personality.

Rules the generator must follow:

- At least two options. Prefer **exactly four** for multiple choice (tests enforce ≤ 4).
- Spread correct letters across a, b, c, d. Do not make the right answer the longest option.
- Empty `questions: []` is a stub. Start stays disabled until there is at least one valid question.
- Broken questions are skipped; the rest of the file still loads.

### 2. JSON question shape (copy this)

```json
{
  "title": "JavaScript — Variables and data types",
  "questions": [
    {
      "question": "Which keyword declares a block-scoped variable?",
      "type": "multiple",
      "options": [
        "var, which is function-scoped and older.",
        "let, which is block-scoped.",
        "function, which declares a function.",
        "with, which opens an object scope."
      ],
      "answer": "b",
      "explanation": "let and const are block-scoped. var is function-scoped.",
      "reference": {
        "section": "Bindings",
        "book": "Eloquent JavaScript, 4th Edition by Marijn Haverbeke",
        "page": 14,
        "excerpt": "let and const bindings are block-scoped.",
        "lecture": "",
        "slide": 0
      }
    },
    {
      "question": "A const binding can be reassigned.",
      "type": "boolean",
      "answer": false,
      "explanation": "const cannot be reassigned. The object it points at may still be mutated."
    },
    {
      "question": "Which of these are primitive types in JavaScript? Select all that apply.",
      "type": "multi",
      "options": [
        "string",
        "object",
        "boolean",
        "array"
      ],
      "answer": ["a", "c"]
    }
  ]
}
```

`reference` fields the UI already understands:

| Field | Use |
|---|---|
| `section` | Heading in `notes.md` |
| `book` | Book title (copy from `applied-classroom/SOURCES.md`) |
| `page` | PDF page in the chapter book (541/544) |
| `excerpt` | Quote to highlight on the book page |
| `lecture` | Quote to highlight in the lecture transcript |
| `slide` | Slide number in the slides PDF |

541 and 544 decks also ship lecture `.txt` + audio/video, book PDF, slides PDF. Applied Classroom topics only have `quiz.json` + `notes.md` + source books in `sources/`. Book PDFs in `sources/` are **not wired into the player yet**. Cite them in `reference.book` / `page` / `excerpt` so they can be attached later.

### 3. Study session (Leitner)

`src/lib/leitner.js`: every card starts in box 1. Correct moves it up one box. Wrong sends it back to 1. Session ends when every card reaches `maxBox` (settings, default 3). Next card is a random card from the lowest unfinished box.

Settings dialog: box count, shuffle choices, instant feedback, OpenAI voice combo, readback speed.

Card UI: pick option(s) → Check. Speaker reads **title then each answer** (not the whole stem as one blob). Arrow keys skip those spoken parts. After check: explanation, source links (notes / book / slides / lecture). AskGPT fab.

Progress is `localStorage` only. Resume bar on the home page. Theme toggle.

### 4. AskGPT and TTS

- `POST /api/ask` — model chat about the current card. Prompt hides the key until after Check. Optional canned “brains” for 541 Ch1 and 544.
- `POST /api/speak` — OpenAI `gpt-4o-mini-tts` (voice/model from `.env`). Prefetch + cache. Falls back to browser speech.

Needs `OPENAI_API_KEY` in `.env`.

### 5. Courses on the home page

Grouped: Platform, Languages, Algorithms, Systems, Quality, Software engineering.

Filled (real JSON + lectures):

- Requirements Engineering (`541-Mod1/`) — 5 chapter decks.
- Advanced Software Process (`544-Mod-1/`) — 5 chapters + Agile/XP + Scrum.

Stubbed (folders + empty `quiz.json`): JavaScript, HTML, CSS, TypeScript, Data Structures, Algorithms, LeetCode-Style Practice, Database, API, System Design, Testing, Debugging, Platform Build.

Each stub topic: `quiz.json`, `notes.md`, often `README.md`. Paste questions into `quiz.json`, refresh. Path is shown on the card.

Source books: `applied-classroom/<course>/sources/` and copyable titles in `sources.md`. Index: `applied-classroom/SOURCES.md`.

### 6. How to generate more JSON exams

Home page link “how to get quick json files” (`src/data/aiFileGuide.md`):

1. Give the model a chapter (or notes) plus the JSON shape above.
2. Demand even letter distribution.
3. Demand similar option lengths so the key is not the longest line.
4. Put the output in that topic’s `quiz.json`.

Do **not** invent a new file format. Do **not** add a code-exercise schema unless this brief’s “improvements” section is the task.

---

## What it does not do (gaps)

These folders exist as *future* platform features. The runner cannot do them yet:

- Run or grade student code
- Live HTML/CSS playground
- Hidden test cases, complexity checks, submission history
- Accounts, streaks, leaderboards, discussion
- PostgreSQL, auth, Docker, CI
- SQL execution against a sample database
- HTTP client / webhook sandbox
- Tree/graph/algorithm visualization
- Code review UI

Today the only assessment type is **multiple choice / true-false / multi-select JSON**.

---

## Improvements to make (tell ChatGPT which slice)

Work in this order unless asked otherwise. Each slice should stay compatible with existing `quiz.json` files.

### A. Use the source books in quizzes (smallest next step)

- Generate `quiz.json` from one book chapter at a time.
- Set `reference.book` to the exact title from `SOURCES.md`.
- Set `reference.page` and `reference.excerpt` from that PDF.
- Put study notes in that topic’s `notes.md`, with headings that match `reference.section`.
- Later: glob `sources/*.pdf` onto the course (like 541 `bookUrl`) so Open book jumps to `reference.page` and highlights `excerpt`.

Do not dump a whole book into one deck. One chapter → one `quiz.json` or one topic folder.

### B. Code exercises (new JSON type, still a file)

Add a question type the runner can load without a full IDE at first:

```json
{
  "question": "Return the sum of two numbers.",
  "type": "code",
  "language": "javascript",
  "starter": "function add(a, b) {\n  // ...\n}\n",
  "tests": [
    { "input": [1, 2], "output": 3 },
    { "input": [0, 0], "output": 0 }
  ],
  "solution": "function add(a, b) { return a + b; }",
  "hints": ["Use return.", "Do not concatenate strings."],
  "explanation": "Addition is the + operator on numbers.",
  "reference": {
    "section": "Functions",
    "book": "Eloquent JavaScript, 4th Edition by Marijn Haverbeke",
    "page": 40,
    "excerpt": "A function definition is a regular binding where the value of the binding is a function."
  }
}
```

Phased build:

1. **Read-only**: show prompt, starter, tests, hints. Learner thinks, then reveals solution. Still Leitner (pass/fail is self-report or “I got it / I missed it”).
2. **In-browser run**: textarea + `Function` / iframe sandbox for JS only. Compare return values to `tests`. Correct → box up.
3. **Hidden tests**: `tests` vs `hiddenTests`. Same as LeetCode folders already named in the catalog.
4. Later languages: TypeScript (transpile), HTML/CSS (iframe visual diff), SQL (sql.js), HTTP (mock fetch).

Keep `type: "multiple" | "boolean" | "multi"` working. `normalizeQuestion` should skip unknown types with a clear skip error until code is implemented, or accept `type: "code"` as a new branch.

Catalog folders this unlocks: JavaScript Interactive exercises, HTML/CSS studio, TypeScript studio, Algorithms “submit against hidden tests”, LeetCode problem format, Database “write SQL”, API “send HTTP requests”, Testing “write unit tests”, Debugging “correct the code”.

### C. Code review (human + model, not a linter-only page)

Two uses:

1. **Review this repo** (Json2Exam). Ask for: React structure, Vite API routes (`api/ask.js`, `api/speak.js`), Leitner correctness, parseQuiz edge cases, localStorage session, PDF highlight, TTS prefetch. Do not suggest a rewrite. Small diffs.
2. **Review a learner solution** as a product feature. After a `type: "code"` attempt, send `{ prompt, starter, tests, submission, solution }` to `/api/ask` with a rubric: correctness, tests, naming, complexity, one improvement. Store nothing on a server yet.

JSON for a review card (optional later type):

```json
{
  "question": "Review this function. What is the actual bug?",
  "type": "review",
  "language": "javascript",
  "code": "function includes(list, item) {\n  return list.indexOf(item);\n}\n",
  "options": [
    "indexOf is 1-based so misses index 0",
    "indexOf returns -1 on miss, which is truthy-wrong in a boolean context if you coerce badly; here it returns a number, not a boolean",
    "indexOf does not exist on arrays",
    "The parameter item is unused"
  ],
  "answer": "b",
  "explanation": "indexOf returns an index, not a boolean. 0 is found but falsy if someone writes if (list.indexOf(item))."
}
```

That last shape is still multiple choice — ship it **now** inside existing `quiz.json` while the real editor does not exist. Debugging and “find the bug” folders can fill this way immediately.

### D. Playgrounds (after B.2)

| Course | Minimum playground |
|---|---|
| JavaScript | CodeMirror + run tests |
| HTML | contenteditable / srcdoc iframe |
| CSS | two-pane: CSS editor + target screenshot or reference DOM |
| TypeScript | transpile then same as JS |
| Database | canned SQLite + `CREATE`/`SELECT` |
| API | scripted `fetch` against a mock router |
| Algorithms / LeetCode | same as JS + runtime timer |
| System design | still JSON tradeoff questions; no infra |

### E. Platform stages (do not build all of this)

`applied-classroom/platform/` is the roadmap for Json2Exam itself. Only pull a stage when the study loop needs it:

- Stage 1: already have courses/modules/lessons-as-folders + quizzes.
- Stage 2: code editor = improvement B.
- Stage 3: accounts — skip until localStorage is not enough.
- Stage 4: LeetCode library = B.3 + filters in UI.
- Stage 5: Leitner already is spaced repetition; add confidence rating later.
- Stage 6: community — last.
- Stage 7: Postgres, auth, Docker — when deploying for more than one browser.

### F. Quality bar for generated content

- Cite a real book in this repo. Do not hallucinate page numbers; if the PDF is not available, omit `page` and keep `book` + `section`.
- Four options, similar length, mixed keys.
- One idea per question. No “all of the above”.
- Explanations teach the rule, not “because b is correct”.
- For code: tests must actually fail on the starter and pass on the solution.

---

## Files ChatGPT should touch (when asked to implement)

| Path | Role |
|---|---|
| `applied-classroom/<course>/.../quiz.json` | Question bank |
| `applied-classroom/<course>/.../notes.md` | Notes pane |
| `applied-classroom/<course>/sources.md` | Copyable book titles |
| `applied-classroom/<course>/sources/` | PDFs |
| `applied-classroom/SOURCES.md` | Master title list |
| `src/lib/parseQuiz.js` | JSON schema |
| `src/lib/leitner.js` | Scheduling |
| `src/data/catalog.js` | Course wiring + 541/544 assets |
| `src/data/appliedClassroom.js` | Stub course tree |
| `src/components/QuestionCard.jsx` | Card UI |
| `src/components/Course.jsx` | Deck grid, Start vs paste-JSON |
| `api/ask.js` | AskGPT |
| `api/speak.js` | TTS |

Do not add a second quiz format. Extend this one.
