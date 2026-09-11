import { useEffect, useState } from 'react';
import { headingId } from '../lib/parseQuiz.js';
import { MarkdownView } from './FileWindow.jsx';

function StudyPanel({ filename, children, extra, bodyClass, open, onOpenChange }) {
  return (
    <details
      className="quiz-notes sheet"
      open={open}
      onToggle={(e) => onOpenChange && onOpenChange(e.currentTarget.open)}
    >
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

export default function QuizNotes({ filename, source, bookFile, bookUrl, focus }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const page = focus && focus.page ? focus.page : 0;
  const heading = focus && focus.heading ? focus.heading : '';
  const bookSrc = bookUrl && page ? bookUrl + '#page=' + page : bookUrl;

  useEffect(() => {
    if (!focus) return;
    if (focus.heading && source) setNotesOpen(true);
    if (focus.page && bookUrl) setBookOpen(true);
    if (!focus.heading) return;
    const id = headingId(focus.heading);
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => window.clearTimeout(t);
  }, [focus, source, bookUrl]);

  if (!source && !bookUrl) return null;
  return (
    <div className="quiz-study">
      {source && (
        <StudyPanel
          filename={filename || 'notes.md'}
          open={notesOpen}
          onOpenChange={setNotesOpen}
        >
          <MarkdownView source={source} focusHeading={heading} />
        </StudyPanel>
      )}
      {bookUrl && (
        <StudyPanel
          filename={bookFile || 'chapter.pdf'}
          bodyClass="is-pdf"
          open={bookOpen}
          onOpenChange={setBookOpen}
          extra={(
            <a
              className="text-link quiz-notes-open"
              href={bookSrc}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Open in new tab
            </a>
          )}
        >
          <iframe
            key={bookSrc}
            className="pdf-frame"
            title={bookFile || 'Chapter book'}
            src={bookSrc}
          />
        </StudyPanel>
      )}
    </div>
  );
}
