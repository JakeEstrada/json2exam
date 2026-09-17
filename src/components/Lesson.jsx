import { useMemo, useState } from 'react';
import { lookupCheatsheet } from '../lib/cheatsheet.js';
import { formatAskNotes } from '../lib/reading.js';
import { readingSpeechParts } from '../lib/speech.js';
import { MarkdownView } from './FileWindow.jsx';
import AskGPT from './AskGPT.jsx';
import SpeechTools, { useSpeechReader } from './SpeechTools.jsx';

export const JS_SHAPE = [
  '# What JavaScript is',
  '',
  'JavaScript is a **scripting language**. The engine (the browser, or Node) reads the `.js` file and runs it. You do not compile and link the way you do in C++.',
  '',
  'There is **no preprocessor**. No `#include`, no `#define`, no `using`. Built-in things like `Array` and `Math` are already there. To load *your* other file you write a module import, which is part of the language, not a C preprocessor:',
  '',
  '```js',
  'import { add } from "./math.js";',
  '```',
  '',
  'The **shape is C-like, not Python**. Blocks are `{ }`. Indentation is for humans. A counting loop looks like C or C#:',
  '',
  '```js',
  'for (let i = 0; i < n; i++) {',
  '  console.log(i);',
  '}',
  '```',
  '',
  'not `for i in range(n):` with indentation as syntax.',
  '',
  'Types live on **values**, not on the name. `let x = 1` then `x = "hi"` is legal. That is the whole language. TypeScript (the other cheat sheet) adds types that get erased before the code runs.',
  '',
  'This lesson is the basics for this topic. The quiz after it starts with those basics, then practice, then the sharp edges.',
].join('\n');

export const TS_SHAPE = [
  '# What TypeScript is',
  '',
  'TypeScript is **JavaScript plus a type checker**. You write `.ts`. `tsc` (or a bundler) checks the types and emits `.js`. The browser or Node runs that JavaScript. **Types are erased.** They do not exist at runtime.',
  '',
  'It is **not a C preprocessor**. There is no `#include` / `#define`. Annotations like `: number` are TypeScript syntax. After compile they are gone. Imports are still JavaScript modules:',
  '',
  '```ts',
  'import { add } from "./math.js";',
  '',
  'function scale(n: number): number {',
  '  return add(n, n);',
  '}',
  '```',
  '',
  'The **shape is still C-like JavaScript**: braces, `for (let i = 0; i < n; i++)`. You put types on names (`let x: number = 1`). Then `x = "hi"` is a compile error. Coming from C++, three surprises matter:',
  '',
  '- Types are erased. No runtime `typeof(T)`. No reified generics.',
  '- Typing is **structural**. Shape matches. You do not need `implements` for an object to fit an interface.',
  '- `tsc` can still emit JavaScript even when there are type errors, unless you turn on `noEmitOnError`.',
  '',
  'This lesson is the basics for this topic. The quiz after it starts with those basics, then practice, then the sharp edges.',
].join('\n');

export const HTML_SHAPE = [
  '# What HTML is',
  '',
  'HTML is a **markup language**. You wrap content in tags so the browser knows what is a heading, a paragraph, a link, or an image. It is not a programming language. There is no `for` loop, no `#include`, and no compile step.',
  '',
  'A page is a tree of **elements**. An element is an opening tag, optional content, and a closing tag — unless it is empty (`<img>`, `<input>`). Attributes live on the opening tag.',
  '',
  '```html',
  '<html>',
  '  <head>',
  '    <title>Home</title>',
  '  </head>',
  '  <body>',
  '    <h1>Hello</h1>',
  '    <p>Anything in the body shows in the window.</p>',
  '  </body>',
  '</html>',
  '```',
  '',
  'CSS is a separate language that paints those elements. This lesson is the basics for this topic. The quiz after it starts with those basics, then practice, then the sharp edges.',
].join('\n');

export const CSS_SHAPE = [
  '# What CSS is',
  '',
  'CSS is a **stylesheet language**. You write rules that say which HTML elements get which presentation. It is not JavaScript. Selectors are not functions. There is no `#include`.',
  '',
  'A rule has a **selector** and a **declaration block**. Each declaration is a property and a value, separated by a colon:',
  '',
  '```css',
  'p {',
  '  font-family: Arial;',
  '  color: navy;',
  '}',
  '```',
  '',
  'The **cascade** picks one value when several rules target the same property. Layout is boxes: content, padding, border, margin. This lesson is the basics for this topic. The quiz after it starts with those basics, then practice, then the sharp edges.',
].join('\n');

