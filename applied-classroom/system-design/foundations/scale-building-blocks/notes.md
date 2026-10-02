# Scale from zero to millions

Read **System Design Interview - An Insider's Guide** Chapter 1 (PDF ~p. 7-44). You grow a simple site into a scalable architecture by adding blocks when pain appears.

## Journey (memorize the order of ideas)

1. **Single server** - web + DB + cache on one box.
2. **Split web tier and data tier** - scale independently.
3. **Load balancer** - multiple web servers, no single web SPOF.
4. **Database replication** - primary for writes, replicas for reads.
5. **Cache** - speed repeated reads.
6. **CDN** - static assets closer to users.
7. **Stateless web tier** - sessions out of process → horizontal web scale.
8. **More data centers / geo** - latency and disaster resilience.
9. **Message queue** - async work, decoupling.
10. **Logging, metrics, automation** - operate what you built.
11. **Sharding** - when one primary cannot hold write/data load.

## Vertical vs horizontal

- **Vertical (scale up)**: bigger CPU/RAM. Simple; hard limit; no redundancy by itself.
- **Horizontal (scale out)**: more servers. Needed at large scale.
