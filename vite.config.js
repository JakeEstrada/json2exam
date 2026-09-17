import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readJsonBody, runAsk } from './api/ask-core.js';
import { bearerToken, runLogin, runProgressGet, runProgressPost } from './api/owner-core.js';
import { runSpeak } from './api/speak-core.js';

function pdfStandardFontsPlugin() {
  const src = path.resolve('node_modules/pdfjs-dist/standard_fonts');
  return {
    name: 'pdf-standard-fonts',
    configureServer(server) {
      server.middlewares.use('/standard_fonts', (req, res, next) => {
        const name = decodeURIComponent((req.url || '').split('?')[0])
          .replace(/^\/+/, '')
          .replace(/^standard_fonts\/+/, '');
        if (!name || name.includes('..')) return next();
        const file = path.join(src, name);
        if (!file.startsWith(src) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
          return next();
        }
        res.setHeader('Content-Type', path.extname(file) === '.ttf' ? 'font/ttf' : 'application/octet-stream');
        fs.createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      fs.cpSync(src, path.resolve('dist/standard_fonts'), { recursive: true });
    },
  };
}

function askApiPlugin() {
  return {
    name: 'ask-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url || '').split('?')[0];
        if (path === '/api/speak') {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'method', detail: 'POST only.' }));
            return;
          }
          try {
            const body = await readJsonBody(req);
            const out = await runSpeak(body);
            res.statusCode = out.status;
            if (out.body) {
              res.setHeader('Content-Type', out.contentType || 'audio/mpeg');
              res.end(out.body);
              return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(out.json));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'server', detail: err.message || 'Speak failed.' }));
          }
          return;
        }

        if (path === '/api/login') {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'method', detail: 'POST only.' }));
            return;
          }
          try {
            const body = await readJsonBody(req);
            const out = runLogin(body);
            res.statusCode = out.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(out.json));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'server', detail: err.message || 'Login failed.' }));
          }
          return;
        }

        if (path === '/api/progress') {
          try {
            const out = req.method === 'GET'
              ? runProgressGet(bearerToken(req))
              : req.method === 'POST'
                ? runProgressPost(await readJsonBody(req), bearerToken(req))
                : { status: 405, json: { error: 'method', detail: 'GET or POST.' } };
            res.statusCode = out.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(out.json));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'server', detail: err.message || 'Progress failed.' }));
          }
          return;
        }

        if (path !== '/api/ask') return next();

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'method', detail: 'POST only.' }));
          return;
        }

        try {
          const body = await readJsonBody(req);
          const out = await runAsk(body, bearerToken(req));
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
  if (env.OPENAI_TTS_VOICE) process.env.OPENAI_TTS_VOICE = env.OPENAI_TTS_VOICE;
  if (env.OPENAI_TTS_MODEL) process.env.OPENAI_TTS_MODEL = env.OPENAI_TTS_MODEL;
  if (env.OWNER_USERNAME) process.env.OWNER_USERNAME = env.OWNER_USERNAME;
  if (env.OWNER_PASSWORD) process.env.OWNER_PASSWORD = env.OWNER_PASSWORD;
  if (env.SESSION_SECRET) process.env.SESSION_SECRET = env.SESSION_SECRET;

  return {
    plugins: [react(), askApiPlugin(), pdfStandardFontsPlugin()],
    assetsInclude: ['**/*.pdf', '**/*.mp3', '**/*.mp4'],
  };
});
