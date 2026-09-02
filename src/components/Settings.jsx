export default function Settings({ settings, onChange, onReset, onClose }) {
  return (
    <div className="sheet panel">
      <div className="grp">
        <span>Right answers in a row before a card retires</span>
        <div className="seg">
          {[1, 2, 3, 4].map((n) => (
            <button key={n} className={settings.maxBox === n + 1 ? 'on' : ''} onClick={() => onChange({ maxBox: n + 1 })}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="grp">
        <label className="check">
          <input type="checkbox" checked={settings.shuffle} onChange={(e) => onChange({ shuffle: e.target.checked })} />
          Shuffle the answer order each time
        </label>
        <label className="check">
          <input type="checkbox" checked={settings.instant} onChange={(e) => onChange({ instant: e.target.checked })} />
          Check the answer the moment I pick one
        </label>
      </div>
      <div className="row">
        <button className="btn" onClick={onReset}>Start this deck over</button>
        <button className="btn quiet" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
