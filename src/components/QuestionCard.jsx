import { useEffect, useRef, useState } from 'react';
import { sameSet, KIND_LABEL } from '../lib/leitner.js';
import { LETTERS } from '../lib/parseQuiz.js';

function speakText(text) {
  const synth = typeof window !== 'undefined' && window.speechSynthesis;
  if (!synth || !text) return false;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  // iOS Safari drops the first speak() if it runs in the same turn as cancel().
  window.setTimeout(() => synth.speak(utter), 60);
  return true;
}

function stopSpeech() {
  const synth = typeof window !== 'undefined' && window.speechSynthesis;
  if (synth) synth.cancel();
}

function cardSpeech(q, order) {
  let text = q.text || '';
  if (q.options && order && order.length) {
    text += '. The choices are. ';
    order.forEach((idx, i) => {
      text += LETTERS[i].toUpperCase() + '. ' + q.options[idx] + '. ';
    });
  }
  return text;
}

function SpeakButton({ text }) {
  const [on, setOn] = useState(false);
  const tick = useRef(0);
  const canSpeak = typeof window !== 'undefined' && !!window.speechSynthesis;

  useEffect(() => {
    stopSpeech();
    setOn(false);
    if (tick.current) window.clearInterval(tick.current);
    return () => {
      stopSpeech();
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [text]);

  if (!canSpeak) return null;

  return (
    <button
      type="button"
      className={'speak-btn' + (on ? ' is-on' : '')}
      aria-label={on ? 'Stop reading' : 'Read question aloud'}
      title={on ? 'Stop reading' : 'Read question aloud'}
      onClick={() => {
        if (on) {
          stopSpeech();
          if (tick.current) window.clearInterval(tick.current);
          setOn(false);
          return;
        }
        const started = speakText(text);
        setOn(started);
        if (!started) return;
        const synth = window.speechSynthesis;
        if (tick.current) window.clearInterval(tick.current);
        tick.current = window.setInterval(() => {
          if (!synth.speaking) {
            window.clearInterval(tick.current);
            tick.current = 0;
            setOn(false);
          }
        }, 250);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {on ? (
          <path d="M6 6h4v12H6zm8 0h4v12h-4z" fill="currentColor" />
        ) : (
          <path d="M4 9v6h4l5 4V5L8 9H4zm13.5 3a4.5 4.5 0 0 0-2.3-3.9v7.8A4.5 4.5 0 0 0 17.5 12zm2.5 0c0 2.5-1.1 4.7-2.8 6.2l1.4 1.4A10 10 0 0 0 22 12a10 10 0 0 0-3.4-7.6l-1.4 1.4A8 8 0 0 1 20 12z" fill="currentColor" />
        )}
      </svg>
    </button>
  );
}

export default function QuestionCard({ q, order, picked, phase, onToggle, onCheck, onOpenReference, hasLecture, hasVideo, hasBook }) {
  const reviewing = phase === 'review';
  const correct = reviewing && sameSet(picked, q.answers);
  const multi = q.type === 'multi';

  return (
    <div className="sheet qcard">
      <p className="kind">{KIND_LABEL[q.type]}</p>
      <div className="q-head">
        <div className="q-text">{q.text}</div>
        <SpeakButton text={cardSpeech(q, order)} />
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

      <QuestionSource q={q} onOpen={onOpenReference} hasLecture={hasLecture} hasVideo={hasVideo} hasBook={hasBook} />
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

function QuestionSource({ q, onOpen, hasLecture, hasVideo, hasBook }) {
  const ref = q && q.reference;
  const lectureQuote = (ref && ref.lecture) || (ref && ref.excerpt) || (q && q.text) || '';
  const canLecture = hasLecture || hasVideo || !!(ref && ref.lecture);
  const canBook = hasBook || (ref && ref.page > 0);
  if (!ref || (!ref.section && !ref.book && !ref.excerpt && !ref.page && !ref.lecture && !canLecture && !canBook)) return null;
  return (
    <div className="q-source">
      <p className="q-source-label">Chapter reference</p>
      {ref.book && <p className="q-source-book">{ref.book}</p>}
      {ref.section && <p className="q-source-notes">Notes: {ref.section}</p>}
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
        {canBook && onOpen && (
          <button type="button" className="text-link" onClick={() => onOpen({ heading: ref.section, page: ref.page || 1, excerpt: ref.excerpt, book: ref.book })}>
            {hasVideo ? 'Show in slides' : 'Show in book'}
          </button>
        )}
      </div>
    </div>
  );
}
