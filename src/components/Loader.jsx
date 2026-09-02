import { useState, useRef } from 'react';
import { normalizeQuiz, describeJsonError } from '../lib/parseQuiz.js';
import ResumeBar from './ResumeBar.jsx';
import FileWindow from './FileWindow.jsx';
import { SAMPLE } from '../data/sample.js';
import { COURSES } from '../data/catalog.js';
import aiFileGuide from '../data/aiFileGuide.md?raw';

function courseBlurb(course) {
  if (!course.decks.length) return 'No chapters yet.';
  const questions = course.decks.reduce(
    (n, deck) => n + ((deck.data && deck.data.questions && deck.data.questions.length) || 0),
    0
  );
  const labels = course.decks.map((d) => d.label).join(', ');
  return `${questions} question${questions === 1 ? '' : 's'} · ${labels}`;
}

export default function Loader({ onStart, onOpenCourse, resumable, onResume, onForget }) {
  const [over, setOver] = useState(false);
  const [error, setError] = useState(null);
  const [warn, setWarn] = useState(null);
  const [preview, setPreview] = useState(null);
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
    reader.onerror = () => setError({ head: 'That file could not be read.', detail: ['Try another file.'] });
    reader.readAsText(file);
  }

  return (
    <div className="landing">
      <ResumeBar resumable={resumable} onResume={onResume} onForget={onForget} />

      <div className="sheet welcome">
        <p>
          Hey everyone — this is a study / exam prep tool for the CSUF 2028 cohort.
          I built it so we can drill questions for <strong>CPSC 541</strong> and <strong>CPSC 544</strong>,
          and I want a deck for each chapter as we go through the program.
        </p>
        <p>
          It uses a Leitner system: a right answer moves a card up a box, a miss sends it back to box 1,
          and the next question is always taken from the lowest box still in play. There is also a small
          LLM helper on a deck (AskGPT) so you can ask why something is wrong without leaving the page.
          I would like that for both classes, chapter by chapter.
        </p>
        <p>
          The project is open source. I shared the{' '}
          <a href="https://github.com/JakeEstrada/json2exam" target="_blank" rel="noreferrer">GitHub repo</a>
          {' '}in Discord — add a chapter, fix something, or just mess around with the code. Thanks, guys!
        </p>
      </div>

      <div className="start-grid">
        {COURSES.map((course) => (
          <button
            key={course.id}
            type="button"
            className="course-card sheet"
            onClick={() => onOpenCourse(course.id)}
          >
            <strong>CPSC {course.code}</strong>
            {course.title && <span className="subtitle">{course.title}</span>}
            <p>{courseBlurb(course)}</p>
            <span className="go">Open course</span>
          </button>
        ))}
      </div>

      <div
        className={'upload-panel sheet' + (over ? ' is-over' : '')}
        role="button"
        tabIndex={0}
        onClick={() => fileRef.current && fileRef.current.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileRef.current && fileRef.current.click();
          }
        }}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          readFile(e.dataTransfer.files && e.dataTransfer.files[0]);
        }}
      >
        <div className="upload-copy">
          <strong>Upload JSON</strong>
          <p>
            Use this for anything else you want to study — another class, a chapter you wrote,
            notes from a friend. Drop a question file here, or click to choose one. It stays
            in this browser.{' '}
            <a
              href="example.json"
              className="text-link"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPreview({ kind: 'json', filename: 'example.json', data: SAMPLE });
              }}
            >
              example.json
            </a>
          </p>
          <a
            href="how-to-get-quick-json-files.md"
            className="text-link orange-link"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPreview({
                kind: 'md',
                filename: 'how-to-get-quick-json-files.md',
                source: aiFileGuide,
              });
            }}
          >
            how to get quick json files
          </a>
        </div>
        <span className="go">Choose a file</span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json,text/plain"
        style={{ display: 'none' }}
        onChange={(e) => { readFile(e.target.files && e.target.files[0]); e.target.value = ''; }}
      />

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

      {preview && (
        <FileWindow
          kind={preview.kind}
          filename={preview.filename}
          data={preview.data}
          source={preview.source}
          onClose={() => setPreview(null)}
        />
      )}

    </div>
  );
}
