import { useState } from 'react';
import FileWindow from './FileWindow.jsx';

export default function Course({ course, onStart }) {
  const [preview, setPreview] = useState(null);

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
                    onClick={() => setPreview({
                      kind: 'json',
                      filename: deck.file,
                      data: deck.data,
                    })}
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

      {preview && (
        <FileWindow
          kind={preview.kind}
          filename={preview.filename}
          data={preview.data}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
