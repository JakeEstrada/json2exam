const KEYWORDS = (
  'break case catch class const continue debugger default delete do else export extends'
  + ' false finally for function if import in instanceof let new null return super switch'
  + ' this throw true try typeof undefined var void while with yield async await of from as'
).split(' ');

const KW = new Set(KEYWORDS);

export function looksLikeCode(value) {
  const s = String(value || '').trim();
  if (!s) return false;
  if (s.indexOf('\n') !== -1) return true;
  if (/^(const|let|var|function|class|if|for|while|return|import|export)\b/.test(s)) return true;
  if (/[{};]|=>|===|!==/.test(s) && /[A-Za-z_$]/.test(s)) return true;
  if (/^[A-Za-z_$][\w$]*\s*\(/.test(s)) return true;
  return false;
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
  const m = src.match(/```(?:js|javascript|ts|typescript)?\s*\n?([\s\S]*?)```/);
  if (!m) return { prompt: src.trim(), code: '' };
  const prompt = src.replace(m[0], '').replace(/\n{3,}/g, '\n\n').trim();
  return { prompt, code: m[1].replace(/^\n+|\n+$/g, '') };
}
