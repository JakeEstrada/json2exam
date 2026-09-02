import ResumeBar from './ResumeBar.jsx';
import { openJson } from '../lib/openJson.js';

export default function Course({ course, onStart, resumable, onResume, onForget }) {
  return (
    <div>
      <ResumeBar resumable={resumable} onResume={onResume} onForget={onForget} />

      <div className="bar course-head">
        <h2>CPSC {course.code}</h2>
        {course.title && <p>{course.title}</p>}
      </div>

      {course.decks.length === 0 ? (
        <p className="leitner-note">No exams in this course yet.</p>
      ) : (
        <ul className="start-grid deck-grid">
          {course.decks.map((deck) => (
            <li key={deck.id}>
              <div className="course-card sheet">
                <span className="kicker">CPSC {course.code}</span>
                <strong>{deck.label}</strong>
                <p>
                  {deck.data && deck.data.questions
                    ? `${deck.data.questions.length} questions`
                    : 'Ready to study'}
                </p>
                <div className="card-actions">
                  <button
                    type="button"
                    className="go"
                    onClick={() => onStart(deck.data, deck.label)}
                  >
                    Start this deck
                  </button>
                  {deck.file && (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => openJson(deck.data, deck.file)}
                    >
                      {deck.file}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
