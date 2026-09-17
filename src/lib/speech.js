export const QUIZ_VOICES = [
  { id: 'coral', label: 'Coral', hint: 'Warm tutor' },
  { id: 'nova', label: 'Nova', hint: 'Bright' },
  { id: 'sage', label: 'Sage', hint: 'Calm' },
  { id: 'verse', label: 'Verse', hint: 'Expressive' },
  { id: 'alloy', label: 'Alloy', hint: 'Neutral' },
  { id: 'ash', label: 'Ash', hint: 'Clear' },
  { id: 'ballad', label: 'Ballad', hint: 'Soft' },
  { id: 'echo', label: 'Echo', hint: 'Steady' },
  { id: 'fable', label: 'Fable', hint: 'Storyteller' },
  { id: 'onyx', label: 'Onyx', hint: 'Deep' },
  { id: 'shimmer', label: 'Shimmer', hint: 'Light' },
  { id: 'marin', label: 'Marin', hint: 'Crisp' },
  { id: 'cedar', label: 'Cedar', hint: 'Grounded' },
];

export const DEFAULT_VOICE = 'coral';
export const SPEECH_RATES = [0.75, 1, 1.25, 1.5, 2];

export function cardSpeechParts(q, order) {
  const parts = [];
  const title = String((q && q.text) || '').replace(/\s+/g, ' ').trim();
  if (title) parts.push({ kind: 'title', option: -1, text: title });
  (order || []).forEach((idx, i) => {
    const label = String((q && q.options && q.options[idx]) || '').replace(/\s+/g, ' ').trim();
    if (!label) return;
    parts.push({
      kind: 'option',
      option: idx,
      text: String.fromCharCode(65 + i) + '. ' + label,
    });
  });
  return parts;
}

export function spokenMd(s) {
  return String(s || '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function isFenceLine(line) {
  return String(line || '').trim().startsWith('```');
}

export function readingSpeechParts(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const parts = [];
  let i = 0;

  function push(kind, raw) {
    const text = spokenMd(raw);
    if (text) parts.push({ kind, text });
  }

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }
    if (isFenceLine(line)) {
      i += 1;
      while (i < lines.length && !isFenceLine(lines[i])) i += 1;
      if (i < lines.length) i += 1;
      continue;
    }
    if (/^#{1,3} /.test(line)) {
      push('heading', line.replace(/^#{1,3} /, ''));
      i += 1;
      continue;
    }
    if (/^\s*\|.+\|\s*$/.test(line)) {
      while (i < lines.length && /^\s*\|.+\|\s*$/.test(lines[i])) i += 1;
      continue;
    }
    if (/^\s*[-*] /.test(line)) {
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) {
        push('item', lines[i].replace(/^\s*[-*] /, ''));
        i += 1;
      }
      continue;
    }
    if (/^\s*\d+\. /.test(line)) {
      while (i < lines.length && /^\s*\d+\. /.test(lines[i])) {
        push('item', lines[i].replace(/^\s*\d+\. /, ''));
        i += 1;
      }
      continue;
    }
    const para = [line];
    i += 1;
    while (
      i < lines.length
      && lines[i].trim()
      && !isFenceLine(lines[i])
      && !/^#{1,3} /.test(lines[i])
      && !/^\s*\|.+\|\s*$/.test(lines[i])
      && !/^\s*[-*] /.test(lines[i])
      && !/^\s*\d+\. /.test(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    push('p', para.join(' '));
  }
  return parts;
}

export function normalizeRate(rate) {
  const n = Number(rate);
  if (!isFinite(n)) return 1;
  let best = 1;
  SPEECH_RATES.forEach((step) => {
    if (Math.abs(step - n) < Math.abs(best - n)) best = step;
  });
  return best;
}

export function normalizeVoice(id) {
  const want = String(id || '').trim().toLowerCase();
  return QUIZ_VOICES.some((v) => v.id === want) ? want : DEFAULT_VOICE;
}

const PREFERRED = [
  /neural/i,
  /natural/i,
  /premium/i,
  /enhanced/i,
  /google us english/i,
  /microsoft (aria|jenny|guy|andrew|emma)/i,
  /samantha/i,
  /nicky/i,
  /siri/i,
];

const AVOID = /compact|espeak|novelty|bad news|good news|jester|organ|whisper|zarvox|trinoids|boing|bubbles|albert|fred|junior|kathy|princess|ralph/i;

let currentAudio = null;
let speakGen = 0;
const clipCache = {};
const inflight = {};

function clipKey(voiceId, text) {
  return normalizeVoice(voiceId) + '\n' + String(text || '').replace(/\s+/g, ' ').trim();
}

export function speechCached(text, voiceId) {
  return !!clipCache[clipKey(voiceId, text)];
}

export function prefetchSpeech(text, voiceId) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return Promise.resolve('');
  const voice = normalizeVoice(voiceId);
  const key = clipKey(voice, clean);
  if (clipCache[key]) return Promise.resolve(clipCache[key]);
  if (inflight[key]) return inflight[key];

  inflight[key] = fetch('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: clean, voice }),
  }).then(async (res) => {
    if (!res.ok) return '';
    const blob = await res.blob();
    if (!blob || blob.size < 40) return '';
    const url = URL.createObjectURL(blob);
    clipCache[key] = url;
    return url;
  }).catch(() => '').finally(() => {
    delete inflight[key];
  });

  return inflight[key];
}

