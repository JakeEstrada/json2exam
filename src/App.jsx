import { useState, useEffect, useRef, useCallback } from 'react';
import { LETTERS, normalizeQuiz } from './lib/parseQuiz.js';
import { boxOf, pickNext, shuffled, sameSet } from './lib/leitner.js';
import { saveSession, loadSession, clearSession, loadOwner, saveOwner, clearOwner } from './lib/storage.js';
import { BRAINS } from './brains/index.js';
import { findBrain } from './lib/ask.js';
import Masthead from './components/Masthead.jsx';
import Loader from './components/Loader.jsx';
import Course from './components/Course.jsx';
import Lesson, { CheatsheetLookup } from './components/Lesson.jsx';
import BoxTrack from './components/BoxTrack.jsx';
import Settings from './components/Settings.jsx';
import QuestionCard from './components/QuestionCard.jsx';
import Summary from './components/Summary.jsx';
import AskGPT from './components/AskGPT.jsx';
import Login from './components/Login.jsx';
import QuizNotes from './components/QuizNotes.jsx';
import SidePane, { paneTitle } from './components/SidePane.jsx';
import { COURSES, courseDecks } from './data/catalog.js';
import publishedLog from './data/learningLog.json';
import { applySpeechRate, normalizeRate, normalizeVoice, stopSpeech } from './lib/speech.js';
import { resolveBook } from './lib/books.js';
import { formatAskNotes, resolveReading } from './lib/reading.js';
import { emptyLog, mergeLog, withDeck } from './lib/learningLog.js';

function withLectureMedia(qz) {
  if (!qz) return qz;
  const decks = COURSES.flatMap(courseDecks);
  const deck = decks.find((d) =>
    (d.lectureFile && d.lectureFile === qz.lectureFile) ||
    (d.data && d.data.title && qz.title && d.data.title === qz.title)
  );
  if (!deck) return qz;
  if (!qz.lectureAudio && deck.lectureAudio) {
    qz.lectureAudio = deck.lectureAudio;
    qz.lectureAudioFile = deck.lectureAudioFile;
  }
  if (deck.lectureVideo) {
    qz.lectureVideo = deck.lectureVideo;
    qz.lectureVideoFile = deck.lectureVideoFile;
  }
  if (deck.slidesUrl) {
    qz.slidesUrl = deck.slidesUrl;
    qz.slidesFile = deck.slidesFile;
  }
  if (deck.bookUrl) {
    qz.bookUrl = deck.bookUrl;
    qz.bookFile = deck.bookFile;
  }
  if (deck.books && deck.books.length) qz.books = deck.books;
  return qz;
}

const DEFAULT_SETTINGS = { maxBox: 3, shuffle: true, instant: true, voice: 'coral', speechRate: 1 };

function mergeSettings(raw) {
  const merged = Object.assign({}, DEFAULT_SETTINGS, raw || {});
  merged.voice = normalizeVoice(merged.voice);
  merged.speechRate = normalizeRate(merged.speechRate);
  return merged;
}

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
    codeWork: s.codeWork || {},
    mastered,
  };
}

