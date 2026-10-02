# Cache

**Designing Data-Intensive Applications**: remember expensive results to speed reads. **System Design Interview – An Insider's Guide** Ch 1: cache sits in front of the DB as traffic grows; consistent hashing (Ch 5) helps when the cache cluster changes size.

## Ideas to know

- **Hit / miss**, TTL, eviction (LRU, …)
- **Cache-aside** vs write-through / write-behind (trade freshness vs speed)
- **Stampede** risk when keys expire together
- **Invalidation** is the hard part — stale data vs complexity

Caches are not a source of truth. Durability still lives in the database (or log).
