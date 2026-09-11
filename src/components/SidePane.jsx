export default function SidePane({ title, onClose, ask, bookHref, children }) {
  return (
    <aside className={'quiz-side' + (ask ? ' is-ask' : '')} role="complementary" aria-label={title}>
      <div className="quiz-side-bar">
        <strong>{title}</strong>
        {bookHref && (
          <a className="text-link quiz-side-open" href={bookHref} target="_blank" rel="noreferrer">
            Open in new tab
          </a>
        )}
        <button type="button" className="quiz-side-close" onClick={onClose} aria-label="Close pane">
          <span aria-hidden="true">×</span>
        </button>
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
