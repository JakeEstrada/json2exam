const SCRIBE_RE = /^\(Transcribed by TurboScribe\.[^)]*\)\s*$/i;
const AUDIO_NAME_RE = /\.(mp3|wav|m4a|ogg|webm)$/i;
const CUE_RE = /^\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]\s*(.*)$/;

export function lectureSeconds(min, sec, hour) {
  const h = hour == null || hour === '' ? 0 : Number(hour) || 0;
  return h * 3600 + (Number(min) || 0) * 60 + (Number(sec) || 0);
}

export function formatLectureTime(sec) {
  const n = Math.max(0, Math.floor(Number(sec) || 0));
  const m = Math.floor(n / 60);
  const r = n % 60;
  return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
}

export function normLecture(s) {
  return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function oldParagraphs(source) {
  return String(source || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p && !SCRIBE_RE.test(p) && !AUDIO_NAME_RE.test(p));
}

export function parseLecture(source) {
  const lines = String(source || '').replace(/\r\n/g, '\n').split('\n');
  let audioFile = '';
  const cues = [];
  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line || SCRIBE_RE.test(line)) return;
    if (!cues.length && !audioFile && AUDIO_NAME_RE.test(line) && line.indexOf('[') !== 0) {
      audioFile = line;
      return;
    }
    const m = line.match(CUE_RE);
    if (m) {
      const start = m[3] != null && m[3] !== ''
        ? lectureSeconds(m[2], m[3], m[1])
        : lectureSeconds(m[1], m[2]);
      const text = (m[4] || '').trim();
      if (text) cues.push({ start, text });
      return;
    }
    if (cues.length) cues[cues.length - 1].text += ' ' + line;
  });
  if (cues.length) return { audioFile, cues };

  return {
    audioFile,
    cues: oldParagraphs(source).map((text) => ({ start: 0, text })),
  };
}

export function lectureParagraphs(source) {
  return parseLecture(source).cues.map((c) => c.text);
}

function indexesForCharSpan(parts, start, end) {
  const hits = [];
  let pos = 0;
  parts.forEach((part, i) => {
    const next = pos + part.length;
    if (next > start && pos < end) hits.push(i);
    pos = next + 1;
  });
  return hits;
}

function findSnippet(hay, q) {
  const lens = [90, 70, 50, 36, 24];
  for (let i = 0; i < lens.length; i += 1) {
    const len = lens[i];
    if (q.length < len) continue;
    const at = hay.indexOf(q.slice(0, len));
    if (at !== -1) return [at, at + len];
    if (q.length > len + 24) {
      const mid = Math.floor((q.length - len) / 3);
      const found = hay.indexOf(q.slice(mid, mid + len));
      if (found !== -1) return [found, found + len];
    }
  }
  const words = q.split(' ').filter((w) => w.length > 3);
  for (let n = 8; n >= 4; n -= 1) {
    if (words.length < n) continue;
    const run = words.slice(0, n).join(' ');
    const at = hay.indexOf(run);
    if (at !== -1) return [at, at + run.length];
    if (words.length > n + 3) {
      const later = words.slice(3, 3 + n).join(' ');
      const found = hay.indexOf(later);
      if (found !== -1) return [found, found + later.length];
    }
  }
  return null;
}

export function matchingLectureIndexes(paras, quote) {
  const texts = (paras || []).map((p) => (typeof p === 'string' ? p : (p && p.text) || ''));
  const q = normLecture(quote);
  if (!q || q.length < 16) return [];
  const parts = texts.map(normLecture);
  const hay = parts.join(' ');
  const span = findSnippet(hay, q);
  if (span) return indexesForCharSpan(parts, span[0], span[1]);

  const qWords = q.split(' ').filter((w) => w.length > 3);
  if (qWords.length < 4) return [];
  const want = {};
  qWords.forEach((w) => { want[w] = (want[w] || 0) + 1; });
  let best = 0;
  let bestStart = 0;
  let bestEnd = -1;
  const maxWin = Math.min(texts.length, Math.max(6, Math.ceil(qWords.length / 3)));
  for (let i = 0; i < parts.length; i += 1) {
    const seen = {};
    let hit = 0;
    for (let j = i; j < parts.length && j < i + maxWin; j += 1) {
      parts[j].split(' ').forEach((w) => {
        if (want[w] && !seen[w]) {
          seen[w] = 1;
          hit += 1;
        }
      });
      if (hit > best && hit >= 4) {
        best = hit;
        bestStart = i;
        bestEnd = j;
      }
    }
  }
  if (bestEnd < 0) return [];
  const out = [];
  for (let i = bestStart; i <= bestEnd; i += 1) out.push(i);
  return out;
}

export function cueTimeRange(cues, indexes) {
  if (!cues || !indexes || !indexes.length) return null;
  const first = cues[indexes[0]];
  if (!first || first.start == null) return null;
  const last = indexes[indexes.length - 1];
  const next = cues[last + 1];
  return {
    start: first.start,
    end: next && next.start > first.start ? next.start : null,
  };
}
