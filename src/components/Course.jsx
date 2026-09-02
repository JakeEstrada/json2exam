import { openJson } from '../lib/openJson.js';

export default function Course({ course, onStart }) {
  return (
    <div>
      <div className="bar course-head">
        <h2>CPSC {course.code}</h2>
      </div>

      {course.decks.length === 0 ? (
        <p className="leitner-note">No exams in this course yet.</p>
      ) : (
        <ul className="start-grid deck-grid">
          {course.decks.map((deck) => (
            <li key={deck.id}>
              <div className="course-card sheet">
                <strong>{deck.label}</strong>
                <p>
                  {deck.data && deck.data.questions
                    ? `${deck.data.questions.length} questions`
                    : 'Ready to study'}
                </p>
                {deck.file && (
                  <button
                    type="button"
                    className="text-link deck-file"
                    onClick={() => openJson(deck.data, deck.file)}
                  >
                    {deck.file}
                  </button>
                )}
                <button
                  type="button"
                  className="go"
                  onClick={() => onStart(deck.data, deck.label)}
                >
                  Start this deck
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
