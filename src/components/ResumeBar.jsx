export default function ResumeBar({ resumable, onResume, onForget }) {
  if (!resumable) return null;
  return (
    <div className="sheet resume">
      <div>
        <div className="who">{resumable.quiz.title}</div>
        <div className="meta">
          {resumable.quiz.questions.length} questions, {resumable.mastered} already mastered
        </div>
      </div>
      <div className="row">
        <button className="btn primary" onClick={onResume}>Pick up where you left off</button>
        <button className="btn quiet" onClick={onForget}>Discard</button>
      </div>
    </div>
  );
}
