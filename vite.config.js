import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readJsonBody, runAsk } from './api/ask-core.js';

function askApiPlugin() {
  return {
    name: 'ask-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url || '').split('?')[0];
        if (path !== '/api/ask') return next();

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'method', detail: 'POST only.' }));
          return;
        }

        try {
          const body = await readJsonBody(req);
          const out = await runAsk(body);
          res.statusCode = out.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(out.json));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'server', detail: err.message || 'Ask failed.' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
  if (env.OPENAI_MODEL) process.env.OPENAI_MODEL = env.OPENAI_MODEL;

  return {
    plugins: [react(), askApiPlugin()],
  };
});
