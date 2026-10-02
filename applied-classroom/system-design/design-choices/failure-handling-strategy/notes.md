# Failure-handling strategy

**Designing Data-Intensive Applications** reliability = correct behavior under faults. **System Design Interview – An Insider's Guide**: redundancy, retries via queues, rate limiter fault tolerance (fail open vs closed carefully).

## Patterns

- Timeouts, retries with backoff, idempotency
- Replication / multi-AZ
- Circuit breakers; graceful degradation
- Dead-letter queues
- Clear user-visible errors when throttled
