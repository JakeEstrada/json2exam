import { useEffect } from 'react';
import { headingId } from '../lib/parseQuiz.js';
import { MarkdownView } from './FileWindow.jsx';
import LectureView from './LectureView.jsx';
import PdfPage from './PdfPage.jsx';

export default function QuizNotes({
  source, bookUrl, lecture, focus, mode,
}) {
  const page = focus && focus.page ? focus.page : 0;
  const heading = focus && focus.heading ? focus.heading : '';
  const lectureQuote = focus && focus.lecture ? focus.lecture : '';
  const bookQuery = focus && (focus.excerpt || focus.book)
    ? [focus.excerpt, focus.book].filter(Boolean).join(' ')
    : '';
  const active = mode || (lecture && lectureQuote ? 'lecture' : source ? 'notes' : 'book');

  useEffect(() => {
    if (active !== 'notes' || !heading) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(headingId(heading));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(t);
  }, [active, heading]);

  return (
    <div className="quiz-study is-pane">
      {active === 'notes' && source && (
        <div className="quiz-notes-body">
          <MarkdownView source={source} focusHeading={heading} />
        </div>
      )}
      {active === 'lecture' && lecture && (
        <div className="quiz-notes-body">
          <LectureView source={lecture} highlight={lectureQuote} />
        </div>
      )}
      {active === 'book' && bookUrl && (
        <div className="quiz-notes-body is-pdf">
          <PdfPage url={bookUrl} page={page || 1} query={bookQuery} />
        </div>
      )}
    </div>
  );
}
