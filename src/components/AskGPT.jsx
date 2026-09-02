import { useEffect, useRef, useState } from 'react';
import { LETTERS } from '../lib/parseQuiz.js';
import { reply } from '../lib/ask.js';

const WAIT_MS = 450;

function suggestionChips(card, phase, picked) {
  const chips = [];
  if (phase === 'review' && card) {
    let wrongLetter = null;
    card.order.forEach((realIdx, shown) => {
      const isAnswer = card.q.answers.indexOf(realIdx) !== -1;
      const isPicked = picked.indexOf(realIdx) !== -1;
      if (!wrongLetter && isPicked && !isAnswer) wrongLetter = LETTERS[shown];
    });
    if (wrongLetter) chips.push('Why isn\'t ' + wrongLetter.toUpperCase() + ' right?');
    chips.push('Explain this question');
  }
  chips.push('What is a user requirement?');
  chips.push('What is a business rule?');
  return chips.slice(0, 4);
}

export default function AskGPT({ brain, card, phase, picked }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState(() => [{ role: 'assistant', text: brain.greeting }]);
  const listRef = useRef(null);
  const qid = card && card.q ? card.q.id : '';

  useEffect(() => {
    setMessages([{ role: 'assistant', text: brain.greeting }]);
    setDraft('');
    setPending(false);
  }, [brain, qid]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, pending, open]);

  function ask(text) {
    const message = String(text || '').trim();
    if (!message || pending) return;
    setDraft('');
    setMessages((prev) => prev.concat({ role: 'user', text: message }));
    setPending(true);
    window.setTimeout(() => {
      const textOut = reply(brain, { message, card, phase });
      setMessages((prev) => prev.concat({ role: 'assistant', text: textOut }));
      setPending(false);
    }, WAIT_MS);
  }

  const chips = suggestionChips(card, phase, picked || []);

  return (
    <div className={'askgpt' + (open ? ' is-open' : '')}>
      {open && (
        <div className="askgpt-panel sheet" role="dialog" aria-label="AskGPT">
          <div className="askgpt-head">
            <strong>AskGPT</strong>
            <button type="button" className="btn quiet" onClick={() => setOpen(false)}>Close</button>
          </div>

          <div className="askgpt-log" ref={listRef} aria-live="polite">
            {messages.map((m, i) => (
              <p key={i} className={'askgpt-msg ' + m.role}>{m.text}</p>
            ))}
            {pending && <p className="askgpt-msg assistant is-wait">AskGPT is typing…</p>}
          </div>

          {chips.length > 0 && (
            <div className="askgpt-chips">
              {chips.map((c) => (
                <button key={c} type="button" className="askgpt-chip" onClick={() => ask(c)} disabled={pending}>
                  {c}
                </button>
              ))}
            </div>
          )}

          <form
            className="askgpt-form"
            onSubmit={(e) => { e.preventDefault(); ask(draft); }}
          >
            <label className="sr-only" htmlFor="askgpt-input">Question for AskGPT</label>
            <input
              id="askgpt-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Why isn’t F a user requirement?"
              autoComplete="off"
            />
            <button type="submit" className="btn primary" disabled={pending || !draft.trim()}>Ask</button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="askgpt-fab"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide AskGPT' : 'AskGPT'}
      </button>
    </div>
  );
}
