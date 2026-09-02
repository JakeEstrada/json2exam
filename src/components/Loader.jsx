import { useState, useRef } from 'react';
import { normalizeQuiz, describeJsonError } from '../lib/parseQuiz.js';
import ResumeBar from './ResumeBar.jsx';
import { SAMPLE_SNIPPET, PASTE_PLACEHOLDER } from '../data/sample.js';

export default function Loader({ onStart, onOpenCourse, resumable, onResume, onForget }) {
  const [over, setOver] = useState(false);
  const [error, setError] = useState(null);
  const [warn, setWarn] = useState(null);
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState('');
  const fileRef = useRef(null);

  function accept(text, name) {
    setError(null);
    setWarn(null);
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      setError({ head: 'That text is not valid JSON.', detail: [describeJsonError(e, text)] });
      return;
    }
    let quiz;
    try {
      quiz = normalizeQuiz(data, name ? name.replace(/\.json$/i, '') : null);
    } catch (e) {
      setError({ head: 'The JSON parsed, but it is not a question bank.', detail: [e.message] });
      return;
    }
    if (quiz.skipped.length) { setWarn({ list: quiz.skipped, quiz }); return; }
    onStart(quiz);
  }

  function readFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => accept(String(reader.result), file.name);
    reader.onerror = () => setError({ head: 'That file could not be read.', detail: ['Try opening it and pasting the text instead.'] });
    reader.readAsText(file);
  }

  return (
    <div>
      <ResumeBar resumable={resumable} onResume={onResume} onForget={onForget} />

      <div className="stack">
        <div className="leaf one" aria-hidden="true"></div>
        <div className="leaf two" aria-hidden="true"></div>
        <button
          type="button"
          className={'drop' + (over ? ' is-over' : '')}
          onClick={() => fileRef.current && fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            readFile(e.dataTransfer.files && e.dataTransfer.files[0]);
          }}
        >
          <h2>Upload your own question file</h2>
          <p>
            Drop a JSON file from your computer, or click to choose one. The file is read
            in this browser only. It is not uploaded or stored on a server, so your questions
            stay on your PC.
          </p>
          <span className="cue">or choose a file</span>
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json,text/plain"
        style={{ display: 'none' }}
        onChange={(e) => { readFile(e.target.files && e.target.files[0]); e.target.value = ''; }}
      />

      <p className="leitner-note">
        Right answers move a card up a box. Misses return to box 1. The next question
        is taken from the lowest box still in play.
      </p>

      <div className="row">
        <button className="btn primary" onClick={() => onOpenCourse('541')}>CPSC 541</button>
        <button className="btn" onClick={() => onOpenCourse('544')}>CPSC 544</button>
        <button type="button" className="text-link" onClick={() => setPasting((p) => !p)}>
          {pasting ? 'Hide' : 'Load your own questions'}
        </button>
      </div>

      {pasting && (
        <div>
          <textarea
            className="paste-area"
            value={pasted}
            spellCheck="false"
            placeholder={PASTE_PLACEHOLDER}
            onChange={(e) => setPasted(e.target.value)}
          />
          <div className="row">
            <button className="btn primary" disabled={!pasted.trim()} onClick={() => accept(pasted, 'Pasted deck')}>
              Load these questions
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="notice">
          <strong>{error.head}</strong>
          <ul>{error.detail.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </div>
      )}

      {warn && (
        <div className="notice warn">
          <strong>
            {warn.list.length} question{warn.list.length > 1 ? 's' : ''} could not be read.
            The other {warn.quiz.questions.length} are ready.
          </strong>
          <ul>{warn.list.slice(0, 6).map((d, i) => <li key={i}>{d}</li>)}</ul>
          {warn.list.length > 6 && <p style={{ margin: '8px 0 0' }}>…and {warn.list.length - 6} more.</p>}
          <div className="row" style={{ marginTop: '12px' }}>
            <button className="btn primary" onClick={() => onStart(warn.quiz)}>
              Study the {warn.quiz.questions.length} that loaded
            </button>
          </div>
        </div>
      )}

      <details className="spec">
        <summary>What the file should look like</summary>
        <div className="spec-body">
          <pre className="sample">{SAMPLE_SNIPPET}</pre>
        </div>
      </details>
    </div>
  );
}