function StudyPane({ quiz, sidePane, studyFocus, onClose, onOpenSlide }) {
  if (!sidePane) return null;
  const resolved = sidePane === 'book'
    ? (studyFocus && studyFocus.bookUrl
      ? { title: studyFocus.bookTitle || 'Book', url: studyFocus.bookUrl }
      : resolveBook(quiz, studyFocus && studyFocus.book))
    : null;
  const pdfUrl = sidePane === 'slides'
    ? quiz.slidesUrl
    : sidePane === 'book'
      ? ((resolved && resolved.url) || '')
      : '';
  const pdfPage = sidePane === 'slides'
    ? (studyFocus && studyFocus.slide)
    : (studyFocus && studyFocus.page);
  const bookHref = pdfUrl ? (pdfPage ? pdfUrl + '#page=' + pdfPage : pdfUrl) : '';
  const bookTitle = sidePane === 'book'
    ? ((studyFocus && studyFocus.chapter)
      || (resolved && resolved.title)
      || paneTitle(sidePane, quiz))
    : paneTitle(sidePane, quiz);
  return (
    <SidePane
      title={bookTitle}
      ask={sidePane === 'ask'}
      onClose={onClose}
      bookHref={bookHref}
    >
      {sidePane === 'sheet' ? (
        <div className="quiz-notes-body">
          <CheatsheetLookup source={quiz.cheatsheet} topic={quiz.sheet && quiz.sheet[0]} />
        </div>
      ) : (
        <QuizNotes
          source={quiz.notes}
          bookUrl={pdfUrl}
          bookMissing={sidePane === 'book' && !pdfUrl}
          bookWanted={studyFocus && studyFocus.book}
          slidesUrl={quiz.slidesUrl}
          lecture={quiz.lecture}
          lectureAudio={quiz.lectureAudio}
          lectureVideo={quiz.lectureVideo}
          focus={studyFocus}
          mode={sidePane}
          onOpenSlide={onOpenSlide}
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
  const [codeWork, setCodeWork] = useState({});
  const [owner, setOwner] = useState(() => loadOwner());
  const [loginOpen, setLoginOpen] = useState(false);
  const [log, setLog] = useState(() => mergeLog(emptyLog(), publishedLog));
  const logTimer = useRef(null);
  const logRef = useRef(log);
  logRef.current = log;

  const deal = useCallback((qz, bx, cfg) => {
    const next = pickNext(qz.questions, bx, cfg.maxBox, lastIdRef.current);
    if (!next) { setCurrent(null); setSidePane(null); setScreen('done'); return; }
    lastIdRef.current = next.id;
    const opts = Array.isArray(next.options) ? next.options : [];
    const mix = cfg.shuffle && next.type !== 'boolean' && next.type !== 'code' && opts.length > 1;
    setCurrent({ q: next, order: mix ? shuffled(opts.length) : opts.map((_, i) => i) });
    setPicked([]);
    setPhase('answer');
    setStudyFocus(null);
    setSidePane((pane) => (pane === 'ask' ? 'ask' : null));
  }, []);

  function begin(qz, bx, st, cfg, work, opts) {
    const ready = withLectureMedia(qz);
    setQuiz(ready);
    setBoxes(bx);
    setStats(st);
    setSettings(cfg);
    setCodeWork(work || {});
    setShowSettings(false);
    setStudyFocus(null);
    setSidePane(null);
    lastIdRef.current = null;
    const hasLesson = !!(ready.jsIntro || (ready.cheatsheet && ready.notes));
    if (!(opts && opts.skipLesson) && hasLesson && !Object.keys(bx || {}).length) {
      setCurrent(null);
      setScreen('lesson');
      return;
    }
    setScreen('quiz');
    deal(ready, bx, cfg);
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
    if (extra && extra.books) qz.books = extra.books;
    if (extra && extra.slidesUrl) {
      qz.slidesUrl = extra.slidesUrl;
      qz.slidesFile = extra.slidesFile || 'slides.pdf';
    }
    if (extra && extra.lecture) {
      qz.lecture = extra.lecture;
      qz.lectureFile = extra.lectureFile || 'lecture.txt';
    }
    if (extra && extra.lectureAudio) {
      qz.lectureAudio = extra.lectureAudio;
      qz.lectureAudioFile = extra.lectureAudioFile || 'lecture.mp3';
    }
    if (extra && extra.lectureVideo) {
      qz.lectureVideo = extra.lectureVideo;
      qz.lectureVideoFile = extra.lectureVideoFile || 'lecture.mp4';
    }
    if (extra && extra.cheatsheet) qz.cheatsheet = extra.cheatsheet;
    if (extra && extra.jsIntro) qz.jsIntro = true;
    if (extra && extra.sheet && (!qz.sheet || !qz.sheet.length)) {
      qz.sheet = [].concat(extra.sheet).filter(Boolean);
    }
    if (extra && extra.courseId) qz.courseId = extra.courseId;
    if (extra && extra.courseTitle) qz.courseTitle = extra.courseTitle;
    if (extra && extra.deckId) qz.deckId = extra.deckId;
    if (extra && extra.deckLabel) qz.deckLabel = extra.deckLabel;
    startFresh(qz);
  }

  function openModuleBook() {
    const located = resolveReading(quiz, {});
    setStudyFocus({
      book: located.book,
      page: located.page,
      pageEnd: located.pageEnd,
      chapter: located.chapter,
      bookUrl: located.bookUrl,
      bookTitle: located.bookTitle,
    });
    setSidePane('book');
  }

  function persist() {
    if (!quiz || !owner) return saved;
    const state = { quiz, boxes, stats, settings, courseId, codeWork };
    saveSession(state);
    const view = sessionView(state);
    setSaved(view);
    return view;
  }

  function signedIn(next) {
    saveOwner(next);
    setOwner(next);
    setLoginOpen(false);
  }

  function signOut() {
    clearOwner();
    setOwner(null);
  }

  function pushLog(next) {
    setLog(next);
    if (!owner || !owner.token) return;
    if (logTimer.current) clearTimeout(logTimer.current);
    logTimer.current = setTimeout(() => {
      fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + owner.token,
        },
        body: JSON.stringify(next),
      }).then((res) => res.json()).then((data) => {
        if (data && data.decks) setLog(mergeLog(emptyLog(), data));
      }).catch(() => {});
    }, 700);
  }

  function goHome() {
    stopSpeech();
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
    const next = Object.assign({}, focus || {});
    if (next.book || next.page > 0) {
      const located = resolveReading(quiz, next);
      if (located.book && !next.book) next.book = located.book;
      if (located.chapter) next.chapter = located.chapter;
      if (!(next.page > 0) && located.page) next.page = located.page;
      if (!(next.pageEnd > 0) && located.pageEnd) next.pageEnd = located.pageEnd;
      if (located.bookUrl) {
        next.bookUrl = located.bookUrl;
        next.bookTitle = located.bookTitle;
      } else {
        const found = resolveBook(quiz, next.book);
        if (found) {
          next.bookUrl = found.url;
          next.bookTitle = found.title;
        }
      }
    }
    setStudyFocus(next);
    if (next.autoSlides || next.slide > 0) {
      if (!(next.page > 0) && !next.heading && !next.book) {
        setSidePane('slides');
        return;
      }
    }
    if (next.lecture && !(next.page > 0) && !(next.slide > 0) && !next.heading && !next.book) {
      setSidePane('lecture');
      return;
    }
    if (next.page > 0 || next.book) {
      setSidePane('book');
      return;
    }
    setSidePane('notes');
  }

  function openSlide(slide, slideEnd, quote) {
    const page = Number(slide) || 0;
    const last = Number(slideEnd) || 0;
    setStudyFocus({
      slide: page,
      slideEnd: last > page ? last : 0,
      autoSlides: page < 1,
      lecture: quote || '',
    });
    setSidePane('slides');
  }

  function resumeSaved() {
    if (!saved) return;
    if (saved.courseId) setCourseId(saved.courseId);
    begin(saved.quiz, saved.boxes, saved.stats, mergeSettings(saved.settings), saved.codeWork);
  }

  function forgetSaved() {
    clearSession();
    setSaved(null);
  }

  useEffect(() => {
    fetch('/api/progress')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.owner) setLog(mergeLog(emptyLog(), data));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!quiz || !owner) return;
    const state = { quiz, boxes, stats, settings, courseId, codeWork };
    saveSession(state);
    setSaved(sessionView(state));
    pushLog(withDeck(logRef.current, {
      courseId: quiz.courseId || courseId,
      courseTitle: quiz.courseTitle || '',
      deckId: quiz.deckId,
      deckLabel: quiz.deckLabel || quiz.title,
    }, quiz, boxes, stats, settings.maxBox));
  }, [quiz, boxes, stats, settings, courseId, codeWork, owner]);

  const check = useCallback((chosen, selfRight) => {
    if (!current || phase === 'review') return;
    const q = current.q;
    const isCode = q.type === 'code';
    if (!isCode && !chosen.length) return;
    const right = isCode ? !!selfRight : sameSet(chosen, q.answers);

    setPicked(isCode ? [right ? 1 : 0] : chosen);
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

  function patchCodeWork(id, patch) {
    setCodeWork((prev) => Object.assign({}, prev, {
      [id]: Object.assign({ hints: 0, solution: false }, prev[id], patch),
    }));
  }

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
    if (patch.speechRate != null) applySpeechRate(patch.speechRate);
  }

  const advance = useCallback(() => {
    if (phase !== 'review') return;
    stopSpeech();
    deal(quiz, boxes, settings);
  }, [phase, quiz, boxes, settings, deal]);

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
      const isCode = current.q && current.q.type === 'code';

      if (e.key === 'Enter') {
        e.preventDefault();
        if (phase === 'review') advance();
        else if (!isCode && picked.length) check(picked);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showSettings) { setShowSettings(false); return; }
        stopSpeech();
        setSidePane(null);
        setScreen('done');
        return;
      }
      if (phase === 'review' || isCode) { return; }

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

  const authHead = {
    owner,
    onSignIn: () => setLoginOpen(true),
    onSignOut: signOut,
  };
  const loginUi = loginOpen ? (
    <Login onClose={() => setLoginOpen(false)} onSignedIn={signedIn} />
  ) : null;

  if (screen === 'load') {
    return (
      <div className="shell shell-wide">
        <Masthead {...authHead} />
        <Loader
          onStart={startFresh}
          onOpenCourse={openCourse}
          resumable={saved}
          onResume={resumeSaved}
          onForget={forgetSaved}
          log={log}
          owner={owner}
        />
        {loginUi}
      </div>
    );
  }

  if (screen === 'course') {
    const course = COURSES.find((c) => c.id === courseId) || COURSES[0];
    return (
      <div className="shell shell-wide">
        <Masthead onHome={goHome} {...authHead} />
        <Course
          course={course}
          onStart={startDeck}
          log={log}
        />
        {loginUi}
      </div>
    );
  }

  if (screen === 'lesson' && quiz) {
    return (
      <div className="shell shell-wide">
        <Masthead onHome={goHome} {...authHead} />
        <Lesson
          quiz={quiz}
          onStart={() => begin(quiz, {}, { right: 0, wrong: 0, misses: {} }, settings, {}, { skipLesson: true })}
          onHome={goHome}
        />
        {loginUi}
      </div>
    );
  }

  const brain = findBrain(quiz, BRAINS);
  const askProps = {
    brain,
    notes: formatAskNotes(quiz) || quiz.notes,
    fill: sidePane === 'ask',
    open: sidePane === 'ask',
    hideFab: !!sidePane,
    onOpen: () => setSidePane('ask'),
    onClose: closePane,
  };

  if (screen === 'done') {
    return (
      <div className={'shell shell-wide' + (sidePane ? ' is-split' : '')}>
        <Masthead onHome={goHome} {...authHead} />
        <div className={'quiz-split' + (sidePane ? ' is-split' : '')}>
          <div className="quiz-main">
            <Summary
              quiz={quiz}
              boxes={boxes}
              stats={stats}
              maxBox={settings.maxBox}
              onAgain={() => begin(quiz, {}, { right: 0, wrong: 0, misses: {} }, settings, {})}
            />
            {(quiz.notes || quiz.lecture || quiz.slidesUrl || quiz.bookUrl || (quiz.books && quiz.books.length)) && (
              <div className="row quiz-study-open" style={{ marginTop: '14px' }}>
                {quiz.notes && (
                  <button type="button" className="text-link" onClick={() => setSidePane('notes')}>
                    Chapter notes
                  </button>
                )}
                {quiz.cheatsheet && (
                  <button type="button" className="text-link" onClick={() => setSidePane('sheet')}>
                    Cheat sheet
                  </button>
                )}
                {quiz.lecture && (
                  <button type="button" className="text-link" onClick={() => setSidePane('lecture')}>
                    {quiz.lectureVideo ? 'Video' : 'Lecture'}
                  </button>
                )}
                {quiz.slidesUrl && (
                  <button type="button" className="text-link" onClick={() => setSidePane('slides')}>
                    Slides
                  </button>
                )}
                {(quiz.bookUrl && quiz.bookUrl !== quiz.slidesUrl || (quiz.books && quiz.books.length)) && (
                  <button type="button" className="text-link" onClick={openModuleBook}>
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
            onOpenSlide={openSlide}
          />
        </div>
        {loginUi}
      </div>
    );
  }

  const mastered = quiz.questions.filter((q) => boxOf(boxes, q) >= settings.maxBox).length;
  const pct = Math.round((mastered / quiz.questions.length) * 100);

  return (
    <div className={'shell shell-wide' + (sidePane ? ' is-split' : '')}>
      <Masthead onHome={goHome} {...authHead} />

      <div className={'quiz-split' + (sidePane ? ' is-split' : '')}>
        <div className="quiz-main">
          <div className="bar">
            <h2>{quiz.title}</h2>
            <div className="row">
              <span className="tally">
                <b>{stats.right}</b> right, <b>{stats.wrong}</b> wrong, <b>{pct}%</b> mastered
              </span>
              <button className="btn quiet" onClick={() => setShowSettings((s) => !s)}>Settings</button>
              <button className="btn quiet" onClick={() => { stopSpeech(); setSidePane(null); setScreen('done'); }}>Finish</button>
            </div>
          </div>

          {(quiz.notes || quiz.cheatsheet || quiz.lecture || quiz.slidesUrl || quiz.bookUrl || (quiz.books && quiz.books.length) || (quiz.reading && quiz.reading.length)) && (
            <div className="row quiz-study-open">
              {quiz.notes && (
                <button type="button" className="text-link" onClick={() => setSidePane('notes')}>
                  Chapter notes
                </button>
              )}
              {quiz.cheatsheet && (
                <button type="button" className="text-link" onClick={() => setSidePane('sheet')}>
                  Cheat sheet
                </button>
              )}
              {(quiz.bookUrl && quiz.bookUrl !== quiz.slidesUrl || (quiz.books && quiz.books.length) || (quiz.reading && quiz.reading.length)) && (
                <button type="button" className="text-link" onClick={openModuleBook}>
                  Book chapter
                </button>
              )}
            </div>
          )}

          {showSettings && (
            <Settings
              settings={settings}
              onChange={updateSettings}
              onReset={() => begin(quiz, {}, { right: 0, wrong: 0, misses: {} }, settings, {}, { skipLesson: true })}
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
              onAssess={(right) => check([], right)}
              onOpenReference={openReference}
              hasLecture={!!quiz.lecture}
              hasVideo={!!quiz.lectureVideo}
              hasSlides={!!quiz.slidesUrl}
              hasBook={!!(quiz.bookUrl && quiz.bookUrl !== quiz.slidesUrl) || !!(quiz.books && quiz.books.length)}
              bookReading={quiz.reading || []}
              voice={settings.voice}
              speechRate={settings.speechRate}
              codeWork={codeWork[current.q.id] || null}
              onCodeWork={(patch) => patchCodeWork(current.q.id, patch)}
            />
          )}

          {phase === 'answer' && current && current.q.type !== 'multi' && current.q.type !== 'code' && !settings.instant && (
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
          onOpenSlide={openSlide}
        />
      </div>
      {loginUi}
    </div>
  );
}
