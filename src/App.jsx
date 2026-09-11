import { useState, useEffect, useRef, useCallback } from 'react';
import { LETTERS, normalizeQuiz } from './lib/parseQuiz.js';
import { boxOf, pickNext, shuffled, sameSet } from './lib/leitner.js';
import { saveSession, loadSession, clearSession } from './lib/storage.js';
import { BRAINS } from './brains/index.js';
import { findBrain } from './lib/ask.js';
import Masthead from './components/Masthead.jsx';
import Loader from './components/Loader.jsx';
import Course from './components/Course.jsx';
import QuizNotes from './components/QuizNotes.jsx';
import BoxTrack from './components/BoxTrack.jsx';
import Settings from './components/Settings.jsx';
import QuestionCard from './components/QuestionCard.jsx';
import Summary from './components/Summary.jsx';
import AskGPT from './components/AskGPT.jsx';
import SidePane, { paneTitle } from './components/SidePane.jsx';
import { COURSES, courseDecks } from './data/catalog.js';

function withLectureAudio(qz) {
  if (!qz || qz.lectureAudio) return qz;
  const decks = COURSES.flatMap(courseDecks);
  const deck = decks.find((d) => d.lectureFile && d.lectureFile === qz.lectureFile);
  if (deck && deck.lectureAudio) {
    qz.lectureAudio = deck.lectureAudio;
    qz.lectureAudioFile = deck.lectureAudioFile;
  }
  return qz;
}

const DEFAULT_SETTINGS = { maxBox: 3, shuffle: true, instant: true };

function sessionView(s) {
  if (!s || !s.quiz || !Array.isArray(s.quiz.questions)) return null;
  const maxBox = (s.settings && s.settings.maxBox) || 3;
  const mastered = s.quiz.questions.filter((q) => (s.boxes[q.id] || 1) >= maxBox).length;
  return {
    quiz: s.quiz,
    boxes: s.boxes || {},
    stats: {
      right: (s.stats && s.stats.right) || 0,
      wrong: (s.stats && s.stats.wrong) || 0,
      misses: (s.stats && s.stats.misses) || {},
    },
    settings: s.settings,
    courseId: s.courseId || null,
    mastered,
  };
}

function StudyPane({ quiz, sidePane, studyFocus, onClose, onMode }) {
  if (!sidePane) return null;
  const bookHref = quiz.bookUrl && studyFocus && studyFocus.page
    ? quiz.bookUrl + '#page=' + studyFocus.page
    : quiz.bookUrl;
  return (
    <SidePane
      title={paneTitle(sidePane)}
      ask={sidePane === 'ask'}
      mode={sidePane}
      onMode={onMode}
      onClose={onClose}
      hasNotes={!!quiz.notes}
      hasLecture={!!quiz.lecture}
      hasBook={!!quiz.bookUrl}
      bookHref={bookHref}
    >
      {sidePane !== 'ask' && (
        <QuizNotes
          source={quiz.notes}
          bookUrl={quiz.bookUrl}
          lecture={quiz.lecture}
          lectureAudio={quiz.lectureAudio}
          focus={studyFocus}
          mode={sidePane}
        />
      )}
    </SidePane>
  );
}

