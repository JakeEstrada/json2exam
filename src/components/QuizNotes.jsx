import { useEffect, useMemo } from 'react';
import { headingId } from '../lib/parseQuiz.js';
import { slideHighlightQuery } from '../lib/slides.js';
import { readingSpeechParts } from '../lib/speech.js';
import { MarkdownView } from './FileWindow.jsx';
import LectureView from './LectureView.jsx';
import PdfPage from './PdfPage.jsx';
import SpeechTools, { useSpeechReader } from './SpeechTools.jsx';

export default function QuizNotes({
  source, bookUrl, bookMissing, bookWanted, slidesUrl, lecture, lectureAudio, lectureVideo, focus, mode, onOpenSlide,
  voice, speechRate,
}) {
  const page = focus && focus.page ? focus.page : 0;
  const pageEnd = focus && focus.pageEnd ? focus.pageEnd : 0;
  const chapter = focus && focus.chapter ? focus.chapter : '';
  const slide = focus && focus.slide ? focus.slide : 0;
  const slideEnd = focus && focus.slideEnd ? focus.slideEnd : 0;
  const heading = focus && focus.heading ? focus.heading : '';
  const lectureQuote = focus && focus.lecture ? focus.lecture : '';
  const bookQuery = focus && (focus.excerpt || focus.book)
    ? [focus.excerpt, focus.book].filter(Boolean).join(' ')
    : '';
  const slideQuery = [focus && focus.excerpt, slideHighlightQuery(lectureQuote)]
    .filter(Boolean)
    .join(' ');
  const active = mode
    || (slidesUrl && slide ? 'slides' : lecture && lectureQuote ? 'lecture' : source ? 'notes' : 'book');
  const noteParts = useMemo(
    () => (active === 'notes' && source ? readingSpeechParts(source) : []),
    [active, source]
  );
  const speech = useSpeechReader(noteParts, voice, speechRate);

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
          <div className="quiz-notes-speak">
            <SpeechTools
              parts={noteParts}
              on={speech.on}
              wait={speech.wait}
              onToggle={() => (speech.on ? speech.stop() : speech.playFrom(speech.at))}
              onStep={speech.step}
            />
          </div>
          <MarkdownView source={source} focusHeading={heading} spokenIndex={speech.spoken ? speech.at : -1} />
        </div>
      )}
      {active === 'lecture' && lecture && (
        <div className="quiz-notes-body is-lecture">
          <LectureView
            source={lecture}
            highlight={lectureQuote}
            audioUrl={lectureAudio}
            videoUrl={lectureVideo}
            onOpenSlide={onOpenSlide}
          />
        </div>
      )}
      {active === 'slides' && slidesUrl && (
        <div className="quiz-notes-body is-pdf">
          <PdfPage
            url={slidesUrl}
            page={slide}
            pageEnd={slideEnd}
            query={slideQuery}
            label="Slide"
            stack
            auto={!slide}
          />
        </div>
      )}
      {active === 'slides' && !slidesUrl && (
        <div className="quiz-notes-body">
          <p className="pdf-page-status">Slides are not available for this deck.</p>
        </div>
      )}
      {active === 'book' && bookUrl && (
        <div className="quiz-notes-body is-pdf">
          {chapter && (
            <p className="pdf-chapter-label">
              {chapter}{heading ? ' · ' + heading : ''}{page ? ' · PDF p. ' + page : ''}
            </p>
          )}
          <PdfPage url={bookUrl} page={page || 1} pageEnd={pageEnd} query={bookQuery} label="Page" />
        </div>
      )}
      {active === 'book' && !bookUrl && (
        <div className="quiz-notes-body">
          <p className="pdf-page-status">
            {bookWanted
              ? 'No local PDF matched “' + bookWanted + '”. The quiz still works; add the file under this course’s sources folder.'
              : (bookMissing
                ? 'This book is not available in the local sources folder. The quiz still works.'
                : 'Book is not available for this deck.')}
          </p>
        </div>
      )}
    </div>
  );
}
