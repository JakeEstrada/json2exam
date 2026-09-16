const BANNER = /^=+$/;
const RULE = /^-{8,}$/;
const PROSE = /^(DESCRIPTION|COMMON MISTAKES|INTERVIEW NOTES|COMMON LEETCODE PATTERNS|TIME COMPLEXITY|PRACTICAL RULE)$/i;

function isBannerAt(lines, i) {
  return i + 2 < lines.length && BANNER.test(lines[i]) && BANNER.test(lines[i + 2]) && String(lines[i + 1] || '').trim();
}

function isRuleAt(lines, i) {
  return i + 2 < lines.length && RULE.test(lines[i]) && RULE.test(lines[i + 2]) && String(lines[i + 1] || '').trim();
}

export function listSections(source) {
  const lines = String(source || '').split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!isBannerAt(lines, i)) continue;
    out.push(lines[i + 1].trim());
    i += 2;
  }
  return out;
}

export function findSection(source, query) {
  const want = String(query || '').trim().toLowerCase();
  if (!want) return null;
  const lines = String(source || '').split(/\r?\n/);
  let parent = '';
  let parentAt = -1;
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (isBannerAt(lines, i)) {
      parent = lines[i + 1].trim();
      parentAt = i;
      if (parent.toLowerCase().indexOf(want) !== -1) {
        hits.push({ title: parent, start: i, kind: 'banner' });
      }
      i += 2;
      continue;
    }
    if (parent && isRuleAt(lines, i) && lines[i + 1].trim().toLowerCase().indexOf(want) !== -1) {
      hits.push({ title: parent + ' · ' + lines[i + 1].trim(), start: parentAt, from: i, kind: 'rule' });
      i += 2;
    }
  }
  const hit = hits[0];
  if (!hit) return null;
  const body = [];
  let i = hit.start;
  if (isBannerAt(lines, i)) {
    body.push(lines[i], lines[i + 1], lines[i + 2]);
    i += 3;
  }
  if (hit.from != null) {
    while (i < hit.from) i += 1;
  }
  while (i < lines.length) {
    if (isBannerAt(lines, i)) break;
    body.push(lines[i]);
    i += 1;
  }
  return { title: hit.title, text: body.join('\n') };
}

function looksLikeCode(line) {
  const t = line.replace(/^\s+/, '');
  if (!t) return false;
  if (/^(const|let|var|function|class|if|else|for|while|switch|return|import|export|async|await|try|catch|throw|new|typeof)\b/.test(t)) return true;
  if (/[{};=<>]|=>|\/\/|\(\)|`/.test(t)) return true;
  if (/^[A-Z][A-Za-z.]*\(/.test(t)) return true;
  return false;
}

export function sectionToMarkdown(raw) {
  const lines = String(raw || '').split(/\r?\n/);
  let i = 0;
  const out = [];
  if (isBannerAt(lines, 0)) {
    out.push('# ' + lines[1].trim(), '');
    i = 3;
  }
  let prose = true;
  let inCode = false;

  function endCode() {
    if (!inCode) return;
    out.push('```', '');
    inCode = false;
  }

  while (i < lines.length) {
    if (isBannerAt(lines, i)) break;
    if (isRuleAt(lines, i)) {
      endCode();
      const heading = lines[i + 1].trim();
      prose = PROSE.test(heading);
      out.push('', '## ' + heading, '');
      i += 3;
      continue;
    }
    const line = lines[i];
    const indented = /^ {4}/.test(line);
    const content = indented ? line.slice(4) : line;
    if (indented && !prose && (looksLikeCode(content) || inCode || content === '')) {
      if (!inCode && content) {
        out.push('```js');
        inCode = true;
      }
      if (inCode) out.push(content);
    } else {
      endCode();
      out.push(content);
    }
    i += 1;
  }
  endCode();
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function lookupCheatsheet(source, query) {
  const hit = findSection(source, query);
  if (!hit) return null;
  return {
    title: hit.title,
    markdown: sectionToMarkdown(hit.text),
  };
}
