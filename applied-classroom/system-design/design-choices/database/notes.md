# Database

Sources: **System Design Interview - An Insider's Guide** Ch 1 (SQL vs NoSQL) + **Designing Data-Intensive Applications** (data models, replication/sharding foreshadow).

## Decision checklist

1. What is the **access pattern**? (point lookup, range, join-heavy, append-only events)
2. Do you need **transactions / joins**?
3. Latency, durability, and consistency needs?
4. How will it **scale** (replicas vs shards)?

Default for many apps: **relational**. Reach for specialized stores when the workload truly demands them - not for résumé-driven development.
