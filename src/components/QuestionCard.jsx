import { useMemo } from 'react';
import { sameSet, KIND_LABEL } from '../lib/leitner.js';
import { LETTERS } from '../lib/parseQuiz.js';
import { matchReading } from '../lib/reading.js';
import { formatTest, previewValue, runJavascript } from '../lib/runCode.js';
import { firstSlideRange, formatSlideRange } from '../lib/slides.js';
import { cardSpeechParts } from '../lib/speech.js';
import { MarkdownView, MdInline } from './FileWindow.jsx';
import CodeBlock from './CodeBlock.jsx';
import SpeechTools, { useSpeechReader } from './SpeechTools.jsx';
import { looksLikeCode } from '../lib/highlight.js';

export default function QuestionCard({ q, order, picked, phase, onToggle, onCheck, onAssess, onOpenReference, hasLecture, hasVideo, hasSlides, hasBook, voice, speechRate, codeWork, onCodeWork, bookReading }) {
  const reviewing = phase === 'review';
  const correct = reviewing && q.type !== 'code' && sameSet(picked, q.answers);
  const multi = q.type === 'multi';
  const parts = useMemo(() => cardSpeechParts(q, order), [q, order]);
  const speech = useSpeechReader(parts, voice, speechRate, { prefetchAll: true, keys: true });
  const reading = speech.spoken;
  const showHero = !!(q.code && q.code !== q.starter);

  if (q.type === 'code') {
    return (
      <div className="sheet qcard">
        <p className="kind">{KIND_LABEL[q.type] || 'code practice'}</p>
        <div className="q-head">
        <QuestionPrompt q={q} showHero={showHero} reading={reading && reading.kind === 'title'} />
          <SpeechTools
            parts={parts}
            on={speech.on}
            wait={speech.wait}
            onToggle={() => (speech.on ? speech.stop() : speech.playFrom(speech.at))}
            onStep={speech.step}
          />
        </div>
        <CodePractice
          q={q}
          reviewing={reviewing}
          work={codeWork}
          onWork={onCodeWork}
          onAssess={onAssess}
        />
        {reviewing && (
          <CodeVerdict gotIt={picked[0] === 1} explanation={q.explanation} run={codeWork && codeWork.run} />
        )}
        <QuestionSource q={q} bookReading={bookReading} onOpen={onOpenReference} hasLecture={hasLecture} hasVideo={hasVideo} hasSlides={hasSlides} hasBook={hasBook} />
      </div>
    );
  }

  return (
    <div className="sheet qcard">
      <p className="kind">{KIND_LABEL[q.type]}</p>
      <div className="q-head">
        <QuestionPrompt q={q} showHero={showHero} reading={reading && reading.kind === 'title'} />
        <SpeechTools
          parts={parts}
          on={speech.on}
          wait={speech.wait}
          onToggle={() => (speech.on ? speech.stop() : speech.playFrom(speech.at))}
          onStep={speech.step}
        />
      </div>

      <div className="opts" role={multi ? 'group' : 'radiogroup'}>
        {order.map((realIdx, shown) => {
          const isPicked = picked.indexOf(realIdx) !== -1;
          const isAnswer = q.answers.indexOf(realIdx) !== -1;
          let cls = 'opt';
          let mark = '';
          if (reviewing) {
            if (isAnswer && isPicked) { cls += ' good'; mark = 'right'; }
            else if (isPicked) { cls += ' bad'; mark = 'no'; }
            else if (isAnswer) { cls += ' missed'; mark = 'also right'; }
          } else if (isPicked) {
            cls += ' picked';
          }
          if (reading && reading.option === realIdx) cls += ' is-reading';
          const option = q.options[realIdx];
          const codeOpt = looksLikeCode(option);
          return (
            <button
              key={realIdx}
              className={cls + (codeOpt ? ' is-code' : '')}
              disabled={reviewing}
              aria-pressed={isPicked}
              onClick={() => onToggle(realIdx)}
            >
              <span className="key" aria-hidden="true">{LETTERS[shown]}</span>
              <span className="txt">
                {codeOpt
                  ? <CodeBlock code={String(option).replace(/^`|`$/g, '')} compact />
                  : <MdInline source={option} />}
              </span>
              {mark && <span className="mark">{mark}</span>}
            </button>
          );
        })}
      </div>

      {!reviewing && multi && (
        <div className="verdict">
          <p className="why">Pick every option that applies, then check.</p>
          <button className="btn primary" disabled={!picked.length} onClick={onCheck}>Check answer</button>
        </div>
      )}

      {reviewing && (
        <Verdict q={q} correct={correct} />
      )}

      <QuestionSource q={q} bookReading={bookReading} onOpen={onOpenReference} hasLecture={hasLecture} hasVideo={hasVideo} hasSlides={hasSlides} hasBook={hasBook} />
    </div>
  );
}

