export default function SidePane({
  title, onClose, ask, mode, onMode, hasNotes, hasLecture, hasBook, bookHref, children,
}) {
  return (
    <aside className={'quiz-side' + (ask ? ' is-ask' : '')} role="complementary" aria-label={title}>
      <div className="quiz-side-bar">
        <strong>{title}</strong>
        <span className="quiz-side-hint">Backspace to close</span>
        <button type="button" className="quiz-side-close" onClick={onClose} aria-label="Close pane">
          ×
        </button>
      </div>
      <div className="quiz-side-tabs">
        {hasNotes && (
          <button
            type="button"
            className={'quiz-side-tab' + (mode === 'notes' ? ' is-on' : '')}
            onClick={() => onMode('notes')}
          >
            Notes
          </button>
        )}
        {hasLecture && (
          <button
            type="button"
            className={'quiz-side-tab' + (mode === 'lecture' ? ' is-on' : '')}
            onClick={() => onMode('lecture')}
          >
            Lecture
          </button>
        )}
        {hasBook && (
          <button
            type="button"
            className={'quiz-side-tab' + (mode === 'book' ? ' is-on' : '')}
            onClick={() => onMode('book')}
          >
            Book
          </button>
        )}
        <button
          type="button"
          className={'quiz-side-tab' + (mode === 'ask' ? ' is-on' : '')}
          onClick={() => onMode('ask')}
        >
          AskGPT
        </button>
        {mode === 'book' && bookHref && (
          <a className="text-link quiz-notes-open" href={bookHref} target="_blank" rel="noreferrer">
            Open in new tab
          </a>
        )}
      </div>
      <div className="quiz-side-body" id="quiz-side-body">{children}</div>
    </aside>
  );
}

function paneTitle(mode) {
  if (mode === 'ask') return 'AskGPT';
  if (mode === 'lecture') return 'Lecture';
  if (mode === 'book') return 'Book';
  return 'Notes';
}

export { paneTitle };
