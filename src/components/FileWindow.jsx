import { useEffect } from 'react';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function colorJson(src) {
  const re = /("(?:\\.|[^"\\])*")\s*(:)?|\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|\b(true|false|null)\b|([{}[\],])/g;
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    out += escapeHtml(src.slice(last, m.index));
    if (m[1]) {
      const klass = m[2] ? 'j-key' : 'j-str';
      out += `<span class="${klass}">${escapeHtml(m[1])}</span>`;
      if (m[2]) out += m[2];
    } else if (m[3]) {
      out += `<span class="j-num">${m[3]}</span>`;
    } else if (m[4]) {
      out += `<span class="j-lit">${m[4]}</span>`;
    } else {
      out += `<span class="j-p">${escapeHtml(m[5])}</span>`;
    }
    last = m.index + m[0].length;
  }
  return out + escapeHtml(src.slice(last));
}

function JsonCode({ data }) {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const lines = text.split('\n');
  const html = colorJson(text).split('\n');
  const pad = String(lines.length).length;
  return (
    <pre className="ide-json" aria-label="JSON">
      {lines.map((line, i) => (
        <div className="ide-line" key={i}>
          <span className="ide-n">{String(i + 1).padStart(pad, ' ')}</span>
          <span
            className="ide-code"
            dangerouslySetInnerHTML={{ __html: html[i] || escapeHtml(line) }}
          />
        </div>
      ))}
    </pre>
  );
}

function inlineMd(s) {
  const parts = String(s).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function MarkdownView({ source }) {
  const blocks = String(source).trim().split(/\n\n+/);
  return (
    <article className="md-preview">
      {blocks.map((block, i) => {
        if (block.startsWith('# ')) return <h1 key={i}>{inlineMd(block.slice(2))}</h1>;
        if (block.startsWith('## ')) return <h2 key={i}>{inlineMd(block.slice(3))}</h2>;
        const rows = block.split('\n');
        if (rows.every((row) => row.startsWith('- '))) {
          return (
            <ul key={i}>
              {rows.map((row, j) => <li key={j}>{inlineMd(row.slice(2))}</li>)}
            </ul>
          );
        }
        return <p key={i}>{inlineMd(rows.join(' '))}</p>;
      })}
    </article>
  );
}

export default function FileWindow({ filename, kind, data, source, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="file-window-back" onClick={onClose}>
      <div
        className={'file-window is-' + kind}
        role="dialog"
        aria-label={filename}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="file-window-bar">
          <span className="file-window-tab">{filename}</span>
          <button type="button" className="file-window-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="file-window-body">
          {kind === 'json' ? <JsonCode data={data} /> : <MarkdownView source={source} />}
        </div>
      </div>
    </div>
  );
}
