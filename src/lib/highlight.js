const KEYWORDS = (
  'break case catch class const continue debugger default delete do else export extends'
  + ' false finally for function if import in instanceof let new null return super switch'
  + ' this throw true try typeof undefined var void while with yield async await of from as'
  + ' interface type implements enum declare namespace abstract readonly satisfies infer'
  + ' keyof never unknown any is'
).split(' ');

const KW = new Set(KEYWORDS);

export function looksLikeCode(value) {
  const s = String(value || '').trim();
  if (!s) return false;
  if (s.indexOf('\n') !== -1) return true;
  if (/^(const|let|var|function|class|if|for|while|return|import|export|interface|type)\b/.test(s)) return true;
  if (/<\/?[a-zA-Z][\w:-]*(?:\s|>|\/)/.test(s) || /<!DOCTYPE/i.test(s)) return true;
  if (/^[.#]?[a-zA-Z][\w-]*\s*\{/.test(s)) return true;
  if (/^[a-z-]+\s*:\s*[^;]+;?\s*$/i.test(s)) return true;
  if (/[{};]|=>|===|!==/.test(s) && /[A-Za-z_$]/.test(s)) return true;
  if (/^[A-Za-z_$][\w$]*\s*\(/.test(s)) return true;
  return false;
}

export function detectLanguage(source) {
  const s = String(source || '').trim();
  if (!s) return 'javascript';
  if (/^\s*</.test(s) || /<\/[a-zA-Z]/.test(s) || /<!DOCTYPE/i.test(s)) return 'html';
  if (/@(media|import|keyframes|supports)\b/.test(s)) return 'css';
  const cssy = /[{][^}]*:[^}]*[}]/.test(s) || /^[.#a-zA-Z][\w.#:[\]()-]*\s*\{/.test(s);
  const jsy = /\b(function|const|let|var|return|=>)\b/.test(s);
  if (cssy && !jsy) return 'css';
  return 'javascript';
}

export function highlightCode(source, language) {
  const lang = String(language || detectLanguage(source)).toLowerCase();
  if (lang === 'html' || lang === 'markup' || lang === 'xml') return highlightHtml(source);
  if (lang === 'css') return highlightCss(source);
  return highlightJs(source);
}

export function highlightHtml(source) {
  const src = String(source || '');
  let out = '';
  let i = 0;
  while (i < src.length) {
    if (src.startsWith('<!--', i)) {
      const end = src.indexOf('-->', i + 4);
      const close = end === -1 ? src.length : end + 3;
      out += wrap('j-cmt', src.slice(i, close));
      i = close;
      continue;
    }
    if (src[i] === '<') {
      const end = src.indexOf('>', i);
      if (end === -1) {
        out += escapeHtml(src.slice(i));
        break;
      }
      out += colorTag(src.slice(i, end + 1));
      i = end + 1;
      continue;
    }
    const next = src.indexOf('<', i);
    const chunk = next === -1 ? src.slice(i) : src.slice(i, next);
    out += escapeHtml(chunk);
    i = next === -1 ? src.length : next;
  }
  return out;
}

function colorTag(tag) {
  const m = tag.match(/^(<\/?)([a-zA-Z][\w:-]*)([\s\S]*?)(\/?>)$/);
  if (!m) return escapeHtml(tag);
  return wrap('j-p', m[1]) + wrap('j-kw', m[2]) + colorAttrs(m[3]) + wrap('j-p', m[4]);
}

function colorAttrs(rest) {
  const re = /([a-zA-Z_:][\w:.-]*)(\s*=\s*)("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|([a-zA-Z_:][\w:.-]*)/g;
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(rest))) {
    out += escapeHtml(rest.slice(last, m.index));
    if (m[4]) out += wrap('j-key', m[4]);
    else out += wrap('j-key', m[1]) + escapeHtml(m[2]) + wrap('j-str', m[3]);
    last = m.index + m[0].length;
  }
  return out + escapeHtml(rest.slice(last));
}

const CSS_VALUES = new Set(
  ('flex grid none block inline inline-block auto inherit initial unset border-box content-box '
    + 'relative absolute fixed sticky static hidden visible wrap nowrap row column '
    + 'space-between space-around space-evenly center stretch flex-start flex-end '
    + 'bold normal italic underline solid dashed dotted hidden scroll')
    .split(' ')
);

export function highlightCss(source) {
  const src = String(source || '');
  const re = /(\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|(@[a-zA-Z-]+)|(\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|vmin|vmax|ch|fr|s|ms)?\b)|([.#]?[a-zA-Z_-][\w-]*)|([{}:;,()>+~*])/g;
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    out += escapeHtml(src.slice(last, m.index));
    if (m[1]) out += wrap('j-cmt', m[0]);
    else if (m[2]) out += wrap('j-str', m[0]);
    else if (m[3]) out += wrap('j-kw', m[0]);
    else if (m[4]) out += wrap('j-num', m[0]);
    else if (m[5]) {
      const after = src.slice(m.index + m[0].length).match(/^\s*/);
      const next = src[m.index + m[0].length + (after ? after[0].length : 0)];
      if (next === ':') out += wrap('j-kw', m[0]);
      else if (CSS_VALUES.has(m[0]) || m[0][0] === '.' || m[0][0] === '#') out += wrap('j-key', m[0]);
      else out += wrap(m[0][0] === '@' ? 'j-kw' : '', m[0]);
    } else out += wrap('j-p', m[0]);
    last = m.index + m[0].length;
  }
  return out + escapeHtml(src.slice(last));
}

export function highlightJs(source) {
  const src = String(source || '');
  const re = /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`\\])*`)|('(?:\\.|[^'\\])*')|("(?:\\.|[^"\\])*")|\b(0x[\da-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|\b([A-Za-z_$][\w$]*)\b|(===|!==|=>|&&|\|\||[+\-*/%<>!=]=?|[(){}[\],.;:])/g;
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    out += escapeHtml(src.slice(last, m.index));
    if (m[1] || m[2]) out += wrap('j-cmt', m[0]);
    else if (m[3] || m[4] || m[5]) out += wrap('j-str', m[0]);
    else if (m[6]) out += wrap('j-num', m[0]);
    else if (m[7]) out += wrap(KW.has(m[7]) ? 'j-kw' : '', m[0]);
    else out += wrap('j-p', m[0]);
    last = m.index + m[0].length;
  }
  return out + escapeHtml(src.slice(last));
}

function wrap(cls, text) {
  if (!cls) return escapeHtml(text);
  return '<span class="' + cls + '">' + escapeHtml(text) + '</span>';
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function extractFence(text) {
  const src = String(text || '');
  const m = src.match(/```(?:js|javascript|ts|typescript|html|css|markup)?\s*\n?([\s\S]*?)```/);
  if (!m) return { prompt: src.trim(), code: '' };
  const prompt = src.replace(m[0], '').replace(/\n{3,}/g, '\n\n').trim();
  return { prompt, code: m[1].replace(/^\n+|\n+$/g, '') };
}
