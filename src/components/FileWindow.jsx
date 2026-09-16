import { useEffect } from 'react';
import { highlightJs, looksLikeCode } from '../lib/highlight.js';
import { headingId } from '../lib/parseQuiz.js';
import CodeBlock from './CodeBlock.jsx';
import LectureView from './LectureView.jsx';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function colorJson(src) {
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|\b(true|false|null)\b|([{}[\],])/g;
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
  const parts = String(s).split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const inner = part.slice(1, -1);
      if (looksLikeCode(inner) || /[(){};=<>]|^(const|let|var|function|typeof|return)$/.test(inner)) {
        return (
          <code
            key={i}
            className="is-js"
            dangerouslySetInnerHTML={{ __html: highlightJs(inner) }}
          />
        );
      }
      return <code key={i}>{inner}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    const link = part.match(/^\[([^\]]+)\]\([^)]+\)$/);
    if (link) return <span key={i}>{link[1]}</span>;
    return part;
  });
}

function isFence(line) {
  return line.trim().startsWith('```');
}

function isHeading(line) {
  return /^#{1,3} /.test(line);
}

function isTableRow(line) {
  return /^\s*\|.+\|\s*$/.test(line);
}

function isBullet(line) {
  return /^\s*[-*] /.test(line);
}

function isNumbered(line) {
  return /^\s*\d+\. /.test(line);
}

function splitCells(row) {
  const trimmed = row.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((c) => c.trim());
}

function isSeparatorRow(row) {
  return splitCells(row).every((c) => /^:?-{3,}:?$/.test(c));
}

function parseMd(source) {
  const lines = String(source).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }
    if (isFence(line)) {
      const lang = line.trim().replace(/^```/, '').trim();
      const body = [];
      i += 1;
      while (i < lines.length && !isFence(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: 'pre', text: body.join('\n'), lang });
      continue;
    }
    if (line.startsWith('# ')) { blocks.push({ type: 'h1', text: line.slice(2) }); i += 1; continue; }
    if (line.startsWith('## ')) { blocks.push({ type: 'h2', text: line.slice(3) }); i += 1; continue; }
    if (line.startsWith('### ')) { blocks.push({ type: 'h3', text: line.slice(4) }); i += 1; continue; }
    if (isTableRow(line)) {
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) {
        if (!isSeparatorRow(lines[i])) rows.push(splitCells(lines[i]));
        i += 1;
      }
      if (rows.length) blocks.push({ type: 'table', rows });
      continue;
    }
    if (isBullet(line)) {
      const items = [];
      while (i < lines.length && isBullet(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*] /, ''));
        i += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }
    if (isNumbered(line)) {
      const items = [];
      while (i < lines.length && isNumbered(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\. /, ''));
        i += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }
    const para = [line];
    i += 1;
    while (
      i < lines.length
      && lines[i].trim()
      && !isFence(lines[i])
      && !isHeading(lines[i])
      && !isTableRow(lines[i])
      && !isBullet(lines[i])
      && !isNumbered(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: 'p', lines: para });
  }
  return blocks;
}

export function MdInline({ source }) {
  return <>{inlineMd(source)}</>;
}

export function MarkdownView({ source, focusHeading, compact }) {
  const blocks = parseMd(source);
  const focusId = headingId(focusHeading);
  return (
    <article className={'md-preview' + (compact ? ' is-compact' : '')}>
      {blocks.map((block, i) => {
        if (block.type === 'h1' || block.type === 'h2' || block.type === 'h3') {
          const Tag = block.type;
          const id = headingId(block.text);
          const cls = focusId && id === focusId ? 'is-focus' : undefined;
          return <Tag key={i} id={id} className={cls}>{inlineMd(block.text)}</Tag>;
        }
        if (block.type === 'pre') {
          const lang = String(block.lang || '').toLowerCase();
          if (!lang || lang === 'js' || lang === 'javascript' || lang === 'ts' || lang === 'typescript') {
            return <CodeBlock key={i} code={block.text} />;
          }
          return (
            <pre key={i} className={block.lang ? 'lang-' + block.lang : undefined}>
              <code>{block.text}</code>
            </pre>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={i}>
              {block.items.map((item, j) => <li key={j}>{inlineMd(item)}</li>)}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={i}>
              {block.items.map((item, j) => <li key={j}>{inlineMd(item)}</li>)}
            </ol>
          );
        }
        if (block.type === 'table') {
          const [head, ...body] = block.rows;
          return (
            <table key={i}>
              {head && (
                <thead>
                  <tr>{head.map((cell, j) => <th key={j}>{inlineMd(cell)}</th>)}</tr>
                </thead>
              )}
              {body.length > 0 && (
                <tbody>
                  {body.map((row, r) => (
                    <tr key={r}>{row.map((cell, j) => <td key={j}>{inlineMd(cell)}</td>)}</tr>
                  ))}
                </tbody>
              )}
            </table>
          );
        }
        return (
          <p key={i}>
            {block.lines.map((row, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {inlineMd(row)}
              </span>
            ))}
          </p>
        );
      })}
    </article>
  );
}

export default function FileWindow({ filename, kind, data, source, url, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      onClose();
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey, true);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey, true);
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
          {kind === 'pdf' && url && (
            <a className="file-window-open" href={url} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          )}
          <button type="button" className="file-window-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="file-window-body">
          {kind === 'json' ? (
            <JsonCode data={data} />
          ) : kind === 'pdf' ? (
            <iframe className="pdf-frame" title={filename} src={url} />
          ) : kind === 'txt' ? (
            <LectureView source={source} />
          ) : (
            <MarkdownView source={source} />
          )}
        </div>
      </div>
    </div>
  );
}
