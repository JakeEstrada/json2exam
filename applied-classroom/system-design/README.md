# System Design Classroom

Design systems by comparing **tradeoffs** — not hunting for one perfect diagram.

## Books (`sources/`)

| File | Title |
|------|--------|
| `System-Design-Interview-Insiders-Guide.pdf` | System Design Interview – An Insider's Guide (Alex Xu) |
| `Designing-Data-Intensive-Applications.pdf` | Designing Data-Intensive Applications (Kleppmann & Riccomini) |
| `Fundamentals-of-Software-Architecture-2nd.pdf` | Fundamentals of Software Architecture, 2nd Ed. (Richards & Ford) |

## Path

1. **Foundations** — what system design is; reliability/scale/maintainability; architecture laws; Xu’s scale journey; estimation + 4-step interview framework.
2. **Design choices** — architecture, database, cache, queue, API/rate limits, auth, scaling, failure, logging, security.
3. **Systems** — URL shortener, notifications, news feed, file/drive upload, and designing Json2Exam itself. Extra stubs (timecard, catalog, orders, photos) stay empty for later.

Regenerate decks: `node scripts/gen-system-design.mjs`
