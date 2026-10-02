# API structure

**System Design Interview - An Insider's Guide** designs APIs as REST-style endpoints early (see URL shortener, rate limiter). Clarify: resources, methods, pagination, errors, idempotency, versioning.

## Habits

- Agree APIs in Step 2 before deep dive
- Return clear errors when throttled (rate limiter chapter)
- Prefer idempotent writes where clients retry
