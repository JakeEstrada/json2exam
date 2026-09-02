import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ASK_INSTRUCTIONS, buildAskPrompt, historyText } from '../src/lib/askContext.js';

const DEFAULT_MODEL = 'gpt-4o-mini';

export async function runAsk(body) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return { status: 501, json: { error: 'missing_key', detail: 'Add OPENAI_API_KEY to .env and restart the dev server.' } };
  }

  const message = String((body && body.message) || '').trim();
  if (!message) {
    return { status: 400, json: { error: 'empty', detail: 'Type a question first.' } };
  }

  const prompt = [
    historyText(body && body.history),
    buildAskPrompt({
      message,
      phase: body && body.phase,
      card: body && body.card,
    }),
  ].filter(Boolean).join('\n\n');

  const modelId = String(process.env.OPENAI_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL;

  try {
    const { text } = await generateText({
      model: openai(modelId),
      instructions: ASK_INSTRUCTIONS,
      prompt,
    });
    return { status: 200, json: { text: String(text || '').trim() } };
  } catch (err) {
    const detail = (err && err.message) ? String(err.message) : 'The model request failed.';
    return { status: 502, json: { error: 'upstream', detail } };
  }
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}
