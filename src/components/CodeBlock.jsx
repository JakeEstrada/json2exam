import { detectLanguage, highlightCode } from '../lib/highlight.js';

const LANG_LABEL = {
  html: 'HTML',
  markup: 'HTML',
  xml: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
};

export default function CodeBlock({ code, compact, label, language }) {
  const text = String(code || '');
  if (!text) return null;
  const lang = String(language || detectLanguage(text)).toLowerCase();
  const lines = text.replace(/\n$/, '').split('\n');
  const html = highlightCode(text.replace(/\n$/, ''), lang).split('\n');
  const pad = String(lines.length).length;
  return (
    <pre className={'code-view' + (compact ? ' is-compact' : '')} aria-label={label || LANG_LABEL[lang] || 'Code'}>
      {lines.map((line, i) => (
        <div className="ide-line" key={i}>
          {!compact && <span className="ide-n">{String(i + 1).padStart(pad, ' ')}</span>}
          <span
            className="ide-code"
            dangerouslySetInnerHTML={{ __html: html[i] || (line ? highlightCode(line, lang) : '&nbsp;') }}
          />
        </div>
      ))}
    </pre>
  );
}
