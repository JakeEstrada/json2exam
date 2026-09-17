import { useState } from 'react';

export default function Login({ onClose, onSignedIn }) {
  const [username, setUsername] = useState('Jake');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event) {
    if (event) event.preventDefault();
    if (pending) return;
    setError('');
    setPending(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) {
        setError(data.detail || 'That sign-in does not match.');
        return;
      }
      onSignedIn({ name: data.name || 'Jake', token: data.token });
    } catch (err) {
      setError('Could not reach the sign-in service.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="file-window-back" onClick={onClose}>
      <div
        className="sheet login-card"
        role="dialog"
        aria-labelledby="login-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="login-title">Owner sign-in</h2>
        <p>AskGPT and the learning log are locked to this sign-in. Visitors can study; they cannot run the tutor or write progress.</p>
        <form onSubmit={submit}>
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <p className="login-error">{error}</p>}
          <div className="row">
            <button type="submit" className="btn primary" disabled={pending || !password}>
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
            <button type="button" className="btn quiet" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
