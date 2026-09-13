import { useEffect, useMemo, useRef, useState } from 'react';
import { sameSet, KIND_LABEL } from '../lib/leitner.js';
import { LETTERS } from '../lib/parseQuiz.js';
import { firstSlideRange, formatSlideRange } from '../lib/slides.js';
import { cardSpeechParts, prefetchSpeechParts, speakText, speechSupported, stopSpeech } from '../lib/speech.js';

function SpeechTools({ parts, on, wait, onToggle, onStep }) {
  const canSpeak = speechSupported();
  if (!canSpeak || !parts.length) return null;

  return (
    <div className="q-tools">
      <button
        type="button"
        className="speak-btn"
        aria-label="Read previous line"
        title="Read previous line"
        onClick={() => onStep(-1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.4 5.4 8.8 12l6.6 6.6-1.4 1.4L6 12l8-8z" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        className={'speak-btn' + (on ? ' is-on' : '') + (wait ? ' is-wait' : '')}
        aria-busy={wait}
        aria-label={wait ? 'Loading voice' : on ? 'Stop reading' : 'Read question aloud'}
        title={wait ? 'Loading voice…' : on ? 'Stop reading' : 'Read question aloud'}
        onClick={onToggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {on ? (
            <path d="M6 6h4v12H6zm8 0h4v12h-4z" fill="currentColor" />
          ) : (
            <path d="M4 9v6h4l5 4V5L8 9H4zm13.5 3a4.5 4.5 0 0 0-2.3-3.9v7.8A4.5 4.5 0 0 0 17.5 12zm2.5 0c0 2.5-1.1 4.7-2.8 6.2l1.4 1.4A10 10 0 0 0 22 12a10 10 0 0 0-3.4-7.6l-1.4 1.4A8 8 0 0 1 20 12z" fill="currentColor" />
          )}
        </svg>
      </button>
      <button
        type="button"
        className="speak-btn"
        aria-label="Read next line"
        title="Read next line"
        onClick={() => onStep(1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.6 5.4 16.2 12l-7.6 6.6 1.4 1.4L19 12l-9-8z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}

export default function QuestionCard({ q, order, picked, phase, onToggle, onCheck, onOpenReference, hasLecture, hasVideo, hasSlides, hasBook, voice, speechRate }) {
  const reviewing = phase === 'review';
  const correct = reviewing && sameSet(picked, q.answers);
  const multi = q.type === 'multi';
  const parts = useMemo(() => cardSpeechParts(q, order), [q, order]);
  const [at, setAt] = useState(0);
  const [on, setOn] = useState(false);
  const [wait, setWait] = useState(false);
  const atRef = useRef(0);
  const onRef = useRef(false);
  const partsRef = useRef(parts);
  const voiceRef = useRef(voice);
  const rateRef = useRef(speechRate);
  partsRef.current = parts;
  voiceRef.current = voice;
  rateRef.current = speechRate;

  function playFrom(i) {
    const list = partsRef.current;
    if (!list.length) return;
    const next = ((i % list.length) + list.length) % list.length;
    atRef.current = next;
    onRef.current = true;
    setAt(next);
    setOn(true);
    setWait(true);
    speakText(list[next].text, () => {
      if (!onRef.current) return;
      const after = atRef.current + 1;
      if (after < partsRef.current.length) playFrom(after);
      else {
        onRef.current = false;
        atRef.current = 0;
        setAt(0);
        setOn(false);
        setWait(false);
      }
    }, voiceRef.current, rateRef.current).then((started) => {
      setWait(false);
      if (!started && onRef.current && atRef.current === next) {
        onRef.current = false;
        setOn(false);
      }
    });
  }

  function stop() {
    onRef.current = false;
    setOn(false);
    setWait(false);
    stopSpeech();
  }

  function step(delta) {
    playFrom(atRef.current + delta);
  }

  useEffect(() => {
    stop();
    atRef.current = 0;
    setAt(0);
    prefetchSpeechParts(parts, voice);
    return () => stopSpeech();
  }, [q, order, voice, parts]);

  useEffect(() => {
    function onKey(e) {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const reading = on ? parts[at] : null;

  return (
    <div className="sheet qcard">
      <p className="kind">{KIND_LABEL[q.type]}</p>
      <div className="q-head">
        <div className={'q-text' + (reading && reading.kind === 'title' ? ' is-reading' : '')}>{q.text}</div>
        <SpeechTools
          parts={parts}
          on={on}
          wait={wait}
          onToggle={() => (on ? stop() : playFrom(atRef.current))}
          onStep={step}
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
          return (
            <button
              key={realIdx}
              className={cls}
              disabled={reviewing}
              aria-pressed={isPicked}
              onClick={() => onToggle(realIdx)}
            >
              <span className="key" aria-hidden="true">{LETTERS[shown]}</span>
              <span className="txt">{q.options[realIdx]}</span>
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

      <QuestionSource q={q} onOpen={onOpenReference} hasLecture={hasLecture} hasVideo={hasVideo} hasSlides={hasSlides} hasBook={hasBook} />
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
        {q.explanation && <p className="why">{q.explanation}</p>}
        <p className="moved">{correct ? 'Moved up a box.' : 'Back to box 1, you will see it again soon.'}</p>
      </div>
    </div>
  );
}

function QuestionSource({ q, onOpen, hasLecture, hasVideo, hasSlides, hasBook }) {
  const ref = q && q.reference;
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
  const canBook = hasBook || (ref && ref.page > 0);
  if (!ref || (!ref.section && !ref.book && !ref.excerpt && !ref.page && !ref.lecture && !canLecture && !canSlides && !canBook)) return null;
  return (
    <div className="q-source">
      <p className="q-source-label">Chapter reference</p>
      {ref.book && <p className="q-source-book">{ref.book}</p>}
      {ref.section && <p className="q-source-notes">Notes: {ref.section}</p>}
      {slideLabel && <p className="q-source-notes">{slideLabel}</p>}
      {ref.excerpt && <blockquote className="q-source-excerpt">{ref.excerpt}</blockquote>}
      <div className="q-source-actions">
        {ref.section && onOpen && (
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
              excerpt: ref.excerpt,
              lecture: lectureQuote,
            })}
          >
            Show in slides
          </button>
        )}
        {canBook && onOpen && (
          <button type="button" className="text-link" onClick={() => onOpen({ heading: ref.section, page: ref.page || 1, excerpt: ref.excerpt, book: ref.book })}>
            Show in book
          </button>
        )}
      </div>
    </div>
  );
}