export default function App() {
  const [screen, setScreen] = useState('load');
  const [courseId, setCourseId] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [boxes, setBoxes] = useState({});
  const [stats, setStats] = useState({ right: 0, wrong: 0, misses: {} });
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  const [current, setCurrent] = useState(null);   // { q, order }
  const [picked, setPicked] = useState([]);
  const [phase, setPhase] = useState('answer');   // 'answer' | 'review'
  const lastIdRef = useRef(null);

  const [saved, setSaved] = useState(() => sessionView(loadSession()));
  const [studyFocus, setStudyFocus] = useState(null);
  const [sidePane, setSidePane] = useState(null);

  const deal = useCallback((qz, bx, cfg) => {
    const next = pickNext(qz.questions, bx, cfg.maxBox, lastIdRef.current);
    if (!next) { setCurrent(null); setSidePane(null); setScreen('done'); return; }
    lastIdRef.current = next.id;
    const mix = cfg.shuffle && next.type !== 'boolean';
    setCurrent({ q: next, order: mix ? shuffled(next.options.length) : next.options.map((_, i) => i) });
    setPicked([]);
    setPhase('answer');
    setStudyFocus(null);
    setSidePane((pane) => (pane === 'ask' ? 'ask' : null));
  }, []);

  function begin(qz, bx, st, cfg) {
    setQuiz(withLectureAudio(qz));
    setBoxes(bx);
    setStats(st);
    setSettings(cfg);
    setShowSettings(false);
    setStudyFocus(null);
    setSidePane(null);
    lastIdRef.current = null;
    setScreen('quiz');
    deal(qz, bx, cfg);
  }

  function startFresh(qz) {
    begin(qz, {}, { right: 0, wrong: 0, misses: {} }, settings);
  }

  function openCourse(id) {
    setCourseId(id);
    setScreen('course');
  }

  function startDeck(data, title, extra) {
    const qz = normalizeQuiz(data, title);
    if (extra && extra.notes) {
      qz.notes = extra.notes;
      qz.notesFile = extra.notesFile || 'notes.md';
    }
    if (extra && extra.bookUrl) {
      qz.bookUrl = extra.bookUrl;
      qz.bookFile = extra.bookFile || 'chapter.pdf';
    }
    if (extra && extra.lecture) {
      qz.lecture = extra.lecture;
      qz.lectureFile = extra.lectureFile || 'lecture.txt';
    }
    if (extra && extra.lectureAudio) {
      qz.lectureAudio = extra.lectureAudio;
      qz.lectureAudioFile = extra.lectureAudioFile || 'lecture.mp3';
    }
    startFresh(qz);
  }

  function persist() {
    if (!quiz) return saved;
    const state = { quiz, boxes, stats, settings, courseId };
    saveSession(state);
    const view = sessionView(state);
    setSaved(view);
    return view;
  }

  function goHome() {
    persist();
    setQuiz(null);
    setCurrent(null);
    setSidePane(null);
    setStudyFocus(null);
    setScreen('load');
  }

  function closePane() {
    setSidePane(null);
  }

  function openReference(focus) {
    setStudyFocus(focus || null);
    if (focus && focus.lecture && !(focus.page > 0) && !focus.heading) setSidePane('lecture');
    else if (focus && focus.page > 0) setSidePane('book');
    else setSidePane('notes');
  }

  function resumeSaved() {
    if (!saved) return;
    if (saved.courseId) setCourseId(saved.courseId);
    begin(saved.quiz, saved.boxes, saved.stats, saved.settings || DEFAULT_SETTINGS);
  }

  function forgetSaved() {
    clearSession();
    setSaved(null);
  }

  useEffect(() => {
    if (!quiz) return;
    const state = { quiz, boxes, stats, settings, courseId };
    saveSession(state);
    setSaved(sessionView(state));
  }, [quiz, boxes, stats, settings, courseId]);

  const check = useCallback((chosen) => {
    if (!current || phase === 'review') return;
    if (!chosen.length) return;
    const q = current.q;
    const right = sameSet(chosen, q.answers);

    setPicked(chosen);
    setPhase('review');
    setBoxes((prev) => {
      const at = prev[q.id] || 1;
      const next = right ? Math.min(at + 1, settings.maxBox) : Math.max(1, at - 1);
      return Object.assign({}, prev, { [q.id]: next });
    });
    setStats((prev) => ({
      right: prev.right + (right ? 1 : 0),
      wrong: prev.wrong + (right ? 0 : 1),
      misses: right ? prev.misses : Object.assign({}, prev.misses, { [q.id]: (prev.misses[q.id] || 0) + 1 }),
    }));
  }, [current, phase, settings.maxBox]);

  const advance = useCallback(() => {
    if (phase !== 'review') return;
    deal(quiz, boxes, settings);
  }, [phase, quiz, boxes, settings, deal]);

  function toggle(idx) {
    if (phase === 'review') return;
    const q = current.q;
    if (q.type === 'multi') {
      setPicked((prev) => (prev.indexOf(idx) === -1 ? prev.concat(idx) : prev.filter((n) => n !== idx)));
    } else if (settings.instant) {
      check([idx]);
    } else {
      setPicked([idx]);
    }
  }

  function updateSettings(patch) {
    if (patch.maxBox) {
      setBoxes((b) => {
        const clamped = {};
        Object.keys(b).forEach((k) => { clamped[k] = Math.min(b[k], patch.maxBox); });
        return clamped;
      });
    }
    setSettings((prev) => Object.assign({}, prev, patch));
  }

  useEffect(() => {
    if (!sidePane) return;
    function onKey(e) {
      if (e.key !== 'Backspace') return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
      e.preventDefault();
      setSidePane(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidePane]);

  // Keyboard: letters and digits pick, Enter checks or advances, Escape ends.
  useEffect(() => {
    if (screen !== 'quiz' || !current) return;
    function onKey(e) {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (phase === 'review') advance();
        else if (picked.length) check(picked);
        return;
      }
      if (e.key === 'Escape') { e.preventDefault(); setSidePane(null); setScreen('done'); return; }
      if (phase === 'review') { return; }

      const n = current.order.length;
      let shown = -1;
      if (/^[1-9]$/.test(e.key)) shown = Number(e.key) - 1;
      else if (/^[a-j]$/i.test(e.key)) shown = LETTERS.indexOf(e.key.toLowerCase());
      if (shown >= 0 && shown < n) {
        e.preventDefault();
        toggle(current.order[shown]);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (screen === 'load') {
    return (
      <div className="shell shell-wide">
        <Masthead />
        <Loader
          onStart={startFresh}
          onOpenCourse={openCourse}
          resumable={saved}
          onResume={resumeSaved}
          onForget={forgetSaved}
        />
      </div>
    );
  }

  if (screen === 'course') {
    const course = COURSES.find((c) => c.id === courseId) || COURSES[0];
    return (
      <div className="shell shell-wide">
        <Masthead onHome={goHome} />
        <Course
          course={course}
          onStart={startDeck}
        />
      </div>
    );
  }

  const brain = findBrain(quiz, BRAINS);
  const askProps = {
    brain,
    notes: quiz.notes,
    fill: sidePane === 'ask',
    open: sidePane === 'ask',
    hideFab: !!sidePane,
    onOpen: () => setSidePane('ask'),
    onClose: closePane,
  };

  if (screen === 'done') {
    return (
      <div className={'shell shell-wide' + (sidePane ? ' is-split' : '')}>
        <Masthead onHome={goHome} />
        <div className={'quiz-split' + (sidePane ? ' is-split' : '')}>
          <div className="quiz-main">
            <Summary
              quiz={quiz}
              boxes={boxes}
              stats={stats}
              maxBox={settings.maxBox}
              onAgain={() => begin(quiz, {}, { right: 0, wrong: 0, misses: {} }, settings)}
            />
            {(quiz.notes || quiz.lecture || quiz.bookUrl) && (
              <div className="row quiz-study-open" style={{ marginTop: '14px' }}>
                {quiz.notes && (
                  <button type="button" className="text-link" onClick={() => setSidePane('notes')}>
                    Chapter notes
                  </button>
                )}
                {quiz.lecture && (
                  <button type="button" className="text-link" onClick={() => setSidePane('lecture')}>
                    Lecture
                  </button>
                )}
                {quiz.bookUrl && (
                  <button type="button" className="text-link" onClick={() => setSidePane('book')}>
                    Book
                  </button>
                )}
              </div>
            )}
            <AskGPT {...askProps} card={null} phase="review" picked={[]} />
          </div>
          <StudyPane
            quiz={quiz}
            sidePane={sidePane}
            studyFocus={studyFocus}
            onClose={closePane}
            onMode={setSidePane}
          />
        </div>
      </div>
    );
  }

  const mastered = quiz.questions.filter((q) => boxOf(boxes, q) >= settings.maxBox).length;
  const pct = Math.round((mastered / quiz.questions.length) * 100);

  return (
    <div className={'shell shell-wide' + (sidePane ? ' is-split' : '')}>
      <Masthead onHome={goHome} />

      <div className={'quiz-split' + (sidePane ? ' is-split' : '')}>
        <div className="quiz-main">
          <div className="bar">
            <h2>{quiz.title}</h2>
            <div className="row">
              <span className="tally">
                <b>{stats.right}</b> right, <b>{stats.wrong}</b> wrong, <b>{pct}%</b> mastered
              </span>
              <button className="btn quiet" onClick={() => setShowSettings((s) => !s)}>Settings</button>
              <button className="btn quiet" onClick={() => { setSidePane(null); setScreen('done'); }}>Finish</button>
            </div>
          </div>

          {showSettings && (
            <Settings
              settings={settings}
              onChange={updateSettings}
              onReset={() => begin(quiz, {}, { right: 0, wrong: 0, misses: {} }, settings)}
              onClose={() => setShowSettings(false)}
            />
          )}

          <BoxTrack
            questions={quiz.questions}
            boxes={boxes}
            maxBox={settings.maxBox}
            currentBox={current ? boxOf(boxes, current.q) : 0}
          />

          {current && (
            <QuestionCard
              q={current.q}
              order={current.order}
              picked={picked}
              phase={phase}
              onToggle={toggle}
              onCheck={() => check(picked)}
              onOpenReference={openReference}
              hasLecture={!!quiz.lecture}
            />
          )}

          {phase === 'answer' && current && current.q.type !== 'multi' && !settings.instant && (
            <div className="row" style={{ marginTop: '14px' }}>
              <button className="btn primary" disabled={!picked.length} onClick={() => check(picked)}>Check answer</button>
            </div>
          )}

          {phase === 'review' && (
            <div className="row" style={{ marginTop: '14px' }}>
              <button className="btn primary" onClick={advance}>Next question</button>
            </div>
          )}

          <AskGPT
            {...askProps}
            card={current}
            phase={phase}
            picked={picked}
          />
        </div>

        <StudyPane
          quiz={quiz}
          sidePane={sidePane}
          studyFocus={studyFocus}
          onClose={closePane}
          onMode={setSidePane}
        />
      </div>
    </div>
  );
}
