import { readJsonBody } from './ask-core.js';
import { runSpeak } from './speak-core.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method', detail: 'POST only.' });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (e) {
    res.status(400).json({ error: 'bad_json', detail: 'Could not parse the request body.' });
    return;
  }

  const out = await runSpeak(body);
  if (out.body) {
    res.status(out.status);
    res.setHeader('Content-Type', out.contentType || 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.send(out.body);
    return;
  }
  res.status(out.status).json(out.json);
}
