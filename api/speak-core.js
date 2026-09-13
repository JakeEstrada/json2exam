import { DEFAULT_VOICE, normalizeVoice } from '../src/lib/speech.js';

const MAX_CHARS = 4000;
const DEFAULT_MODEL = 'gpt-4o-mini-tts';
const INSTRUCTIONS = 'Speak like a clear, warm college tutor reading a quiz out loud. Natural pacing and emphasis. Do not sound robotic.';

export async function runSpeak(body) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return { status: 501, json: { error: 'missing_key', detail: 'Add OPENAI_API_KEY to .env and restart.' } };
  }

  const text = String((body && body.text) || '').replace(/\s+/g, ' ').trim();
  if (!text) {
    return { status: 400, json: { error: 'empty', detail: 'Nothing to read.' } };
  }

  const input = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
  const voice = normalizeVoice((body && body.voice) || process.env.OPENAI_TTS_VOICE || DEFAULT_VOICE);
  const model = String(process.env.OPENAI_TTS_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL;

  try {
    const audio = await requestSpeech(key, { model, voice, input, instructions: INSTRUCTIONS });
    if (audio) return audio;
    const fallback = await requestSpeech(key, { model: 'tts-1-hd', voice: voice === 'coral' ? 'nova' : voice, input });
    if (fallback) return fallback;
    return { status: 502, json: { error: 'upstream', detail: 'Voice request failed.' } };
  } catch (err) {
    return { status: 502, json: { error: 'upstream', detail: (err && err.message) || 'Voice request failed.' } };
  }
}

async function requestSpeech(key, payload) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) return null;
  return { status: 200, body: buf, contentType: res.headers.get('content-type') || 'audio/mpeg' };
}
