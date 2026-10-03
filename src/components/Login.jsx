import { useState } from 'react';

export default function Login({ onClose, onSignedIn }) {
  const [mode, setMode] = useState('in');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const creating = mode === 'up';

  async function submit(event) {
    if (event) event.preventDefault();
    if (pending) return;
    setError('');
    setPending(true);
    try {
      const res = await fetch(creating ? '/api/signup' : '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creating
          ? { name, email: username, password }
          : { username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) {
        setError(data.detail || (creating ? 'Could not create that account.' : 'That sign-in does not match.'));
        return;
      }
      onSignedIn({ name: data.name || name || username, token: data.token });
    } catch (err) {
      setError(creating ? 'Could not reach the signup service.' : 'Could not reach the sign-in service.');
    } finally {
      setPending(false);
    }
  }

  const canSubmit = creating
    ? !!(name.trim() && username.trim() && password.length >= 8)
    : !!(username.trim() && password);

  return (
    <div className="file-window-back" onClick={onClose}>
      <div
        className="sheet login-card"
        role="dialog"
        aria-labelledby="login-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="login-modes" role="tablist" aria-label="Account">
          <button
            type="button"
            role="tab"
            aria-selected={!creating}
            className={'login-mode' + (creating ? '' : ' is-on')}
            onClick={() => { setMode('in'); setError(''); }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={creating}
            className={'login-mode' + (creating ? ' is-on' : '')}
            onClick={() => { setMode('up'); setError(''); }}
          >
            Create account
          </button>
        </div>
        <h2 id="login-title">{creating ? 'Create an account' : 'Sign in'}</h2>
        <p>
          {creating
            ? 'Anyone can create an account. Progress saving is still owner-only for now.'
            : 'Sign in with the owner username, or with the email you registered. Visitors can still study without signing in. Progress saving stays owner-only until the next backend slice.'}
        </p>
        <form onSubmit={submit}>
          {creating && (
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                autoFocus
              />
            </label>
          )}
          <label>
            {creating ? 'Email' : 'Username or email'}
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete={creating ? 'email' : 'username'}
              autoFocus={!creating}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={creating ? 'new-password' : 'current-password'}
            />
          </label>
          {error && <p className="login-error">{error}</p>}
          <div className="row">
            <button type="submit" className="btn primary" disabled={pending || !canSubmit}>
              {pending
                ? (creating ? 'Creating…' : 'Signing in…')
                : (creating ? 'Create account' : 'Sign in')}
            </button>
            <button type="button" className="btn quiet" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
