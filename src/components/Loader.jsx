import { useState, useRef } from 'react';
import { normalizeQuiz, describeJsonError } from '../lib/parseQuiz.js';
import ResumeBar from './ResumeBar.jsx';
import FileWindow from './FileWindow.jsx';
import ProgressRing from './ProgressRing.jsx';
import { SAMPLE } from '../data/sample.js';
import { COURSES, courseDecks } from '../data/catalog.js';
import { COURSE_GROUPS } from '../data/appliedClassroom.js';
import { catalogTotals, courseRollup } from '../lib/learningLog.js';
import aiFileGuide from '../data/aiFileGuide.md?raw';

function courseBlurb(course) {
  const decks = courseDecks(course);
  const ready = decks.filter((d) => d.data && Array.isArray(d.data.questions) && d.data.questions.length);
  if (course.program && !ready.length) {
    const n = (course.modules && course.modules.length) || 0;
    return n + ' module' + (n === 1 ? '' : 's') + ' · folders ready';
  }
  if (!decks.length) return 'No chapters yet.';
  const questions = ready.reduce(
    (n, deck) => n + ((deck.data && deck.data.questions && deck.data.questions.length) || 0),
    0
  );
  const qLabel = questions + ' question' + (questions === 1 ? '' : 's');
  if (Array.isArray(course.modules) && course.modules.length) {
    const mods = course.modules.map((m) => m.label).filter(Boolean).join(', ');
    return mods ? qLabel + ' · ' + mods : qLabel;
  }
  const labels = decks.map((d) => d.label).join(', ');
  return qLabel + ' · ' + labels;
}

function CourseCard({ course, onOpen, log }) {
  const roll = courseRollup(course, log);
  const ringValue = roll ? (roll.done ? roll.total : roll.seen) : 0;
  const ringMax = roll ? roll.total : 0;
  const done = !!(roll && roll.done);
  return (
    <button
      type="button"
      className={'course-card sheet' + (roll ? ' has-ring' : '') + (done ? ' is-done' : '')}
      onClick={() => onOpen(course.id)}
    >
      <div className="course-card-copy">
        <strong>{course.title}</strong>
        {course.tagline && <span className="subtitle">{course.tagline}</span>}
        <p>{done ? 'Completed' : courseBlurb(course)}</p>
      </div>
      {roll && (
        <ProgressRing value={ringValue} max={ringMax} size={72} label={course.title + ' progress'} />
      )}
      <span className="go">{done ? 'Review' : 'Open course'}</span>
    </button>
  );
}

export default function Loader({ onStart, onOpenCourse, resumePrompt, onResume, onForget, log, owner }) {
  const [over, setOver] = useState(false);
  const [error, setError] = useState(null);
  const [warn, setWarn] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);
  const totals = catalogTotals(COURSES, log);

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
      <div className="sheet welcome">
        <div className="welcome-copy">
          <h2>About</h2>
          <p>
            I built this to study for my master’s. The first version was small: paste a
            chapter into a model, get a JSON quiz, drill it until the misses came back.
            I dropped out pretty quickly. Rather than leave the work sitting there, I
            kept the site and pointed it at the real problem — closing the gaps in my
            own CS knowledge.
          </p>
          <p>
            That is what this place is now. It got a lot bigger than a quiz runner.
            TypeScript, JavaScript, and the rest of these modules are the path I am
            actually walking. Free sources, pulled into one classroom I can study.
            Anyone is welcome to use it. As of now it only tracks my progress.
          </p>
          <p>
            The graduate leftovers are still here at the bottom if you want them.
            AskGPT stays locked to my sign-in so visitors cannot run up the bill.
          </p>
        </div>
        <div className="welcome-ring">
          <ProgressRing
            value={totals.seen}
            max={totals.total}
            size={112}
            label="Overall progress"
          />
        </div>
      </div>

      <ResumeBar prompt={owner ? resumePrompt : null} onResume={onResume} onForget={onForget} />

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
            Other classes or a chapter you wrote. Drop a question file here
            or click to choose one.{' '}
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

      {COURSE_GROUPS.map((group) => {
        const list = COURSES.filter((course) => course.group === group.id);
        if (!list.length) return null;
        return (
          <section key={group.id} className="course-group">
            <h3 className="course-group-label">{group.label}</h3>
            <div className="start-grid course-grid">
              {list.map((course) => (
                <CourseCard key={course.id} course={course} onOpen={onOpenCourse} log={log} />
              ))}
            </div>
          </section>
        );
      })}

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
