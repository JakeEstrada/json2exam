# Study plan

Ordered path through the existing Applied Classroom topics. No extra courses. Practical work sits inside each subject, not in a separate capstone.

**Status:** a module is *ready* when it has notes, a real `quiz.json`, and (for language decks) code cards whose tests run in the browser. Everything else is *planned*: folders exist, books are listed, quizzes are empty.

Book titles below match `SOURCES.md`. PDF page numbers in quizzes are **PDF file positions** (what Json2Exam opens), not printed folio numbers. Each JS language deck lists a `reading` map (chapter + section pages). **Show in book** opens that module’s chapter, not a random page of another topic.

---

## 0. How to use this plan

1. Read the lesson page (what TypeScript is, then this topic). Use the cheat sheet lookup the same way as `tsts`. JavaScript decks use `jsjs` the same way.
2. Start the quiz. Basics come first; traps and code cards come after.
3. Work the predict-the-output / find-the-bug drills in the notes.
4. Start the deck. Mixed multiple-choice and code cards use Leitner boxes. Code cards **run your JavaScript** against the card’s tests (TypeScript types are erased).
5. Open **Show in book** on a card to jump to that module’s chapter.

You already know CS and C++. Start with TypeScript if you want types on the C-like syntax first. Treat types as erased: the engine runs JavaScript.

---

## 1. TypeScript — ready language decks

**Books:** Effective TypeScript, 2nd Edition by Dan Vanderkam (local PDF). TypeScript Quickly and Programming TypeScript are in `typescript/sources/` as extra reading.

Start here. Types first, then the rest of the typed syntax. Each deck uses the same shape as the JavaScript language quizzes: a lesson, colorful code on every multiple-choice card, then three in-browser practice functions (JavaScript at runtime; types are erased).

| # | Topic folder | Objectives | Prerequisites | Reading | Practical exercise |
|---|---|---|---|---|---|
| 1 | `typescript/language/types-and-annotations` **ready** | Explain `.ts` → `.js` erasure, annotate primitives, prefer inference, avoid `String` / `any`. | None | ETS ch. 1 (PDF p. 27), Item 3 (p. 38), Item 7 (p. 59), Item 9 (p. 72) | `parseAmount`, `label`, `firstDefined`. |
| 2 | `typescript/language/unions-and-narrowing` **ready** | Write `A \| B`, narrow with `typeof` / `Array.isArray` / a `kind` tag. | Module 1 | ETS Item 7 (p. 59), Item 22 (p. 133) | `asList`, `area`, `describe`. |
| 3 | `typescript/language/functions` **ready** | Annotate parameters, optional/default/rest, type the whole function expression. | Modules 1–2 | ETS Item 12 (p. 83) | `add`, `greet`, `sumAll`. |
| 4 | `typescript/language/arrays-and-tuples` **ready** | Distinguish `T[]` from `[string, number]`; know indexing may be `undefined`. | Modules 1–3 | ETS indexed access (p. 37), Item 7 (p. 59) | `first`, `pair`, `sum`. |
| 5 | `typescript/language/object-types` **ready** | Shape types, optional/`readonly`, excess property checking vs structural typing. | Modules 1–4 | ETS Item 4 (p. 45), excess properties (p. 80) | `pickName`, `copyUser`, `merge`. |
| 6 | `typescript/language/interfaces` **ready** | `interface` vs `type`, `extends`, declaration merging. | Module 5 | ETS Item 13 (p. 86) | `makeUser`, `asAdmin`, `readField`. |
| 7 | `typescript/language/generics` **ready** | `<T>`, constraints, `keyof`. | Modules 3–6 | ETS ch. 6 / Item 50 (p. 241–242) | `identity`, `longest`, `getProp`. |

**Later TS topics (planned, same course):** `typescript/studio/*` (missing types, repair errors, convert JS, compile-time vs runtime).

---

## 2. JavaScript — ready language decks

**Books:** Eloquent JavaScript, 4th Edition by Marijn Haverbeke; JavaScript: The Definitive Guide, 7th Edition by David Flanagan; You Don't Know JS Yet by Kyle Simpson (local file is *Scope & Closures, 2nd Edition*); JavaScript: The Good Parts by Douglas Crockford.

