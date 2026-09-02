import ResumeBar from './ResumeBar.jsx';

function openJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const tab = window.open(url, '_blank', 'noopener');
  if (!tab) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export default function Course({ course, onStart, resumable, onResume, onForget }) {
  return (
    <div>
      <ResumeBar resumable={resumable} onResume={onResume} onForget={onForget} />

      <div className="bar">
        <h2>CPSC {course.code}</h2>
      </div>

      {course.decks.length === 0 ? (
        <p className="leitner-note">No exams in this course yet.</p>
      ) : (
        <ul className="decks">
          {course.decks.map((deck) => (
            <li key={deck.id} className="deck-row">
              <button
                type="button"
                className="btn"
                onClick={() => onStart(deck.data, deck.label)}
              >
                {deck.label}
              </button>
              {deck.file && (
                <button
                  type="button"
                  className="btn quiet"
                  onClick={() => openJson(deck.data, deck.file)}
                >
                  {deck.file}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
