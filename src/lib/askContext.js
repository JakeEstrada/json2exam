const LETTERS = 'abcdefghij';

export const ASK_INSTRUCTIONS = [
  'You are a study tutor inside a quiz app.',
  'Treat the question bank as ground truth. Do not invent a different correct answer.',
  'If the student asks why an option is not also correct, compare that option to the marked answers and explain the distinction in plain language.',
  'Be concise. Use the on-screen letters (A, B, C…) when you refer to choices.',
  'If they have not checked yet, discuss concepts but do not reveal which options are correct.',
].join(' ');

export function buildAskPrompt({ message, phase, card }) {
  const question = String(message || '').trim().slice(0, 2000);
  const reviewed = phase === 'review';
  const lines = ['Student question:', question];

  if (card && card.text && Array.isArray(card.options) && Array.isArray(card.order)) {
    lines.push('', 'Current card:', card.text);
    lines.push('Options:');
    card.order.forEach((realIdx, shown) => {
      if (shown >= LETTERS.length) return;
      const text = card.options[realIdx];
      if (typeof text !== 'string') return;
      lines.push(LETTERS[shown].toUpperCase() + '. ' + text);
    });
    if (reviewed && Array.isArray(card.answers)) {
      const correct = card.order
        .map((realIdx, shown) => (card.answers.indexOf(realIdx) !== -1 ? LETTERS[shown].toUpperCase() : null))
        .filter(Boolean);
      lines.push('Correct answer(s): ' + (correct.join(', ') || '(none marked)'));
      if (card.explanation) lines.push('Bank explanation: ' + String(card.explanation));
    } else {
      lines.push('The student has not checked this card yet. Do not reveal the answer.');
    }
  } else {
    lines.push('', 'No current card is on screen.');
  }

  return lines.join('\n');
}

export function historyText(history) {
  if (!Array.isArray(history) || !history.length) return '';
  const rows = history.slice(-8).map((m) => {
    const role = m && m.role === 'assistant' ? 'Tutor' : 'Student';
    const text = String((m && m.text) || '').trim().slice(0, 1500);
    return text ? role + ': ' + text : '';
  }).filter(Boolean);
  return rows.length ? 'Recent chat:\n' + rows.join('\n') : '';
}
