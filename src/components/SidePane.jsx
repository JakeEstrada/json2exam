export default function SidePane({ title, onClose, ask, bookHref, reader, minimized, onToggleMin, children }) {
  const cls = 'quiz-side'
    + (ask ? ' is-ask' : '')
    + (reader ? ' is-reader' : '')
    + (minimized ? ' is-min' : '');
  return (
    <aside className={cls} role="complementary" aria-label={title}>
      {onToggleMin && (
        <button
          type="button"
          className="quiz-side-corner"
          onClick={onToggleMin}
          aria-label={minimized ? 'Restore' : 'Minimize'}
        >
          <span className={'quiz-side-corner-arrow' + (minimized ? ' is-open' : '')} aria-hidden="true" />
        </button>
      )}
      <div className="quiz-side-bar">
        <strong>{title}</strong>
        {bookHref && !minimized && (
          <a className="text-link quiz-side-open" href={bookHref} target="_blank" rel="noreferrer">
            Open in new tab
          </a>
        )}
        <button type="button" className="quiz-side-close" onClick={onClose} aria-label="Close pane">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      {!minimized && <div className="quiz-side-body" id="quiz-side-body">{children}</div>}
    </aside>
  );
}

function paneTitle(mode, quiz) {
  if (mode === 'ask') return 'AskGPT';
  if (mode === 'lecture') return quiz && quiz.lectureVideo ? 'Video' : 'Lecture';
  if (mode === 'slides') return 'Slides';
  if (mode === 'book') return 'Book';
  if (mode === 'sheet') return 'Cheat sheet';
  return 'Notes';
}

export { paneTitle };
