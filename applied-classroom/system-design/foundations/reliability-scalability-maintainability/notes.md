# Reliability, scalability, maintainability

Read **Designing Data-Intensive Applications** Chapter 2 ideas (PDF ~p. 57+): nonfunctional requirements that decide whether a system is usable at all.

## Functional vs nonfunctional

- **Functional**: what screens and operations do.
- **Nonfunctional**: fast, reliable, secure, maintainable - an app that is unbearably slow or unreliable might as well not exist.

## Three pillars (vocabulary)

| Word | Meaning in practice |
|------|---------------------|
| **Reliability** | Continues to work correctly even when things go wrong (faults). |
| **Scalability** | Can add capacity as load grows; architecture often changes each order of magnitude. |
| **Maintainability** | Humans can keep evolving the system without it rotting. |

## Load (for scalability talks)

Talk about **load parameters** (QPS, concurrent users, fan-out, payload size) before proposing more servers. Xu’s Twitter estimation exercise is the interview version of the same idea.
