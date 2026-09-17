export default function ResumeBar({ prompt, onResume, onForget }) {
  if (!prompt) return null;
  return (
    <div className="sheet resume">
      <div>
        <div className="who">Start where you left off?</div>
        <div className="meta">{prompt.detail}</div>
      </div>
      <div className="row">
        <button className="btn primary" onClick={onResume}>Continue</button>
        {onForget ? (
          <button className="btn quiet" onClick={onForget}>Discard</button>
        ) : null}
      </div>
    </div>
  );
}
