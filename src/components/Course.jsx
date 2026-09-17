import { useState } from 'react';
import FileWindow from './FileWindow.jsx';
import { courseDecks } from '../data/catalog.js';
import ProgressRing from './ProgressRing.jsx';
import { deckDone } from '../lib/learningLog.js';

function isReady(deck) {
  return !!(deck && deck.data && Array.isArray(deck.data.questions) && deck.data.questions.length);
}

function moduleBlurb(mod) {
  const decks = (mod && mod.decks) || [];
  const questions = decks.reduce(
    (n, deck) => n + ((deck.data && deck.data.questions && deck.data.questions.length) || 0),
    0
  );
  const n = decks.length;
  const ready = decks.filter(isReady).length;
  const chapters = n + ' topic' + (n === 1 ? '' : 's');
  if (!ready) return chapters + ' · coming next';
  const qLabel = questions + ' question' + (questions === 1 ? '' : 's');
  return ready + ' of ' + n + ' · ' + qLabel;
}

function moduleDone(mod, log) {
  const ready = ((mod && mod.decks) || []).filter(isReady);
  return ready.length > 0 && ready.every((d) => deckDone(log && log.decks && log.decks[d.id]));
}

function uniqueBooks(course) {
  const seen = new Map();
  function add(book) {
    if (!book || !book.url) return;
    const key = book.url || book.file || book.title;
    if (!seen.has(key)) seen.set(key, book);
  }
  (course.books || []).forEach(add);
  courseDecks(course).forEach((deck) => {
    if (deck.bookFile && deck.bookUrl && deck.bookUrl !== deck.slidesUrl) {
      add({ title: deck.bookFile.replace(/\.pdf$/i, ''), file: deck.bookFile, url: deck.bookUrl });
    }
    (deck.books || []).forEach(add);
  });
  return [...seen.values()];
}

function startExtra(deck, course) {
  return {
    notes: deck.notes,
    notesFile: deck.notesFile,
    bookFile: deck.bookFile,
    bookUrl: deck.bookUrl,
    books: deck.books,
    slidesFile: deck.slidesFile,
    slidesUrl: deck.slidesUrl,
    lecture: deck.lecture,
    lectureFile: deck.lectureFile,
    lectureAudio: deck.lectureAudio,
    lectureAudioFile: deck.lectureAudioFile,
    lectureVideo: deck.lectureVideo,
    lectureVideoFile: deck.lectureVideoFile,
    cheatsheet: deck.cheatsheet,
    sheet: deck.sheet,
    jsIntro: deck.jsIntro,
    tsIntro: deck.tsIntro,
    courseId: course && course.id,
    courseTitle: course && course.title,
    deckId: deck.id,
    deckLabel: deck.label,
  };
}

export function deckLaunchExtra(deck, course) {
  return startExtra(deck, course);
}

function DeckCard({ deck, onStart, onPreview, step, ramp, course, progress, showProgress }) {
  const count = deck.data && Array.isArray(deck.data.questions)
    ? deck.data.questions.length
    : 0;
  const coming = !!(deck.comingSoon || !count);
  const files = [];
  if (!ramp) {
    if (deck.notesFile && deck.notes) {
      files.push({
        key: 'notes',
        label: deck.notesFile,
        onClick: () => onPreview({ kind: 'md', filename: deck.notesFile, source: deck.notes }),
      });
    }
    if (deck.slidesFile && deck.slidesUrl) {
      files.push({
        key: 'slides',
        label: deck.slidesFile,
        onClick: () => onPreview({ kind: 'pdf', filename: deck.slidesFile, url: deck.slidesUrl }),
      });
    }
    if (deck.lectureFile) {
      files.push({
        key: 'lecture',
        label: deck.lectureFile,
        onClick: () => onPreview({ kind: 'txt', filename: deck.lectureFile, source: deck.lecture }),
      });
    }
    if (deck.lectureVideoFile) {
      files.push({ key: 'video', label: deck.lectureVideoFile });
    }
    if (deck.file && deck.data) {
      files.push({
        key: 'quiz',
        label: deck.file,
        onClick: () => onPreview({ kind: 'json', filename: deck.file, data: deck.data }),
      });
    }
  }

  const seen = showProgress ? ((progress && progress.seen) || 0) : 0;
  const total = (progress && progress.total) || count;
  const done = !!(showProgress && deckDone(progress));

  return (
    <div className={'course-card sheet' + (coming ? ' is-later' : '') + (ramp ? ' is-ramp' : '') + (showProgress && !coming ? ' has-ring' : '') + (done ? ' is-done' : '')}>
      <div className="course-card-copy">
        {step ? <span className="kicker">Step {step}</span> : null}
        <strong>{deck.label}</strong>
        {deck.subtitle && !ramp && !coming ? <span className="subtitle">{deck.subtitle}</span> : null}
        <p>
          {coming
            ? 'Coming next'
            : (done
              ? 'Completed'
              : (showProgress && seen
                ? (seen + ' of ' + total + ' seen')
                : (ramp ? 'Lesson, then practice' : (count + ' questions'))))}
        </p>
      </div>
      {showProgress && !coming && (
        <ProgressRing
          value={done ? total : seen}
          max={total}
          size={64}
          label={deck.label + ' progress'}
        />
      )}
      {files.length > 0 && (
        <div className="deck-links">
          {files.map((file) => (
            file.onClick ? (
              <button
                key={file.key}
                type="button"
                className="text-link deck-file"
                onClick={file.onClick}
              >
                {file.label}
              </button>
            ) : (
              <span key={file.key} className="deck-file">{file.label}</span>
            )
          ))}
        </div>
      )}
      {!coming && (
        <button
          type="button"
          className="go"
          onClick={() => onStart(deck.data, deck.label, startExtra(deck, course))}
        >
          {done ? 'Review' : (ramp ? 'Learn' : 'Start this deck')}
        </button>
      )}
    </div>
  );
}

