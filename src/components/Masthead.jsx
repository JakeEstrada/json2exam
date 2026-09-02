export default function Masthead({ onHome }) {
  return (
    <div className="masthead">
      {onHome ? (
        <button type="button" className="wordmark wordmark-btn" onClick={onHome}>
          <span className="glyph" aria-hidden="true"></span>Json2Exam<span className="tld">.com</span>
        </button>
      ) : (
        <h1 className="wordmark"><span className="glyph" aria-hidden="true"></span>Json2Exam<span className="tld">.com</span></h1>
      )}
      {onHome && (
        <button type="button" className="btn quiet" onClick={onHome}>Home</button>
      )}
    </div>
  );
}
