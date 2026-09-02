export function openJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const tab = window.open(url, '_blank', 'noopener');
  if (!tab) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'questions.json';
    a.click();
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
