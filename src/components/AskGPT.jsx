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
        <svg className="askgpt-logo" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6876 8.135v-5.518a.7732.7732 0 0 0-.407-.667zm2.354-3.023L18.49 8.358a.077.077 0 0 1-.0781 0l-5.8388-3.3918v2.3324a.1554.1554 0 0 0 .0332.0615L20.24 13.19a.0714.0714 0 0 1 .0286.0615v-5.5393a4.5078 4.5078 0 0 0-1.7755-3.603zM7.3942 13.644l-2.02-1.1638a.0804.0804 0 0 1-.038-.052v-5.582a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L7.703 8.245a.7948.7948 0 0 0-.3927.6813zm1.3483-7.814c-.2475.1418-4.5973 2.668-4.5973 2.668l6.5073 3.75 6.5073-3.7519s-4.3426-2.544-4.5973-2.668a.3662.3662 0 0 0-.3652 0zM12.2464 14.933l-2.02-1.1638v-2.3524l2.02-1.1715 2.0322 1.1715v2.3524z"/>
        </svg>
        {open ? 'Hide AskGPT' : 'AskGPT'}
      </button>
    </div>
  );
}
