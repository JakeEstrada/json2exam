# What is system design?

You are learning to design **software systems that store data, serve users, and keep working as load and requirements grow** - not to pick one “correct” architecture.

## Three books (all in `sources/`)

1. **System Design Interview - An Insider's Guide** (Alex Xu) - interview playbook: scale building blocks, estimation, and end-to-end designs (URL shortener, notifications, …).
2. **Designing Data-Intensive Applications** (Kleppmann & Riccomini) - how data systems really work: reliability, scalability, consistency, replication, partitioning.
3. **Fundamentals of Software Architecture, 2nd Edition** (Richards & Ford) - what architects decide: characteristics (“-ilities”), styles, and trade-off laws.

## Plain-English definition

**System design** = choosing and combining building blocks (databases, caches, queues, load balancers, APIs) so a product meets its goals under constraints (users, latency, cost, failures).

DDIA calls apps **data-intensive** when the hard part is data volume, change, consistency, and availability - not raw CPU math.

FSA’s first law: **everything is a trade-off.** If you think you found something with no downside, you have not found the trade-off yet.

## How this course is ordered

1. **Foundations** - vocabulary and mindset (this module).
2. **Building blocks / design choices** - one concern at a time (DB, cache, queue, …).
3. **Systems** - put blocks together on classic problems (URL shortener, notifications, this quiz app).

Read the PDF pages listed on each card (**Show in book**). Notes headings match `reference.section` where present.