export function prefetchSpeechParts(parts, voiceId) {
  const list = (parts || []).filter((p) => p && p.text);
  if (!list.length) return Promise.resolve();
  return prefetchSpeech(list[0].text, voiceId).then(() =>
    Promise.all(list.slice(1).map((p) => prefetchSpeech(p.text, voiceId)))
  );
}

export function pickBestVoice(voices, lang) {
  const list = (voices || []).filter((v) => v && v.name);
  if (!list.length) return null;
  const want = String(lang || 'en').slice(0, 2).toLowerCase();
  const scored = list.map((v, i) => {
    const name = v.name || '';
    const local = String(v.lang || '').toLowerCase();
    let score = 0;
    if (local.indexOf(want) === 0) score += 8;
    if (local.indexOf('en-us') === 0 || local.indexOf('en_us') === 0) score += 3;
    if (v.localService === false) score += 2;
    PREFERRED.forEach((re, n) => { if (re.test(name)) score += 12 - n; });
    if (AVOID.test(name)) score -= 20;
    return { v, score, i };
  });
  scored.sort((a, b) => b.score - a.score || a.i - b.i);
  return scored[0].v;
}

function localVoices() {
  const synth = typeof window !== 'undefined' && window.speechSynthesis;
  return synth ? synth.getVoices() || [] : [];
}

export function speakLocal(text, rate) {
  const synth = typeof window !== 'undefined' && window.speechSynthesis;
  if (!synth || !text) return false;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.96 * normalizeRate(rate);
  utter.pitch = 1;
  const voice = pickBestVoice(localVoices(), 'en');
  if (voice) utter.voice = voice;
  window.setTimeout(() => synth.speak(utter), 60);
  return true;
}

export function applySpeechRate(rate) {
  if (currentAudio) currentAudio.playbackRate = normalizeRate(rate);
}

export function stopSpeech() {
  speakGen += 1;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.removeAttribute('src');
    currentAudio = null;
  }
  const synth = typeof window !== 'undefined' && window.speechSynthesis;
  if (synth) synth.cancel();
}

export function speechSupported() {
  return typeof window !== 'undefined' && (!!window.speechSynthesis || typeof Audio !== 'undefined');
}

export async function speakText(text, onEnded, voiceId, rate) {
  stopSpeech();
  if (!text) return false;
  const gen = speakGen;
  const voice = normalizeVoice(voiceId);
  const speed = normalizeRate(rate);

  try {
    const url = await prefetchSpeech(text, voice);
    if (gen !== speakGen) return false;
    if (url) {
      const audio = new Audio(url);
      audio.playbackRate = speed;
      currentAudio = audio;
      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
        if (onEnded) onEnded();
      };
      audio.onerror = () => {
        if (currentAudio === audio) currentAudio = null;
        if (!speakLocal(text, speed) && onEnded) onEnded();
      };
      await audio.play();
      return true;
    }
  } catch (err) {
    /* fall through to the device voice */
  }

  if (gen !== speakGen) return false;
  const started = speakLocal(text, speed);
  if (started && onEnded) {
    const synth = window.speechSynthesis;
    const tick = window.setInterval(() => {
      if (!synth.speaking) {
        window.clearInterval(tick);
        onEnded();
      }
    }, 250);
  }
  return started;
}
