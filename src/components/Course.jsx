import { useState } from 'react';
import FileWindow from './FileWindow.jsx';
import { courseDecks } from '../data/catalog.js';

function moduleBlurb(mod) {
  const decks = (mod && mod.decks) || [];
  const questions = decks.reduce(
    (n, deck) => n + ((deck.data && deck.data.questions && deck.data.questions.length) || 0),
    0
  );
  const n = decks.length;
  const ready = decks.filter((d) => d.data && Array.isArray(d.data.questions) && d.data.questions.length).length;
  const chapters = n + ' topic' + (n === 1 ? '' : 's');
  if (!ready) return chapters + ' · folders ready';
  const qLabel = questions + ' question' + (questions === 1 ? '' : 's');
  return chapters + ' · ' + qLabel;
}

function DeckCard({ deck, onStart, onPreview }) {
  const count = deck.data && Array.isArray(deck.data.questions)
    ? deck.data.questions.length
    : 0;
  const coming = !!(deck.comingSoon || !count);

  return (
    <div className="course-card sheet">
      <strong>{deck.label}</strong>
      {deck.subtitle && <span className="subtitle">{deck.subtitle}</span>}
      <p>{coming ? 'Paste questions into quiz.json, then refresh.' : (count + ' questions')}</p>
      <div className="deck-links">
        {deck.notesFile && (
          <button
            type="button"
            className="text-link deck-file"
            onClick={() => onPreview({
              kind: 'md',
              filename: deck.notesFile,
              source: deck.notes,
            })}
          >
            {deck.notesFile}
          </button>
        )}
        {deck.bookFile && deck.bookUrl && deck.bookUrl !== deck.slidesUrl && (
          <button
            type="button"
            className="text-link deck-file"
            onClick={() => onPreview({
              kind: 'pdf',
              filename: deck.bookFile,
              url: deck.bookUrl,
            })}
          >
            {deck.bookFile}
          </button>
        )}
        {(deck.books || []).map((book) => (
          <button
            key={book.file}
            type="button"
            className="text-link deck-file"
            onClick={() => onPreview({
              kind: 'pdf',
              filename: book.file,
              url: book.url,
            })}
          >
            {book.file}
          </button>
        ))}
        {deck.slidesFile && deck.slidesUrl && (
          <button
            type="button"
            className="text-link deck-file"
            onClick={() => onPreview({
              kind: 'pdf',
              filename: deck.slidesFile,
              url: deck.slidesUrl,
            })}
          >
            {deck.slidesFile}
          </button>
        )}
        {deck.lectureFile && (
          <button
            type="button"
            className="text-link deck-file"
            onClick={() => onPreview({
              kind: 'txt',
              filename: deck.lectureFile,
              source: deck.lecture,
            })}
          >
            {deck.lectureFile}
          </button>
        )}
        {deck.lectureVideoFile && (
          <span className="deck-file">{deck.lectureVideoFile}</span>
        )}
        {deck.file && (
          <button
            type="button"
            className="text-link deck-file"
            onClick={() => onPreview({
              kind: 'json',
              filename: deck.file,
              data: deck.data,
            })}
          >
            {deck.file}
          </button>
        )}
      </div>
      {!coming && (
      <button
        type="button"
        className="go"
        onClick={() => onStart(deck.data, deck.label, {
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
        })}
      >
        Start this deck
      </button>
      )}
    </div>
  );
}

export default function Course({ course, onStart }) {
  const [preview, setPreview] = useState(null);
  const modules = Array.isArray(course.modules) && course.modules.length
    ? course.modules
    : [{ id: course.id, label: null, decks: courseDecks(course) }];
  const empty = courseDecks(course).length === 0 && !(course.modules && course.modules.length);
  const [openIds, setOpenIds] = useState(() => {
    const first = modules.find((mod) => mod.label);
    return first ? { [first.id]: true } : {};
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
      ) : modules.map((mod) => {
        const decks = (
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
            <ul className="start-grid deck-grid">
              {mod.decks.map((deck) => (
                <li key={deck.id}>
                  <DeckCard
                    deck={deck}
                    onStart={onStart}
                    onPreview={setPreview}
                  />
                </li>
              ))}
            </ul>
          </>
        );

        if (!mod.label) {
          return (
            <section key={mod.id} className="module-block">
              {decks}
            </section>
          );
        }

        return (
          <details
            key={mod.id}
            className="module-block"
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
            {decks}
          </details>
        );
      })}

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
