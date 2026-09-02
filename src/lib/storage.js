const STORE_KEY = 'cardbox.session.v1';

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
