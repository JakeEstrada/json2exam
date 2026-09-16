import { highlightJs } from '../lib/highlight.js';

export default function CodeBlock({ code, compact, label }) {
  const text = String(code || '');
  if (!text) return null;
  const lines = text.replace(/\n$/, '').split('\n');
  const html = highlightJs(text.replace(/\n$/, '')).split('\n');
  const pad = String(lines.length).length;
  return (
    <pre className={'code-view' + (compact ? ' is-compact' : '')} aria-label={label || 'JavaScript'}>
      {lines.map((line, i) => (
        <div className="ide-line" key={i}>
          {!compact && <span className="ide-n">{String(i + 1).padStart(pad, ' ')}</span>}
          <span
            className="ide-code"
            dangerouslySetInnerHTML={{ __html: html[i] || (line ? highlightJs(line) : '&nbsp;') }}
          />
        </div>
      ))}
    </pre>
  );
}