| # | Topic folder | Objectives | Prerequisites | Reading | Practical exercise |
|---|---|---|---|---|---|
| 1 | `javascript/language/variables-and-data-types` **ready** | Declare `let`/`const`, name primitives vs objects, convert with `Number`/`String`/`Boolean` without surprise coercion. | None | EJS ch. 1 *Values, Types, and Operators* + *Bindings* in ch. 2; DG ch. 3 *Types, Values, and Variables* | Normalize mixed payment fields (`"40"`, `40`, `null`) into numbers and drop unusable rows. |
| 2 | `javascript/language/conditionals` **ready** | Use `===`, truthiness, `&&`/`\|\|`/`??`, `if`/`else`/`switch`. | Module 1 | EJS *Comparison*, *Boolean values*, *Control flow*, *Conditional execution*; DG ch. 4 operators | Gate a checkout: paid vs pending vs missing customer, including `0` as a real amount. |
| 2b | `javascript/language/loops` **ready** | `while` / `for` / `for...of`, `break`, and walking arrays. | Module 2 | EJS *while and do loops* (PDF p. 59), *for loops* (PDF p. 63), *Breaking Out of a Loop* (PDF p. 65) | `sumTo`, `firstEven`, `countPaid`. |
| 3 | `javascript/language/functions` **ready** | Write functions, explain scope vs C++ stack objects, and use closures for private state. | Modules 1–2 | EJS ch. 3 *Functions*, *Bindings and scopes*, *Closure*; YDKJS ch. 1 *What’s the Scope?*, ch. 7 *Using Closures* | Build `makeStatusMachine(initial)` that returns `{ get, set }` closed over private state. |
| 4 | `javascript/language/arrays` **ready** | Index, mutate vs copy, and use `map`/`filter`/`reduce`/`slice` without confusing them with `Map`. | Modules 1–3 | EJS ch. 4 arrays + *Further arrayology*; ch. 5 *Filtering arrays*, *map*, *reduce* | Filter paid customers, total amounts, and return a new array (do not mutate the source). |
| 5 | `javascript/language/objects` **ready** | Treat objects as references; copy shallow vs nested; update nested task fields without alias bugs. | Modules 1–4 | EJS ch. 4 *Objects*, *Mutability*; DG object mutability in ch. 3 | `updateTask(tasks, id, patch)` returns a new array; other tasks keep identity. |
| 6 | `javascript/language/maps-and-sets` **ready** | Choose array vs object vs `Map` vs `Set`; avoid `in` on objects used as dictionaries. | Modules 4–5 | EJS ch. 6 *Maps*; DG standard library Map/Set when you reach it | Group appointments by `providerId` with `Map`; unique patient ids with `Set`. |

**Later JS topics (planned, same course):** `array-methods` (more method practice), `closures` (extra closure drills), `recursion`, `classes`, `error-handling`, `asynchronous-javascript`, plus *Interactive exercises*.

---

## 3. HTML and CSS — planned

**Courses:** `html/`, `css/`. **Books:** HTML and CSS: Design and Build Websites by Jon Duckett; CSS in Depth (1st edition on disk); Inclusive Components by Heydon Pickering; Responsible JavaScript by Jeremy Wagner (slides/audio under `javascript/sources/`).

| Order | Topic | Objectives | Prerequisites | Reading | Practical exercise |
|---|---|---|---|---|---|
| 1 | `html/studio/construct-page-structures` | Landmark regions, headings, lists. | JS modules 1–2 | Duckett structure/text chapters | Rebuild a course landing page in semantic HTML. |
| 2 | `html/studio/choose-semantic-elements` | `article` vs `section` vs `div`. | Previous | Duckett extra markup | Replace a `div` soup card with the right elements. |
| 3 | `html/studio/build-accessible-forms` | Labels, names, errors. | Previous | Duckett forms; Inclusive Components forms | Appointment booking form with visible labels. |
| 4 | `html/studio/fix-accessibility-problems` | Contrast, names, keyboard. | Previous | Inclusive Components | Repair a broken nav. |
| 5 | `css/studio/practice-selectors-and-specificity` | Cascade, specificity. | HTML 1–2 | CSS in Depth cascade chapters | Restyle without `!important`. |
| 6 | `css/studio/practice-flexbox` / `practice-grid` | Layout. | CSS selectors | CSS in Depth layout | Recreate a four-card module grid. |
| 7 | `css/studio/fix-broken-responsive-designs` | Breakpoints. | Flex/grid | Duckett / CSS in Depth | Fix overflow at 375px. |
| 8 | `css/studio/match-a-provided-visual-target` | Pixel-close layout. | Previous | Same | Match a static target. |

