import { readJsonBody } from './ask-core.js';
import { bearerToken, runProgressGet, runProgressPost } from './owner-core.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const out = runProgressGet(bearerToken(req));
    res.status(out.status).json(out.json);
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method', detail: 'GET or POST.' });
    return;
  }
  let body;
  try {
    body = await readJsonBody(req);
  } catch (e) {
    res.status(400).json({ error: 'bad_json', detail: 'Could not parse the request body.' });
    return;
  }
  const out = runProgressPost(body, bearerToken(req));
  res.status(out.status).json(out.json);
}
