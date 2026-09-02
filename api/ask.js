import { readJsonBody, runAsk } from './ask-core.js';

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

  const out = await runAsk(body);
  res.status(out.status).json(out.json);
}
