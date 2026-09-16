const LETTERS = 'abcdefghij';

export const ASK_INSTRUCTIONS = [
  'You are a study tutor inside a quiz app.',
  'Treat the question bank as ground truth. Do not invent a different correct answer.',
  'If study notes or assigned reading for the deck are provided, use them as the chapter reference. Stay inside that module’s chapter (for example functions, loops, or arrays) when the student asks where to read.',
  'If the student is on the lesson page, tutor the reading. Answer general questions about the notes. Do not reveal upcoming quiz answers.',
  'If the student asks why an option is not also correct, compare that option to the marked answers and explain the distinction in plain language.',
  'Be concise. Use the on-screen letters (A, B, C…) when you refer to choices.',
  'If they have not checked yet, discuss concepts but do not reveal which options are correct.',
].join(' ');

export function buildAskPrompt({ message, phase, card, notes }) {
  const question = String(message || '').trim().slice(0, 2000);
  const reviewed = phase === 'review';
  const lines = ['Student question:', question];

  const guide = String(notes || '').trim().slice(0, 6000);
  if (guide) {
    lines.push('', 'Study notes for this deck:', guide);
  }

  if (card && card.type === 'code') {
    lines.push('', 'Current card (code practice):', card.text || '');
    if (card.language) lines.push('Language: ' + card.language);
    if (card.starter) lines.push('Starter:\n' + String(card.starter).slice(0, 2000));
    if (Array.isArray(card.tests) && card.tests.length) {
      lines.push('Example inputs and outputs:');
      card.tests.slice(0, 6).forEach((row) => {
        lines.push('- in ' + String((row && row.input) || '') + ' → out ' + String((row && row.output) || ''));
      });
    }
    if (reviewed) {
      if (card.explanation) lines.push('Bank explanation: ' + String(card.explanation));
    } else {
      lines.push('The student has not passed the tests yet. Do not reveal the worked solution.');
    }
    return lines.join('\n');
  }

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
  } else if (phase === 'lesson') {
    lines.push('', 'The student is reading the lesson before the quiz. Tutor this reading. Do not reveal quiz answers.');
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