---

## 4. TypeScript studio — planned

Follow existing `typescript/studio/*` after the language ramp: missing types → type errors → interfaces → unions → generics → unknown data → convert JS → compile-time vs runtime.

---

## 5. Data structures and algorithms — planned

**Courses:** `data-structures/`, `algorithms/`. **Books:** Grokking Algorithms, 2nd Edition by Aditya Y. Bhargava; A Common-Sense Guide to Data Structures and Algorithms, 2nd Edition by Jay Wengrow; Algorithms, 4th Edition by Robert Sedgewick and Kevin Wayne (Chapter 1 only on disk); Introduction to Algorithms, 4th Edition by Thomas Cormen, Charles Leiserson, Ronald Rivest, and Clifford Stein.

Path: visualize arrays/stacks/queues/lists → trees → BST → heaps → hashing → graphs → complexity (`data-structures/studio/*`), then sorting, binary search, recursion, sliding window, two pointers, traversals, brute vs optimized, runtime (`algorithms/studio/*`). Practical work: implement each structure from scratch and compare runtimes on small appointment datasets. Sedgewick is only Chapter 1 here; CLRS is the heavy reference—cite pages only after you verify them.

---

## 6. LeetCode-style problem solving — planned

**Course:** `leetcode/`. **Books:** Cracking the Coding Interview by Gayle Laakmann McDowell (4th edition on disk); Elements of Programming Interviews (sampler on disk); plus Grokking and the Common-Sense Guide.

Use `leetcode/problem-format/*` as the template for every problem (statement, examples, constraints, starter, tests, hints, complexity). Filters stay empty until there is a library. Practical work: one array/hash problem, one two-pointer, one tree, each with hidden tests once the runner supports them.

---

## 7. Databases and SQL — planned

**Course:** `database/`. **Books:** Learning SQL, 3rd Edition by Alan Beaulieu; SQL Antipatterns, Volume 1 by Bill Karwin (1st edition on disk).

Follow `database/studio/*`: queries → tables → relationships → joins → indexes → normalize → plans → repair → sample business DB → relational vs document. Practical work: schema for customers, payments, appointments; write the joins the JS grouping exercises faked in memory.

---

## 8. APIs and backend development — planned

**Course:** `api/`. **Books (titles only until PDFs land in `api/sources/`):** Node.js Design Patterns, 4th Edition by Mario Casciaro and Luciano Mammino; Web Development with Node and Express, 2nd Edition by Ethan Brown; API Design Patterns by JJ Geewax.

Follow `api/studio/*`: requests → headers → methods → status codes → bodies → auth → pagination → retries → webhooks → broken requests → REST design. Practical work: design REST for the appointment store from the JS/SQL modules. Do not invent page citations until the PDFs are local.

---

## 9. System design and scaling — planned

**Course:** `system-design/`. No dedicated design textbook in `sources/` yet. Use the API/DB books plus this app as the running example (`system-design/systems/quiz-platform`).

Path: small systems (URL shortener, quiz platform, timecard, …) then design choices (architecture, database, cache, queue, auth, scaling, failure, logging, security). Practical work: write a one-page design for Json2Exam (what is local now vs what would need Postgres later). Still JSON tradeoff questions until a diagram tool exists.

---

## 10. Testing and debugging — planned

**Courses:** `testing/`, `debugging/`. **Books:** Eloquent JavaScript ch. 8 *Bugs and Errors*; plus the JS/TS books above.

Testing studio: unit tests → failing tests → async → mocks → API tests → React tests → output → coverage → regression. Debugging: broken programs, then reproduce → cause → explain → fix → regression test. Practical work: tests for the JS payment/task helpers; a planted bug in `updateTask`.

---

## Platform (this app) — ongoing

`platform/` is Json2Exam itself. React books live in `platform/sources/`. Build features here only when a study loop needs them. Code practice phase 1 is done; in-browser execution is not.

---

## Suggested weekly rhythm

1. One *ready* JS module to mastery (Leitner finish).
2. One small function from that module copied into a scratch file in your editor (real Node/browser) so you still run code, even though the app does not.
3. After JS 1–6, start HTML or TypeScript; keep LeetCode light until arrays/objects/maps are fluent.