function Resources({ books, onPreview }) {
  if (!books.length) return null;
  return (
    <details className="module-block resources-block">
      <summary className="module-head">
        <span className="module-caret" aria-hidden="true" />
        <h3>Resources</h3>
        <span className="module-meta">{books.length} book{books.length === 1 ? '' : 's'}</span>
      </summary>
      <ul className="resource-list">
        {books.map((book) => (
          <li key={book.url || book.file}>
            <button
              type="button"
              className="text-link"
              onClick={() => onPreview({
                kind: 'pdf',
                filename: book.file || (book.title + '.pdf'),
                url: book.url,
              })}
            >
              {book.title || book.file}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}

function DeckGrid({ decks, onStart, onPreview, ramp, numbered, course, log, showProgress }) {
  return (
    <ul className="start-grid deck-grid">
      {decks.map((deck, i) => (
        <li key={deck.id}>
          <DeckCard
            deck={deck}
            onStart={onStart}
            onPreview={onPreview}
            step={numbered ? i + 1 : 0}
            ramp={ramp}
            course={course}
            progress={showProgress && log && log.decks ? log.decks[deck.id] : null}
            showProgress={showProgress}
          />
        </li>
      ))}
    </ul>
  );
}

export default function Course({ course, onStart, log }) {
  const [preview, setPreview] = useState(null);
  const showProgress = !!log;
  const modules = Array.isArray(course.modules) && course.modules.length
    ? course.modules
    : [{ id: course.id, label: null, decks: courseDecks(course) }];
  const empty = courseDecks(course).length === 0 && !(course.modules && course.modules.length);
  const books = uniqueBooks(course);
  const rampCourse = course.id === 'js' || course.id === 'ts';
  const [openIds, setOpenIds] = useState(() => {
    const first = modules.find((mod) => mod.label && (mod.decks || []).some(isReady));
    const fallback = modules.find((mod) => mod.label);
    const pick = first || fallback;
    return pick ? { [pick.id]: true } : {};
  });

  function setModuleOpen(id, open) {
    setOpenIds((prev) => {
      if (!!prev[id] === open) return prev;
      return Object.assign({}, prev, { [id]: open });
    });
  }

  return (
    <div>
      <div className="bar course-head">
        <h2>{course.title}</h2>
        {course.tagline && <p>{course.tagline}</p>}
      </div>

      {empty ? (
        <p className="leitner-note">No exams in this course yet.</p>
      ) : (
        <>
          <Resources books={books} onPreview={setPreview} />
          {modules.map((mod) => {
            const ramp = rampCourse && mod.label === 'Language';
            const ready = (mod.decks || []).filter(isReady);
            const later = (mod.decks || []).filter((d) => !isReady(d));
            const finished = showProgress && moduleDone(mod, log);
            const body = (
              <>
                {mod.overviewFile && (
                  <div className="module-tools">
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => setPreview({
                        kind: 'md',
                        filename: mod.overviewFile,
                        source: mod.overview,
                      })}
                    >
                      {mod.overviewFile}
                    </button>
                  </div>
                )}
                <DeckGrid
                  decks={ready.length ? ready : later}
                  onStart={onStart}
                  onPreview={setPreview}
                  ramp={ramp}
                  numbered={ramp && ready.length > 0}
                  course={course}
                  log={log}
                  showProgress={showProgress}
                />
                {ready.length > 0 && later.length > 0 && (
                  <details className="later-topics">
                    <summary className="later-head">
                      Later topics
                      <span>{later.length}</span>
                    </summary>
                    <DeckGrid
                      decks={later}
                      onStart={onStart}
                      onPreview={setPreview}
                      ramp={ramp}
                      course={course}
                      log={log}
                      showProgress={showProgress}
                    />
                  </details>
                )}
              </>
            );

            if (!mod.label) {
              return (
                <section key={mod.id} className={'module-block' + (finished ? ' is-done' : '')}>
                  {body}
                </section>
              );
            }

            return (
              <details
                key={mod.id}
                className={'module-block' + (finished ? ' is-done' : '')}
                open={!!openIds[mod.id]}
              >
                <summary
                  className="module-head"
                  onClick={(e) => {
                    e.preventDefault();
                    setModuleOpen(mod.id, !openIds[mod.id]);
                  }}
                >
                  <span className="module-caret" aria-hidden="true" />
                  <h3>{mod.label}</h3>
                  <span className="module-meta">{moduleBlurb(mod)}</span>
                </summary>
                {body}
              </details>
            );
          })}
        </>
      )}

      {preview && (
        <FileWindow
          kind={preview.kind}
          filename={preview.filename}
          data={preview.data}
          source={preview.source}
          url={preview.url}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
