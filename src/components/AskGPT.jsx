import { useEffect, useRef, useState } from 'react';
import { LETTERS } from '../lib/parseQuiz.js';
import { reply } from '../lib/ask.js';

const FALLBACK_HELLO = 'Ask about this question after you check. I can walk through why an option is or isn’t also right.';

function suggestionChips(card, phase, picked, brain) {
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
  if (brain) {
    chips.push('What is a user requirement?');
    chips.push('What is a business rule?');
  }
  return chips.slice(0, 4);
}

function cardPayload(card) {
  if (!card || !card.q) return null;
  return {
    text: card.q.text,
    options: card.q.options,
    answers: card.q.answers,
    explanation: card.q.explanation || '',
    order: card.order,
    type: card.q.type,
  };
}

async function askModel({ message, phase, card, picked, history }) {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      phase,
      card: cardPayload(card),
      picked: picked || [],
      history,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.detail || data.error || 'Ask failed.');
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  if (!data.text) throw new Error('Empty reply.');
  return data.text;
}

export default function AskGPT({ brain, card, phase, picked }) {
  const hello = (brain && brain.greeting) || FALLBACK_HELLO;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState(() => [{ role: 'assistant', text: hello }]);
  const listRef = useRef(null);
  const qid = card && card.q ? card.q.id : '';

  useEffect(() => {
    setMessages([{ role: 'assistant', text: hello }]);
    setDraft('');
    setPending(false);
  }, [brain, qid, hello]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, pending, open]);

  async function ask(text) {
    const message = String(text || '').trim();
    if (!message || pending) return;
    const history = messages;
    setDraft('');
    setMessages((prev) => prev.concat({ role: 'user', text: message }));
    setPending(true);
    try {
      const textOut = await askModel({ message, phase, card, picked, history });
      setMessages((prev) => prev.concat({ role: 'assistant', text: textOut }));
    } catch (err) {
      let textOut = '';
      if (brain) textOut = reply(brain, { message, card, phase });
      if (!textOut) {
        textOut = err.status === 501
          ? 'Add OPENAI_API_KEY to a .env file in the project root and restart npm run dev.'
          : (err.message || 'Could not reach the tutor.');
      }
      setMessages((prev) => prev.concat({ role: 'assistant', text: textOut }));
    } finally {
      setPending(false);
    }
  }

  const chips = suggestionChips(card, phase, picked || [], brain);

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