function CodeVerdict({ gotIt, explanation, run }) {
  const failed = run && Array.isArray(run.results) ? run.results.filter((row) => !row.ok) : [];
  return (
    <div className="verdict" role="status">
      <div>
        <p className={'said ' + (gotIt ? 'yes' : 'no')}>
          {gotIt
            ? 'All tests passed.'
            : (failed.length ? failed.length + ' test' + (failed.length === 1 ? '' : 's') + ' failed.' : 'Needs more practice.')}
        </p>
        {explanation && (
          <div className="why">
            <MarkdownView source={explanation} compact />
          </div>
        )}
        <p className="moved">{gotIt ? 'Moved up a box.' : 'Back to box 1, you will see it again soon.'}</p>
      </div>
    </div>
  );
}

function TestResults({ run }) {
  if (!run || !Array.isArray(run.results) || !run.results.length) return null;
  return (
    <ul className="code-results">
      {run.results.map((row, i) => (
        <li key={i} className={row.ok ? 'is-pass' : 'is-fail'}>
          <span className="code-test-name">
            {row.ok ? 'Pass' : 'Fail'}{row.label ? ' · ' + row.label : ''}
          </span>
          {row.call ? <pre><code>{row.call}</code></pre> : null}
          {row.error ? <p className="code-test-error">{row.error}</p> : (
            <p className="code-test-io">
              expected {previewValue(row.expected)}
              {row.ok ? '' : ' · got ' + previewValue(row.actual)}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function CodePractice({ q, reviewing, work, onWork, onAssess }) {
  const draft = work && work.draft != null ? work.draft : (q.starter || '');
  const hintsShown = (work && work.hints) || 0;
  const showSolution = !!(work && work.solution);
  const run = work && work.run;
  const hints = Array.isArray(q.hints) ? q.hints : [];
  const tests = Array.isArray(q.tests) ? q.tests : [];
  const runnable = String(q.language || 'javascript').toLowerCase().indexOf('javascript') !== -1
    || String(q.language || '').toLowerCase() === 'js';

  function setDraft(value) {
    if (onWork) onWork({ draft: value });
  }

  function runTests() {
    const result = runJavascript(draft, tests);
    if (onWork) onWork({ draft, run: result });
    if (result.passed && onAssess) onAssess(true);
  }

  return (
    <div className="code-practice">
      {q.starter ? (
        <div className="code-block">
          <p className="code-label">Starter</p>
          <CodeBlock code={q.starter} />
        </div>
      ) : null}

      {tests.length > 0 && (
        <div className="code-tests">
          <p className="code-label">Tests</p>
          <ul>
            {tests.map((row, i) => {
              const shown = formatTest(row, draft || q.starter);
              return (
                <li key={i}>
                  <span className="code-test-name">{shown.label}</span>
                  <pre><code>{'in  ' + shown.input + '\nout ' + shown.output}</code></pre>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <label className="code-label" htmlFor="code-draft">Your answer</label>
      <textarea
        id="code-draft"
        className="code-draft"
        spellCheck="false"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Write a working function. Run tests to check it."
      />

      <div className="code-reveal">
        {hintsShown < hints.length && (
          <button
            type="button"
            className="text-link"
            onClick={() => onWork && onWork({ hints: hintsShown + 1 })}
          >
            Show hint {hintsShown + 1} of {hints.length}
          </button>
        )}
        {q.solution && !showSolution && (
          <button
            type="button"
            className="text-link"
            onClick={() => onWork && onWork({ solution: true })}
          >
            Show solution
          </button>
        )}
      </div>

      {hints.slice(0, hintsShown).map((hint, i) => (
        <p key={i} className="code-hint"><strong>Hint {i + 1}.</strong> {hint}</p>
      ))}

      {showSolution && q.solution && (
        <div className="code-block">
          <p className="code-label">Worked solution</p>
          <CodeBlock code={q.solution} />
        </div>
      )}

      <TestResults run={run} />

      {!reviewing && (
        <div className="code-assess">
          <p className="why">
            {runnable
              ? 'Run the tests against your code. Passing moves the card up a box.'
              : 'This language is not executed in the browser.'}
          </p>
          <div className="row">
            {runnable && (
              <button type="button" className="btn primary" onClick={runTests}>
                Run tests
              </button>
            )}
            <button type="button" className="btn quiet" onClick={() => onAssess && onAssess(false)}>
              I need more practice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionPrompt({ q, showHero, reading }) {
  return (
    <div className={'q-prompt' + (reading ? ' is-reading' : '')}>
      {showHero && (
        <>
          <p className="code-kicker">Read this JavaScript</p>
          <CodeBlock code={q.code} />
        </>
      )}
      <div className="q-text is-md">
        <MarkdownView source={q.text} compact />
      </div>
    </div>
  );
}

function Verdict({ q, correct }) {
  const names = q.answers.map((i) => q.options[i]).join(', ');
  return (
    <div className="verdict" role="status">
      <div>
        <p className={'said ' + (correct ? 'yes' : 'no')}>
          {correct
            ? 'Right.'
            : (q.answers.length > 1 ? 'The full answer is ' : 'The answer is ') + names + '.'}
        </p>
        {q.explanation && (
          <div className="why">
            <MarkdownView source={q.explanation} compact />
          </div>
        )}
        <p className="moved">{correct ? 'Moved up a box.' : 'Back to box 1, you will see it again soon.'}</p>
      </div>
    </div>
  );
}

function QuestionSource({ q, bookReading, onOpen, hasLecture, hasVideo, hasSlides, hasBook }) {
  const ref = q && q.reference;
  const chapter = matchReading(bookReading, ref && ref.book);
  const lectureQuote = (ref && ref.lecture) || (ref && ref.excerpt) || (q && q.text) || '';
  const fromLecture = firstSlideRange(lectureQuote);
  const slideStart = (ref && ref.slide) || (fromLecture && fromLecture.start) || 0;
  const slideLabel = formatSlideRange(
    slideStart
      ? { start: slideStart, end: (fromLecture && fromLecture.end) || slideStart }
      : null
  );
  const canLecture = hasLecture || hasVideo || !!(ref && ref.lecture);
  const canSlides = hasSlides || slideStart > 0;
  const canBook = hasBook || (ref && ref.page > 0) || (ref && ref.book) || !!(bookReading && bookReading.length);
  if (!ref || (!ref.section && !ref.book && !ref.excerpt && !ref.page && !ref.lecture && !canLecture && !canSlides && !canBook)) {
    if (!(bookReading && bookReading.length) || !canBook) return null;
  }
  const chapterLabel = (ref && ref.chapter) || (chapter && chapter.chapter) || '';
  return (
    <div className="q-source">
      <p className="q-source-label">Chapter reference</p>
      {ref && ref.book && <p className="q-source-book">{ref.book}</p>}
      {chapterLabel && <p className="q-source-chapter">{chapterLabel}</p>}
      {ref && ref.section && <p className="q-source-notes">Notes: {ref.section}</p>}
      {slideLabel && <p className="q-source-notes">{slideLabel}</p>}
      {ref && ref.excerpt && <blockquote className="q-source-excerpt">{ref.excerpt}</blockquote>}
      <div className="q-source-actions">
        {ref && ref.section && onOpen && (
          <button type="button" className="text-link" onClick={() => onOpen({ heading: ref.section, page: 0 })}>
            Show in chapter notes
          </button>
        )}
        {canLecture && onOpen && (
          <button type="button" className="text-link" onClick={() => onOpen({ lecture: lectureQuote })}>
            {hasVideo ? 'Show in video' : 'Show in lecture'}
          </button>
        )}
        {canSlides && onOpen && (
          <button
            type="button"
            className="text-link"
            onClick={() => onOpen({
              slide: slideStart,
              slideEnd: fromLecture && fromLecture.end > slideStart ? fromLecture.end : 0,
              autoSlides: !slideStart,
              excerpt: ref && ref.excerpt,
              lecture: lectureQuote,
            })}
          >
            Show in slides
          </button>
        )}
        {canBook && onOpen && (
          <button
            type="button"
            className="text-link"
            onClick={() => onOpen({
              heading: ref && ref.section,
              page: (ref && ref.page) || 0,
              pageEnd: (ref && ref.pageEnd) || (chapter && chapter.pageEnd) || 0,
              excerpt: ref && ref.excerpt,
              book: (ref && ref.book) || (chapter && chapter.book) || '',
            })}
          >
            Show in book
          </button>
        )}
      </div>
    </div>
  );
}
