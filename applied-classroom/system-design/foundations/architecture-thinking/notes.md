# Architecture thinking

Read **Fundamentals of Software Architecture, 2nd Edition** Chapter 1 (PDF ~p. 30+).

## Architecture ≠ picking React

Choosing React vs Vue is often a **technical** decision. Architects set constraints (“use a reactive web framework”) so teams can choose within guardrails — unless a specific tech is required to protect a characteristic (scalability, availability).

## Four dimensions (remember this diagram in words)

1. **Architecture characteristics** — “-ilities” (scalability, availability, security, …).
2. **Logical components** — domains, entities, workflows (behavior).
3. **Architecture style** — starting structure (layered, modular monolith, microservices, …).
4. **Architecture decisions** — rules (e.g. Presentation cannot hit the DB directly).

## Two laws to tattoo on your brain

1. Everything is a trade-off (+ you will keep re-evaluating).
2. **Why is more important than how** — context and trade-offs explain decisions.
