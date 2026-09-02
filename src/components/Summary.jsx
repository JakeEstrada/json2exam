import { boxOf } from '../lib/leitner.js';

export default function Summary({ quiz, boxes, stats, maxBox, onAgain, onNew }) {
  const mastered = quiz.questions.filter((q) => boxOf(boxes, q) >= maxBox).length;
  const answered = stats.right + stats.wrong;
  const accuracy = answered ? Math.round((stats.right / answered) * 100) : 0;
  const missed = quiz.questions
    .filter((q) => (stats.misses[q.id] || 0) > 0)
    .sort((a, b) => (stats.misses[b.id] || 0) - (stats.misses[a.id] || 0));
  const finished = mastered === quiz.questions.length;

  return (
    <div className="sheet summary">
      <h2>{finished ? 'Every card retired.' : 'Session ended.'}</h2>
      <p>
        {finished
          ? 'You answered every question right ' + (maxBox - 1) + (maxBox - 1 === 1 ? ' time.' : ' times in a row.')
          : 'You can pick this deck up again later, or start it fresh.'}
      </p>

      <div className="figures">
        <div><b>{mastered}/{quiz.questions.length}</b><span>mastered</span></div>
        <div><b>{stats.right}</b><span>right</span></div>
        <div><b>{stats.wrong}</b><span>wrong</span></div>
        <div><b>{accuracy}%</b><span>accuracy</span></div>
      </div>

      {missed.length > 0 && (
        <div>
          <p className="sect-title">What tripped you up</p>
          <ul className="misslist">
            {missed.map((q) => (
              <li key={q.id}>
                <span className="qq">{q.text}</span>
                <span className="aa">{q.answers.map((i) => q.options[i]).join(', ')}</span>
                {' '}<span className="cnt">missed {stats.misses[q.id]}×</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="row">
        <button className="btn primary" onClick={onAgain}>Run the deck again</button>
          <button className="btn quiet" onClick={onNew}>Home</button>
      </div>
    </div>
  );
}
