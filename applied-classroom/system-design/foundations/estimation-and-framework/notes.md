# Estimation and interview framework

Read **System Design Interview - An Insider's Guide** Chapters 2-3 (PDF ~p. 45-65).

## Back-of-the-envelope (Ch 2)

Jeff Dean: combine thought experiments + common performance numbers to see which designs can meet requirements.

Know:

- **Powers of two** (KB/MB/GB/TB) so unit math does not lie.
- **Latency folklore** - memory ≪ disk; avoid seeks; compress before WAN; cross-region is slow.
- **Availability nines** / SLAs - more nines ⇒ less allowed downtime.

Tips: round, write assumptions, label units, QPS vs storage separately.

## 4-step interview framework (Ch 3)

1. **Understand the problem and establish design scope** - ask questions; do not be “Jimmy.”
2. **Propose high-level design and get buy-in** - diagram + APIs; agree before deep dives.
3. **Design deep dive** - pick bottlenecks the interviewer cares about.
4. **Wrap up** - summarize, call out follow-ups, failures, metrics.

Red flags: jumping to solutions, over-engineering, stubbornness.
