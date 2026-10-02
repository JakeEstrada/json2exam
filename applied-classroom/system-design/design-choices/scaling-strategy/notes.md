# Scaling strategy

**System Design Interview – An Insider's Guide** Ch 1 + Ch 5: vertical vs horizontal, load balancing, consistent hashing, sharding.

## Playbook

1. Measure load (QPS, data size, fan-out)
2. Scale web horizontally behind LB (stateless)
3. Scale reads with replicas + cache + CDN
4. Scale writes/data with sharding when needed
5. Expect architecture revisits each ~10× load (DDIA)
