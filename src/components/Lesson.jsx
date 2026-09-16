import { useState } from 'react';
import { lookupCheatsheet } from '../lib/cheatsheet.js';
import { MarkdownView } from './FileWindow.jsx';

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

export default function Lesson({ quiz, onStart, onHome }) {
  const sheet = quiz && quiz.cheatsheet;
  const topic = Array.isArray(quiz && quiz.sheet) ? quiz.sheet[0] : (quiz && quiz.sheet);
  const showShape = !!(quiz && quiz.jsIntro);

  return (
    <div className="shell shell-wide">
      <div className="bar">
        <h2>{(quiz && quiz.title) || 'Lesson'}</h2>
        <div className="row">
          <button type="button" className="btn quiet" onClick={onHome}>Home</button>
          <button type="button" className="btn primary" onClick={onStart}>Start the quiz</button>
        </div>
      </div>

      <p className="lesson-lead">Read this first. The quiz after it is the same material, starting with the basics.</p>

      <div className="lesson-page">
        {showShape && (
          <div className="lesson-notes">
            <MarkdownView source={JS_SHAPE} />
          </div>
        )}
        {quiz && quiz.notes && (
          <div className="lesson-notes">
            <MarkdownView source={quiz.notes} />
          </div>
        )}
        <CheatsheetLookup source={sheet} topic={topic} />
        <div className="row" style={{ marginTop: '18px' }}>
          <button type="button" className="btn primary" onClick={onStart}>Start the quiz</button>
        </div>
      </div>
    </div>
  );
}
