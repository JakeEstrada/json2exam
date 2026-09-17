import { useEffect, useRef, useState } from 'react';
import { prefetchSpeech, prefetchSpeechParts, speakText, speechSupported, stopSpeech } from '../lib/speech.js';

export function useSpeechReader(parts, voice, rate, opts) {
  const prefetchAll = !!(opts && opts.prefetchAll);
  const keys = !!(opts && opts.keys);
  const [at, setAt] = useState(0);
  const [on, setOn] = useState(false);
  const [wait, setWait] = useState(false);
  const atRef = useRef(0);
  const onRef = useRef(false);
  const partsRef = useRef(parts);
  const voiceRef = useRef(voice);
  const rateRef = useRef(rate);
  partsRef.current = parts;
  voiceRef.current = voice;
  rateRef.current = rate;

  function playFrom(i) {
    const list = partsRef.current || [];
    if (!list.length) return;
    const next = ((i % list.length) + list.length) % list.length;
    atRef.current = next;
    onRef.current = true;
    setAt(next);
    setOn(true);
    setWait(true);
    const ahead = list[next + 1];
    if (ahead && ahead.text) prefetchSpeech(ahead.text, voiceRef.current);
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
    if (prefetchAll) prefetchSpeechParts(parts, voice);
    return () => stopSpeech();
  }, [parts, voice, prefetchAll]);

  useEffect(() => {
    if (!keys) return undefined;
    function onKey(e) {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keys]);

  return {
    at,
    on,
    wait,
    playFrom,
    stop,
    step,
    spoken: on ? parts[at] : null,
  };
}

export default function SpeechTools({ parts, on, wait, onToggle, onStep }) {
  const canSpeak = speechSupported();
  if (!canSpeak || !parts.length) return null;

  return (
    <div className="q-tools">
      <button
        type="button"
        className="speak-btn"
        aria-label="Read previous section"
        title="Read previous section"
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
        aria-label={wait ? 'Loading voice' : on ? 'Stop reading' : 'Read aloud'}
        title={wait ? 'Loading voice…' : on ? 'Stop reading' : 'Read aloud'}
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
        aria-label="Read next section"
        title="Read next section"
        onClick={() => onStep(1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.6 5.4 16.2 12l-7.6 6.6 1.4 1.4L19 12l-9-8z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