function lessonShape(quiz) {
  if (quiz && quiz.tsIntro) return TS_SHAPE;
  if (quiz && quiz.htmlIntro) return HTML_SHAPE;
  if (quiz && quiz.cssIntro) return CSS_SHAPE;
  return JS_SHAPE;
}

function hasShape(quiz) {
  return !!(quiz && (quiz.jsIntro || quiz.tsIntro || quiz.htmlIntro || quiz.cssIntro));
}

export function CheatsheetLookup({ source, topic, heading }) {
  const starter = String(topic || '').trim();
  const [draft, setDraft] = useState(starter);
  const [query, setQuery] = useState(starter);
  const hit = source ? lookupCheatsheet(source, query) : null;

  function go(event) {
    if (event) event.preventDefault();
    setQuery(String(draft || '').trim());
  }

  if (!source) return null;

  return (
    <section className="cheatsheet-box">
      <h2>{heading || 'Cheat sheet'}</h2>
      <p className="why">Same file as <code>jsjs</code> / <code>tsts</code>. Look up a section name.</p>
      <form className="cheatsheet-search" onSubmit={go}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="CONTROL FLOW, VARIABLES AND TYPES, ARRAY…"
          aria-label="Cheat sheet section"
        />
        <button type="submit" className="btn quiet">Look up</button>
      </form>
      {query && !hit && <p className="pdf-page-status">No section matching “{query}”.</p>}
      {hit && <MarkdownView source={hit.markdown} />}
    </section>
  );
}

export function lessonAskNotes(quiz) {
  const parts = [];
  if (quiz && quiz.jsIntro) parts.push(JS_SHAPE);
  if (quiz && quiz.tsIntro) parts.push(TS_SHAPE);
  if (quiz && quiz.htmlIntro) parts.push(HTML_SHAPE);
  if (quiz && quiz.cssIntro) parts.push(CSS_SHAPE);
  const rest = formatAskNotes(quiz);
  if (rest) parts.push(rest);
  return parts.join('\n\n');
}

export default function Lesson({ quiz, onStart, onHome, owner, voice, speechRate }) {
  const sheet = quiz && quiz.cheatsheet;
  const topic = Array.isArray(quiz && quiz.sheet) ? quiz.sheet[0] : (quiz && quiz.sheet);
  const showShape = hasShape(quiz);
  const shape = lessonShape(quiz);
  const shapeParts = useMemo(() => readingSpeechParts(showShape ? shape : ''), [showShape, shape]);
  const notes = (quiz && quiz.notes) || '';
  const notesParts = useMemo(() => readingSpeechParts(notes), [notes]);
  const parts = useMemo(() => shapeParts.concat(notesParts), [shapeParts, notesParts]);
  const speech = useSpeechReader(parts, voice, speechRate, { keys: true });
  const spokenIndex = speech.spoken ? speech.at : -1;

  return (
    <div className="lesson-wrap">
      <div className="bar">
        <h2>{(quiz && quiz.title) || 'Lesson'}</h2>
        <div className="row">
          <SpeechTools
            parts={parts}
            on={speech.on}
            wait={speech.wait}
            onToggle={() => (speech.on ? speech.stop() : speech.playFrom(speech.at))}
            onStep={speech.step}
          />
          <button type="button" className="btn quiet" onClick={onHome}>Home</button>
          <button type="button" className="btn primary" onClick={onStart}>Start the quiz</button>
        </div>
      </div>

      <p className="lesson-lead">Read this first, or tap the speaker. The quiz after it is the same material, starting with the basics.</p>

      <div className="lesson-page">
        {showShape && (
          <div className="lesson-notes">
            <MarkdownView source={shape} spokenIndex={spokenIndex} speechFrom={0} />
          </div>
        )}
        {quiz && quiz.notes && (
          <div className="lesson-notes">
            <MarkdownView source={quiz.notes} spokenIndex={spokenIndex} speechFrom={shapeParts.length} />
          </div>
        )}
        <CheatsheetLookup source={sheet} topic={topic} />
        <div className="row" style={{ marginTop: '18px' }}>
          <button type="button" className="btn primary" onClick={onStart}>Start the quiz</button>
        </div>
      </div>

      <AskGPT
        allowed={!!(owner && owner.token)}
        token={owner && owner.token}
        phase="lesson"
        card={null}
        picked={[]}
        notes={lessonAskNotes(quiz)}
        hello="Ask about this reading. I can unpack a sentence, compare it to C++, or point you at the chapter."
      />
    </div>
  );
}
