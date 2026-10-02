# Authentication strategy

Cross-cut from **System Design Interview - An Insider's Guide** designs (sessions/stateless tokens) and **Fundamentals of Software Architecture, 2nd Edition** security as an architecture characteristic.

## Core ideas

- **Authentication** = who you are; **authorization** = what you may do
- Sessions vs JWT/opaque tokens; where secrets live
- Stateless web tier ⇒ shared session store or verified tokens
- Rate limit login; protect tokens; HTTPS everywhere
