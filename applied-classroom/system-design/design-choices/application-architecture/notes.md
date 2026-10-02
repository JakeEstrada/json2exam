# Application architecture

Combine **Fundamentals of Software Architecture, 2nd Edition** (styles & characteristics) with **System Design Interview – An Insider's Guide** Ch 1 (tiers as you scale).

## Practical ladder for this course

| Stage | Typical shape | Why |
|-------|---------------|-----|
| Prototype / Json2Exam today | Modular monolith / few processes | Simplicity, one deploy |
| Growing traffic | Split web + DB, add LB + cache | Independent scale, latency |
| Many teams / domains | Services with clear boundaries | Team autonomy — costly ops |

FSA: pick a **style** after you know characteristics + logical components. Microservices in 2002 were economically absurd; context changed with open source + DevOps + cloud.

## Stateless web tier

Store session state in shared store/cache so any web server can handle any request — unlocks horizontal web scaling (Xu).
