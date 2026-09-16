const AUTH_KEY = 'json2exam.owner';
const STORE_KEY = 'cardbox.session.v1';
const THEME_KEY = 'json2exam.theme';

export function saveSession(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage may be off */ }
}
export function loadSession() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.quiz || !Array.isArray(parsed.quiz.questions)) return null;
    return parsed;
  } catch (e) { return null; }
}
export function clearSession() {
  try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
}

export function loadTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY);
    if (value === 'light' || value === 'dark') return value;
  } catch (e) { /* ignore */ }
  return null;
}

export function saveTheme(theme) {
  try {
    if (theme === 'light' || theme === 'dark') localStorage.setItem(THEME_KEY, theme);
    else localStorage.removeItem(THEME_KEY);
  } catch (e) { /* ignore */ }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme);
  else root.removeAttribute('data-theme');
}

export function resolvedTheme(theme) {
  if (theme === 'light' || theme === 'dark') return theme;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function loadOwner() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.token || !parsed.name) return null;
    return { name: String(parsed.name), token: String(parsed.token) };
  } catch (e) {
    return null;
  }
}

export function saveOwner(owner) {
  try {
    if (!owner || !owner.token) localStorage.removeItem(AUTH_KEY);
    else localStorage.setItem(AUTH_KEY, JSON.stringify({ name: owner.name, token: owner.token }));
  } catch (e) { /* ignore */ }
}

export function clearOwner() {
  try { localStorage.removeItem(AUTH_KEY); } catch (e) { /* ignore */ }
}
