# Queue

**System Design Interview - An Insider's Guide** Ch 1 & notification designs: queues decouple producers from consumers. **Designing Data-Intensive Applications**: stream/event processing builds on durable logs and async delivery.

## Why queues

- Smooth traffic spikes
- Retry failed work without blocking the user request
- Fan-out to multiple workers
- Protect slow third parties (email, SMS, push)

## Trade-offs

- Extra latency before work finishes
- At-least-once delivery ⇒ consumers must be **idempotent**
- Poison messages need DLQs / visibility timeouts
