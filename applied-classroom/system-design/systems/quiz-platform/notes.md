# Quiz platform (this app)

Apply the books to **Json2Exam** itself.

## Today (local-first)

- Static Vite/React app
- Quizzes as JSON; Leitner progress in **localStorage**
- Optional APIs: Ask GPT / speak — serverless handlers
- PDFs via `sources/` + page references on cards

## If it grew (design exercise)

| Need | Building block |
|------|----------------|
| Cross-device progress | Auth + Postgres (or similar) |
| Shared classes | Multi-tenant data model |
| Spaced-repetition jobs | Queue / cron workers |
| Heavy AskGPT traffic | Rate limiter + cache |
| Analytics | Events → warehouse (batch) |

Write a one-page design: what stays local vs what moves server-side first. Prefer **trade-offs** over buzzwords (FSA First Law; DDIA).
