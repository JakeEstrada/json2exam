import { MarkdownView } from './FileWindow.jsx';

function StudyPanel({ filename, children, extra, bodyClass }) {
  return (
    <details className="quiz-notes sheet">
      <summary className="quiz-notes-head">
        <span className="module-caret" aria-hidden="true" />
        <span className="quiz-notes-file">{filename}</span>
        {extra}
      </summary>
      <div className={'quiz-notes-body' + (bodyClass ? ' ' + bodyClass : '')}>
        {children}
      </div>
    </details>
  );
}

export default function QuizNotes({ filename, source, bookFile, bookUrl }) {
  if (!source && !bookUrl) return null;
  return (
    <div className="quiz-study">
      {source && (
        <StudyPanel filename={filename || 'notes.md'}>
          <MarkdownView source={source} />
        </StudyPanel>
      )}
      {bookUrl && (
        <StudyPanel
          filename={bookFile || 'chapter.pdf'}
          bodyClass="is-pdf"
          extra={(
            <a
              className="text-link quiz-notes-open"
              href={bookUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Open in new tab
            </a>
          )}
        >
          <iframe className="pdf-frame" title={bookFile || 'Chapter book'} src={bookUrl} />
        </StudyPanel>
      )}
    </div>
  );
}
