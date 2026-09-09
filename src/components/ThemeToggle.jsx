import { useEffect, useState } from 'react';
import { applyTheme, loadTheme, resolvedTheme, saveTheme } from '../lib/storage.js';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => loadTheme());
  const [, setTick] = useState(0);
  const dark = resolvedTheme(theme) === 'dark';

  useEffect(() => {
    applyTheme(theme);
    if (theme) return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setTick((n) => n + 1);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  function toggle() {
    const next = dark ? 'light' : 'dark';
    saveTheme(next);
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="btn quiet theme-toggle"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 4.2a.9.9 0 0 1 .9.9v1.2a.9.9 0 1 1-1.8 0V5.1a.9.9 0 0 1 .9-.9Zm0 12.5a4.7 4.7 0 1 0 0-9.4 4.7 4.7 0 0 0 0 9.4Zm7.1-5.6h1.2a.9.9 0 1 1 0 1.8h-1.2a.9.9 0 1 1 0-1.8ZM3.7 11.1h1.2a.9.9 0 1 1 0 1.8H3.7a.9.9 0 1 1 0-1.8Zm13.7-5.2.85-.85a.9.9 0 0 1 1.27 1.27l-.85.85a.9.9 0 1 1-1.27-1.27ZM4.48 18.25l.85-.85a.9.9 0 1 1 1.27 1.27l-.85.85A.9.9 0 0 1 4.48 18.25Zm13.49.42a.9.9 0 0 1 0-1.27l.85-.85a.9.9 0 1 1 1.27 1.27l-.85.85a.9.9 0 0 1-1.27 0ZM5.33 4.48a.9.9 0 0 1 1.27 0l.85.85A.9.9 0 1 1 6.18 6.6l-.85-.85a.9.9 0 0 1 0-1.27ZM12 17.7a.9.9 0 0 1 .9.9v1.2a.9.9 0 1 1-1.8 0v-1.2a.9.9 0 0 1 .9-.9Z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14.6 3.2a.8.8 0 0 1 1 .98 8.2 8.2 0 1 0 4.22 4.22.8.8 0 0 1 1.28.66A9.8 9.8 0 1 1 13.9 3.1a.8.8 0 0 1 .7.1Z"
          />
        </svg>
      )}
      <span>{dark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
