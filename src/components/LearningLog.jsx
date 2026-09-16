function when(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (!isFinite(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LearningLog({ log }) {
  if (!log) return null;
  const working = log.workingOn;
  const decks = Object.keys(log.decks || {})
    .map((id) => log.decks[id])
    .filter(Boolean)
    .sort((a, b) => String(b.lastAt || '').localeCompare(String(a.lastAt || '')));
  const totals = decks.reduce((acc, row) => {
    acc.total += Number(row.total) || 0;
    acc.mastered += Number(row.mastered) || 0;
    return acc;
  }, { total: 0, mastered: 0 });
  const pct = totals.total ? Math.round((totals.mastered / totals.total) * 100) : 0;

  return (
    <div className="sheet learning-log">
      <div className="learning-log-head">
        <div>
          <span className="kicker">{log.owner || 'Jake'}’s log</span>
          <h2>What I’m working on</h2>
        </div>
        {log.updatedAt ? <span className="learning-updated">Updated {when(log.updatedAt)}</span> : null}
      </div>
      <p className="learning-headline">{log.headline}</p>
      <div className="learning-now">
        {working && working.deckLabel ? (
          <>
            <strong>{working.courseTitle || 'In progress'}</strong>
            <span>{working.deckLabel}{working.done ? ' · finished' : (working.pct ? ' · ' + working.pct + '%' : '')}</span>
          </>
        ) : (
          <span>Starting the JavaScript ramp. Progress shows up here after I sign in and study.</span>
        )}
      </div>
      {totals.total > 0 && (
        <div className="learning-meter" aria-label={pct + ' percent mastered'}>
          <span style={{ width: pct + '%' }} />
        </div>
      )}
      {decks.length > 0 && (
        <ul className="learning-decks">
          {decks.slice(0, 8).map((row) => (
            <li key={row.id || row.label}>
              <span className="learning-deck-name">
                {row.courseTitle ? row.courseTitle + ' · ' : ''}{row.label}
              </span>
              <span className="learning-deck-pct">
                {row.done ? 'Done' : (row.mastered || 0) + '/' + (row.total || 0)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
