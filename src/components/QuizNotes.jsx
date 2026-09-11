import { useEffect, useState } from 'react';
import { headingId } from '../lib/parseQuiz.js';
import { MarkdownView } from './FileWindow.jsx';
import LectureView from './LectureView.jsx';

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

export default function QuizNotes({
  filename, source, bookFile, bookUrl, lectureFile, lecture, focus,
}) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [lectureOpen, setLectureOpen] = useState(false);
  const page = focus && focus.page ? focus.page : 0;
  const heading = focus && focus.heading ? focus.heading : '';
  const lectureQuote = focus && focus.lecture ? focus.lecture : '';
  const bookSrc = bookUrl && page ? bookUrl + '#page=' + page : bookUrl;

  useEffect(() => {
    if (!focus) return;
    if (focus.heading && source && !focus.lecture) setNotesOpen(true);
    if (focus.page && bookUrl) setBookOpen(true);
    if (focus.lecture && lecture) setLectureOpen(true);
    const t = window.setTimeout(() => {
      const study = document.getElementById('quiz-study');
      if (study) study.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (focus.lecture) return;
      if (!focus.heading) return;
      const el = document.getElementById(headingId(focus.heading));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(t);
  }, [focus, source, bookUrl, lecture]);

  if (!source && !bookUrl && !lecture) return null;
  return (
    <div className="quiz-study" id="quiz-study">
      <p className="quiz-study-label">Source materials</p>
      {source && (
        <StudyPanel
          filename={filename || 'notes.md'}
          open={notesOpen}
          onOpenChange={setNotesOpen}
        >
          <MarkdownView source={source} focusHeading={heading} />
        </StudyPanel>
      )}
      {lecture && (
        <StudyPanel
          filename={lectureFile || 'lecture.txt'}
          open={lectureOpen}
          onOpenChange={setLectureOpen}
        >
          <LectureView source={lecture} highlight={lectureQuote} />
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
