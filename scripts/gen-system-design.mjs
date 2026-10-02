#!/usr/bin/env node
/**
 * Generates System Design foundations + building-block + system decks.
 * Run from repo root: node scripts/gen-system-design.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'applied-classroom/system-design';
const XU = "System Design Interview – An Insider's Guide";
const DDIA = 'Designing Data-Intensive Applications';
const FSA = 'Fundamentals of Software Architecture, 2nd Edition';

const letters = ['a', 'b', 'c', 'd'];

function q(question, options, answerIndex, book, page, excerpt, explanation) {
  return {
    question,
    type: 'multiple',
    level: page <= 100 ? 1 : 2,
    options,
    answer: letters[answerIndex],
    explanation: explanation || excerpt,
    reference: { book, page, excerpt },
  };
}

function tf(question, answer, book, page, excerpt) {
  return {
    question,
    type: 'boolean',
    level: 1,
    answer,
    explanation: excerpt,
    reference: { book, page, excerpt },
  };
}

function balanceLengths(options, answerIndex) {
  const max = Math.max(...options.map((o) => o.length));
  return options.map((opt, i) => {
    if (i === answerIndex) return opt;
    if (opt.length >= max - 8) return opt;
    const pad = ' in real production systems at scale';
    let out = opt.replace(/\.$/, '');
    while (out.length < max - 4) out += pad;
    return out.endsWith('.') ? out : out + '.';
  });
}

const decks = [
  // ─── Foundations ─────────────────────────────────────────────
  {
    folder: 'foundations/what-is-system-design',
    title: 'System Design — What is system design?',
    notes: `# What is system design?

You are learning to design **software systems that store data, serve users, and keep working as load and requirements grow** — not to pick one “correct” architecture.

## Three books (all in \`sources/\`)

1. **${XU}** (Alex Xu) — interview playbook: scale building blocks, estimation, and end-to-end designs (URL shortener, notifications, …).
2. **${DDIA}** (Kleppmann & Riccomini) — how data systems really work: reliability, scalability, consistency, replication, partitioning.
3. **${FSA}** (Richards & Ford) — what architects decide: characteristics (“-ilities”), styles, and trade-off laws.

## Plain-English definition

**System design** = choosing and combining building blocks (databases, caches, queues, load balancers, APIs) so a product meets its goals under constraints (users, latency, cost, failures).

DDIA calls apps **data-intensive** when the hard part is data volume, change, consistency, and availability — not raw CPU math.

FSA’s first law: **everything is a trade-off.** If you think you found something with no downside, you have not found the trade-off yet.

## How this course is ordered

1. **Foundations** — vocabulary and mindset (this module).
2. **Building blocks / design choices** — one concern at a time (DB, cache, queue, …).
3. **Systems** — put blocks together on classic problems (URL shortener, notifications, this quiz app).

Read the PDF pages listed on each card (**Show in book**). Notes headings match \`reference.section\` where present.
`,
    questions: [
      q('What does “system design” mainly ask you to do?',
        ['Memorize one perfect diagram that works for every product forever without changing.',
         'Choose and combine building blocks under constraints so the product meets its goals.',
         'Only write frontend CSS until the design looks modern enough for users.',
         'Pick the newest database brand because newer always means more scalable.'],
        1, DDIA, 16, 'no one approach is fundamentally better than others; everything has pros and cons'),
      q('DDIA calls an application data-intensive when:',
        ['The only challenge is parallelizing a single huge numerical computation on GPUs.',
         'Data management (volume, change, consistency, availability) is a primary challenge.',
         'The UI uses more than three colors and must animate every button click.',
         'The team refuses to use any database and stores everything in email attachments.'],
        1, DDIA, 16, 'We call an application data-intensive if data management is one of the primary challenges'),
      q('Which set are the standard building blocks DDIA lists for many apps?',
        ['Databases, caches, search indexes, stream processing, and batch processing.',
         'Only Photoshop, Figma, and slide decks with no servers at all.',
         'Only punch cards and magnetic tape with no network protocols allowed.',
         'Only one shared Excel file emailed around the company each Friday.'],
        0, DDIA, 16, 'Store data… (databases) Remember the result… (caches) … stream processing … batch processing'),
      q('FSA’s First Law of Software Architecture is:',
        ['Always use microservices before you have any users or traffic.',
         'Everything in software architecture is a trade-off.',
         'The newest cloud product is never a trade-off for anyone.',
         'Architecture decisions should never be written down for teams.'],
        1, FSA, 34, 'Everything in software architecture is a trade-off'),
      tf('True or false: If you think you found something that is not a trade-off, FSA says you likely have not identified the trade-off yet.',
        true, FSA, 34, 'If you think you’ve discovered something that isn’t a trade-off, more likely you just haven’t identified the trade-off…yet'),
      q('FSA defines software architecture as combining which dimensions?',
        ['Only the logo font and the homepage hero image with no structure underneath.',
         'Architecture style, characteristics (“-ilities”), logical components, and decisions.',
         'Only the number of GitHub stars on a framework repository.',
         'Only the CEO’s favorite color for the login button background.'],
        1, FSA, 31, 'architecture style… architecture characteristics… logical components… architecture decisions'),
      q('According to Xu’s interview framing, the final diagram matters less than:',
        ['How fast you shout buzzwords before clarifying any requirements at all.',
         'The design process: clarifying, proposing, defending trade-offs, taking feedback.',
         'Copying a famous company’s public blog post word-for-word without trade-offs.',
         'Refusing to discuss failure modes because interviews are only about happy paths.'],
        1, XU, 54, 'The final design is less important compared to the work you put in the design process'),
      q('Why do companies use system design interviews?',
        ['To grade calligraphy of boxes and arrows with no discussion of constraints.',
         'Because communication and step-by-step problem solving match daily engineering work.',
         'To force one unique correct topology that every candidate must memorize.',
         'To avoid talking about scale, failures, or APIs entirely during hiring.'],
        1, XU, 5, 'communication and problem-solving skills tested… are similar to those required by a software engineer’s daily work'),
    ],
  },
  {
    folder: 'foundations/reliability-scalability-maintainability',
    title: 'System Design — Reliability, scalability, maintainability',
    notes: `# Reliability, scalability, maintainability

Read **${DDIA}** Chapter 2 ideas (PDF ~p. 57+): nonfunctional requirements that decide whether a system is usable at all.

## Functional vs nonfunctional

- **Functional**: what screens and operations do.
- **Nonfunctional**: fast, reliable, secure, maintainable — an app that is unbearably slow or unreliable might as well not exist.

## Three pillars (vocabulary)

| Word | Meaning in practice |
|------|---------------------|
| **Reliability** | Continues to work correctly even when things go wrong (faults). |
| **Scalability** | Can add capacity as load grows; architecture often changes each order of magnitude. |
| **Maintainability** | Humans can keep evolving the system without it rotting. |

## Load (for scalability talks)

Talk about **load parameters** (QPS, concurrent users, fan-out, payload size) before proposing more servers. Xu’s Twitter estimation exercise is the interview version of the same idea.
`,
    questions: [
      q('In DDIA terms, reliability mainly means:',
        ['The UI always uses the same shade of blue on every button forever.',
         'The system continues to work correctly even when things go wrong.',
         'You never deploy new features so nothing can ever break again.',
         'Every request is rejected so the servers stay idle and “stable.”'],
        1, DDIA, 57, 'What it means for a service to be reliable—namely, continuing to work correctly, even when things go wrong'),
      q('Scalability, as framed in DDIA, is about:',
        ['Buying one infinitely powerful machine so you never rethink architecture.',
         'Having efficient ways to add computing capacity as load on the system grows.',
         'Deleting all indexes so writes are always fast regardless of read patterns.',
         'Turning off monitoring so you do not notice when load increases.'],
        1, DDIA, 57, 'Allowing a system to be scalable by having efficient ways of adding computing capacity as the load on the system grows'),
      q('DDIA notes that an architecture appropriate for one load level:',
        ['Always handles 10× load with zero changes if the logo is redesigned.',
         'Is unlikely to cope with 10× that load — rethink on each order-of-magnitude growth.',
         'Must be microservices from day one even with ten users.',
         'Can ignore databases entirely once traffic doubles once.'],
        1, DDIA, 85, 'an architecture that is appropriate for one level of load is unlikely to cope with 10 times that load'),
      q('Nonfunctional requirements such as speed and reliability:',
        ['Can be ignored because only button labels matter to users.',
         'Are as important as functionality — a slow or unreliable app is barely usable.',
         'Only apply to mainframe systems from the 1970s and never web apps.',
         'Are automatically satisfied by any framework with a popular name.'],
        1, DDIA, 57, 'an app that is unbearably slow or unreliable might as well not exist'),
      tf('True or false: Maintainability is about making the system easier to keep evolving over the long term.',
        true, DDIA, 57, 'Making it easier to maintain a system in the long term'),
      q('When discussing scalability in an interview, you should first clarify:',
        ['Only the color of the status page banner during an outage.',
         'Load parameters (QPS, users, data size, read/write mix) before proposing scale-out.',
         'That vertical scaling forever is always cheaper than any other option.',
         'That caching is illegal in all production systems worldwide.'],
        1, XU, 45, 'back-of-the-envelope calculations… to get a good feel for which designs will meet your requirements'),
      q('Fault tolerance / high availability typically involves:',
        ['Running a single server with no backups so failures are simple.',
         'Using multiple machines for redundancy so another can take over on failure.',
         'Never writing logs because logs cause all outages.',
         'Blocking all users permanently to keep error rates at zero.'],
        1, DDIA, 42, 'you can use multiple machines to give you redundancy. When one fails, another one can take over'),
    ],
  },
  {
    folder: 'foundations/architecture-thinking',
    title: 'System Design — Architecture thinking',
    notes: `# Architecture thinking

Read **${FSA}** Chapter 1 (PDF ~p. 30+).

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
`,
    questions: [
      q('FSA’s Second Law of Software Architecture is:',
        ['How is more important than why, so never document intent.',
         'Why is more important than how.',
         'Diagrams without reasons always age better than written decisions.',
         'Only microservices have a “why”; monoliths never need reasons.'],
        1, FSA, 34, 'Why is more important than how'),
      q('Architecture characteristics (“-ilities”) primarily describe:',
        ['The exact hex color of every button in the design system.',
         'Capabilities and success criteria of the system (what it must support).',
         'Only the marketing slogan on the landing page hero.',
         'The number of emoji allowed in commit messages.'],
        1, FSA, 31, 'Architecture characteristics… define the capabilities of a system… and the criteria for its success'),
      q('Logical components in FSA’s model mainly structure:',
        ['Only DNS TTL values for the marketing CDN edge nodes.',
         'The behavior of the system: domains, entities, and workflows.',
         'Only the physical rack layout in a single data center.',
         'Only the choice of laptop stickers for the architecture team.'],
        1, FSA, 32, 'logical components form the domains, entities, and workflows of the application'),
      q('An architecture decision example from FSA is:',
        ['Forbidding Presentation from calling the database directly in a layered system.',
         'Requiring every function name to be exactly twelve characters long.',
         'Banning all automated tests so releases feel more exciting.',
         'Choosing comic sans for all production error messages forever.'],
        0, FSA, 33, 'only the Business and Services layers… can access the database… restricting the Presentation layer'),
      q('Why can’t architects do “one big trade-off jamboree” and freeze defaults forever?',
        ['Because every situation requires re-evaluating trade-offs in context.',
         'Because trade-offs only exist in textbooks and never in production.',
         'Because cloud vendors legally forbid changing architecture decisions.',
         'Because diagram tools crash if you revisit a decision after a week.'],
        0, FSA, 34, 'every situation requires us to re-evaluate all those trade-offs'),
      tf('True or false: All architectures are products of their context (cost, ops, tooling of their era).',
        true, FSA, 30, 'All architectures are products of their context—keep that in mind as you read this book'),
      q('Ensuring compliance with architecture decisions means:',
        ['Never checking whether teams follow constraints after the first slide deck.',
         'Continually verifying teams follow documented decisions and design principles.',
         'Deleting the architecture decision records so nobody can violate them.',
         'Letting every layer call every database to maximize “agility.”'],
        1, FSA, 36, 'Ensuring compliance means continually verifying that the development teams are following the decisions'),
    ],
  },
  {
    folder: 'foundations/scale-building-blocks',
    title: 'System Design — Scale from zero to millions',
    notes: `# Scale from zero to millions

Read **${XU}** Chapter 1 (PDF ~p. 7–44). You grow a simple site into a scalable architecture by adding blocks when pain appears.

## Journey (memorize the order of ideas)

1. **Single server** — web + DB + cache on one box.
2. **Split web tier and data tier** — scale independently.
3. **Load balancer** — multiple web servers, no single web SPOF.
4. **Database replication** — primary for writes, replicas for reads.
5. **Cache** — speed repeated reads.
6. **CDN** — static assets closer to users.
7. **Stateless web tier** — sessions out of process → horizontal web scale.
8. **More data centers / geo** — latency and disaster resilience.
9. **Message queue** — async work, decoupling.
10. **Logging, metrics, automation** — operate what you built.
11. **Sharding** — when one primary cannot hold write/data load.

## Vertical vs horizontal

- **Vertical (scale up)**: bigger CPU/RAM. Simple; hard limit; no redundancy by itself.
- **Horizontal (scale out)**: more servers. Needed at large scale.
`,
    questions: [
      q('Why separate web/mobile traffic servers from database servers early?',
        ['So DNS stops resolving and users cannot find the site anymore.',
         'So web tier and data tier can be scaled independently as load grows.',
         'So you can delete the database and keep only static HTML forever.',
         'So mobile apps are forced to speak FTP instead of HTTP.'],
        1, XU, 11, 'Separating web/mobile traffic (web tier) and database (data tier) servers allows them to be scaled independently'),
      q('Vertical scaling (“scale up”) means:',
        ['Adding more servers into a pool of identical machines.',
         'Adding more power (CPU, RAM, etc.) to your existing servers.',
         'Removing all CPUs so the system uses less electricity overnight.',
         'Sharding every table on day one with ten users total.'],
        1, XU, 14, 'Vertical scaling, referred to as “scale up”, means the process of adding more power (CPU, RAM, etc.) to your servers'),
      q('A hard limitation of vertical scaling alone is:',
        ['It always provides automatic multi-server failover and redundancy.',
         'You cannot add unlimited CPU/memory to one machine, and one failure takes the site down.',
         'It is illegal in every cloud provider’s terms of service worldwide.',
         'It only works for mobile apps and never for web browsers.'],
        1, XU, 14, 'Vertical scaling has a hard limit… Vertical scaling does not have failover and redundancy'),
      q('For most developers, Xu says relational databases are often best first because:',
        ['Joins are illegal in SQL and must be avoided at all costs forever.',
         'They have decades of history and have historically worked well for many apps.',
         'They never store tables or rows and only store graphs.',
         'They always beat every NoSQL store on every latency benchmark.'],
        1, XU, 12, 'For most developers, relational databases are the best option because they have been around for over 40 years'),
      q('NoSQL may be worth exploring when, among other reasons:',
        ['You need joins across every table on every request without exception.',
         'You need super-low latency, unstructured data, simple serialize/deserialize, or massive scale.',
         'Your only requirement is ACID transactions with heavy multi-table joins.',
         'You want to ban JSON and only store handwritten paper forms.'],
        1, XU, 13, 'Non-relational databases might be the right choice if: … super-low latency … unstructured … serialize and deserialize … massive amount of data'),
      tf('True or false: Horizontal scaling adds more servers to your resource pool (“scale-out”).',
        true, XU, 14, 'Horizontal scaling, referred to as “scale-out”, allows you to scale by adding more servers into your pool of resources'),
      q('A CDN is primarily used to:',
        ['Replace your transactional database for all strongly consistent writes.',
         'Serve static content from locations closer to users to cut latency.',
         'Run all business logic inside the user’s DNS resolver process.',
         'Guarantee exactly-once delivery of every database transaction.'],
        1, XU, 22, 'CDN'),
      q('Message queues help large systems mainly by:',
        ['Forcing every request to wait synchronously on the slowest downstream forever.',
         'Decoupling producers and consumers so work can be processed asynchronously.',
         'Deleting failed jobs so operators never see errors in dashboards.',
         'Replacing TLS so all traffic stays unencrypted for speed.'],
        1, XU, 34, 'message queue'),
    ],
  },
  {
    folder: 'foundations/estimation-and-framework',
    title: 'System Design — Estimation and interview framework',
    notes: `# Estimation and interview framework

Read **${XU}** Chapters 2–3 (PDF ~p. 45–65).

## Back-of-the-envelope (Ch 2)

Jeff Dean: combine thought experiments + common performance numbers to see which designs can meet requirements.

Know:

- **Powers of two** (KB/MB/GB/TB) so unit math does not lie.
- **Latency folklore** — memory ≪ disk; avoid seeks; compress before WAN; cross-region is slow.
- **Availability nines** / SLAs — more nines ⇒ less allowed downtime.

Tips: round, write assumptions, label units, QPS vs storage separately.

## 4-step interview framework (Ch 3)

1. **Understand the problem and establish design scope** — ask questions; do not be “Jimmy.”
2. **Propose high-level design and get buy-in** — diagram + APIs; agree before deep dives.
3. **Design deep dive** — pick bottlenecks the interviewer cares about.
4. **Wrap up** — summarize, call out follow-ups, failures, metrics.

Red flags: jumping to solutions, over-engineering, stubbornness.
`,
    questions: [
      q('Back-of-the-envelope estimation is meant to:',
        ['Produce exact production capacity plans down to the last disk platter.',
         'Use thought experiments and common numbers to feel which designs can meet requirements.',
         'Replace load testing forever so you never measure a real system.',
         'Prove that every design needs exactly 64 servers and no other count.'],
        1, XU, 45, 'estimates you create using a combination of thought experiments and common performance numbers'),
      q('From typical latency intuition Xu highlights:',
        ['Disk seeks are faster than memory access in almost every case.',
         'Memory is fast but disk is slow — avoid unnecessary disk seeks when possible.',
         'Cross-datacenter network hops are free and should be ignored.',
         'Compression is always slower than sending raw terabytes over the internet.'],
        1, XU, 48, 'Memory is fast but the disk is slow. Avoid disk seeks if possible'),
      q('In Xu’s Twitter-style QPS exercise, the first move is to:',
        ['Buy GPUs before clarifying monthly active users or posts per day.',
         'State assumptions (MAU, daily usage, posts/day) then derive DAU and QPS.',
         'Assume zero reads because only writes matter for capacity.',
         'Skip units so 5 might mean 5 bytes or 5 petabytes interchangeably.'],
        1, XU, 50, 'Assumptions: • 300 million monthly active users… Estimations: Query per second (QPS)'),
      q('Step 1 of Xu’s interview framework emphasizes:',
        ['Answering instantly like Jimmy without clarifying requirements.',
         'Slowing down to ask questions, clarify requirements, and state assumptions.',
         'Drawing microservices before you know what the product does.',
         'Refusing to discuss scale until after coding every endpoint.'],
        1, XU, 56, 'DON’T be like Jimmy… Slow down. Think deeply and ask questions to clarify requirements'),
      q('Over-engineering in interviews is a red flag because:',
        ['Interviewers only want the most complex possible topology every time.',
         'Engineers chase design purity and ignore trade-offs and compounding costs.',
         'Simple designs are illegal in all FAANG interview rubrics.',
         'Trade-offs only exist after the company has a billion users.'],
        1, XU, 55, 'Over-engineering is a real disease… ignore tradeoffs'),
      tf('True or false: Xu says there is no perfect answer; the interview simulates collaborative problem solving on an ambiguous problem.',
        true, XU, 54, 'The problem is open-ended, and there is no perfect answer'),
      q('When doing estimation math in an interview, Xu advises:',
        ['Spend minutes computing 99987 / 9.1 exactly with long division.',
         'Round and approximate; write assumptions; label units clearly.',
         'Never say QPS out loud because interviewers dislike numbers.',
         'Hide all assumptions so the interviewer cannot challenge them.'],
        1, XU, 52, 'Rounding and Approximation… Write down your assumptions… Label your units'),
    ],
  },

  // ─── Design choices / building blocks ────────────────────────
  {
    folder: 'design-choices/application-architecture',
    title: 'System Design — Application architecture',
    notes: `# Application architecture

Combine **${FSA}** (styles & characteristics) with **${XU}** Ch 1 (tiers as you scale).

## Practical ladder for this course

| Stage | Typical shape | Why |
|-------|---------------|-----|
| Prototype / Json2Exam today | Modular monolith / few processes | Simplicity, one deploy |
| Growing traffic | Split web + DB, add LB + cache | Independent scale, latency |
| Many teams / domains | Services with clear boundaries | Team autonomy — costly ops |

FSA: pick a **style** after you know characteristics + logical components. Microservices in 2002 were economically absurd; context changed with open source + DevOps + cloud.

## Stateless web tier

Store session state in shared store/cache so any web server can handle any request — unlocks horizontal web scaling (Xu).
`,
    questions: [
      q('When should you choose an architecture style, per FSA’s flow?',
        ['Before you know any characteristics or logical components at all.',
         'After analyzing characteristics and logical components the system needs.',
         'Only after rewriting the UI three times in different frameworks.',
         'Never — styles are banned in modern engineering culture.'],
        1, FSA, 32, 'Once an architect has analyzed the architectural characteristics and logical components… they know enough to choose an appropriate architecture style'),
      q('Why would microservices have been “inconceivably expensive” in 2002?',
        ['Because open source databases did not exist as an idea yet in any form.',
         'Commercial licenses for OS, app servers, and DBs per service made isolation costly.',
         'Because DNS could not resolve more than one hostname per company.',
         'Because load balancers were illegal for commercial websites then.'],
        1, FSA, 30, 'trying to build an architecture like microservices would have been inconceivably expensive'),
      q('A modular monolith is often a good early choice because:',
         ['It maximizes network hops and operational complexity from day one.',
         'It keeps deploy simple while still allowing clear internal module boundaries.',
         'It forbids any database and forces all state into browser cookies only.',
         'It guarantees infinite scale without ever adding caches or replicas.'],
        1, FSA, 32, 'Choosing an architectural style involves finding the easiest implementation path'),
      q('Making the web tier stateless supports:',
        ['Pinning every user forever to one specific web server process only.',
         'Horizontal scaling of web servers behind a load balancer.',
         'Deleting the load balancer because sticky sessions become mandatory.',
         'Storing all sessions only in local disk folders on each web box.'],
        1, XU, 28, 'stateless'),
      tf('True or false: Architecture decisions define rules/constraints for how a system should be constructed.',
        true, FSA, 33, 'architecture decisions, which define the rules for how a system should be constructed'),
      q('Structural decay happens when:',
        ['Developers’ changes undermine required architectural characteristics over time.',
         'You document every decision in an ADR and review fitness functions.',
         'Load stays flat and characteristics are continuously verified in CI.',
         'Architects continually analyze vitality of older architectures.'],
        0, FSA, 35, 'structural decay, which occurs when developers make coding or design changes that impact the required architectural characteristics'),
    ],
  },
  {
    folder: 'design-choices/database',
    title: 'System Design — Database',
    notes: `# Database

Sources: **${XU}** Ch 1 (SQL vs NoSQL) + **${DDIA}** (data models, replication/sharding foreshadow).

## Decision checklist

1. What is the **access pattern**? (point lookup, range, join-heavy, append-only events)
2. Do you need **transactions / joins**?
3. Latency, durability, and consistency needs?
4. How will it **scale** (replicas vs shards)?

Default for many apps: **relational**. Reach for specialized stores when the workload truly demands them — not for résumé-driven development.
`,
    questions: [
      q('Relational databases store data primarily as:',
        ['Only opaque blobs with no query language at all.',
         'Tables and rows, with SQL joins across tables.',
         'Only ring positions on a consistent-hashing circle.',
         'Only DNS TXT records replicated to every resolver.'],
        1, XU, 12, 'Relational databases represent and store data in tables and rows. You can perform join operations using SQL'),
      q('NoSQL stores are commonly grouped into categories such as:',
        ['Only “fast” and “slow” with no other distinctions.',
         'Key-value, document, column, and graph stores.',
         'Only Oracle and DB2 under different marketing names.',
         'Only in-memory caches that never persist to disk.'],
        1, XU, 12, 'key-value stores, graph stores, column stores, and document stores'),
      q('Joins in non-relational databases are:',
        ['Always richer and faster than SQL joins in every product.',
         'Generally not supported the way SQL databases support them.',
         'Required on every single read path by definition.',
         'Performed automatically by the DNS layer for free.'],
        1, XU, 12, 'Join operations are generally not supported in non-relational databases'),
      q('DDIA’s building-block view says databases exist to:',
        ['Render CSS animations for marketing pages only.',
         'Store data so the app (or another app) can find it again later.',
         'Replace all caches, queues, and search indexes permanently.',
         'Guarantee zero operational cost at infinite scale.'],
        1, DDIA, 16, 'Store data so that they, or another application, can find it again later (databases)'),
      tf('True or false: Xu’s default advice is still “start with relational” unless your use case clearly does not fit.',
        true, XU, 12, 'For most developers, relational databases are the best option'),
      q('Replication is introduced when:',
        ['You want a single disk with no copies for maximum simplicity under load.',
         'Read load or availability needs exceed what one primary alone should handle.',
         'You delete indexes so every query becomes a full table scan.',
         'You ban backups because replicas already mean infinite durability.'],
        1, XU, 18, 'database replication'),
    ],
  },
  {
    folder: 'design-choices/cache',
    title: 'System Design — Cache',
    notes: `# Cache

**${DDIA}**: remember expensive results to speed reads. **${XU}** Ch 1: cache sits in front of the DB as traffic grows; consistent hashing (Ch 5) helps when the cache cluster changes size.

## Ideas to know

- **Hit / miss**, TTL, eviction (LRU, …)
- **Cache-aside** vs write-through / write-behind (trade freshness vs speed)
- **Stampede** risk when keys expire together
- **Invalidation** is the hard part — stale data vs complexity

Caches are not a source of truth. Durability still lives in the database (or log).
`,
    questions: [
      q('DDIA describes caches as systems that:',
        ['Permanently replace durable databases for all financial ledgers.',
         'Remember the result of an expensive operation to speed up reads.',
         'Only store data that must survive datacenter fires without backups.',
         'Always provide serializable multi-row transactions by default.'],
        1, DDIA, 16, 'Remember the result of an expensive operation, to speed up reads (caches)'),
      q('A classic reason to add a cache layer while scaling is:',
        ['To make every write slower on purpose for fairness.',
         'To absorb repeated reads so the database is not overwhelmed.',
         'To remove the need for any load balancer forever.',
         'To store passwords in plaintext closer to the browser.'],
        1, XU, 20, 'cache'),
      q('The rehashing problem with \`hash(key) % N\` when a cache node dies is:',
        ['Only that one key moves; all other keys stay perfectly mapped.',
         'Most keys remapping, causing a storm of cache misses.',
         'That consistent hashing becomes illegal to use afterward.',
         'That N can never change in any distributed system.'],
        1, XU, 92, 'most keys are redistributed… This causes a storm of cache misses'),
      q('Consistent hashing reduces remapping so that when the ring changes:',
        ['Every key in the cluster must move to a new server immediately.',
         'Only about k/n keys need remapping on average, not nearly all keys.',
         'No keys ever move even if you remove every server.',
         'Keys are stored on all servers at once with no lookup rule.'],
        1, XU, 93, 'only k/n keys need to be remapped on average'),
      tf('True or false: On a consistent-hash ring, you look up a key by walking clockwise until you hit a server.',
        true, XU, 96, 'we go clockwise from the key position on the ring until a server is found'),
      q('Virtual nodes on a consistent-hash ring help primarily to:',
        ['Make the ring square instead of circular for easier drawing.',
         'Improve balance / reduce hot spots when servers are unevenly placed.',
         'Eliminate the need for any hash function at all.',
         'Force every key to live on exactly one physical disk platter forever.'],
        1, XU, 100, 'virtual nodes'),
    ],
  },
  {
    folder: 'design-choices/queue',
    title: 'System Design — Queue',
    notes: `# Queue

**${XU}** Ch 1 & notification designs: queues decouple producers from consumers. **${DDIA}**: stream/event processing builds on durable logs and async delivery.

## Why queues

- Smooth traffic spikes
- Retry failed work without blocking the user request
- Fan-out to multiple workers
- Protect slow third parties (email, SMS, push)

## Trade-offs

- Extra latency before work finishes
- At-least-once delivery ⇒ consumers must be **idempotent**
- Poison messages need DLQs / visibility timeouts
`,
    questions: [
      q('A primary benefit of inserting a message queue between services is:',
        ['Forcing synchronous coupling so both sides fail together always.',
         'Decoupling producers and consumers and absorbing bursts asynchronously.',
         'Guaranteeing the UI paints pixels without any backend at all.',
         'Removing the need for authentication on every public API.'],
        1, XU, 34, 'message queue'),
      q('Notification systems often place a queue before SMS/email/push workers to:',
        ['Drop all messages silently when traffic is high.',
         'Buffer send jobs and scale workers independently of API traffic.',
         'Encrypt the queue by turning off TLS on purpose.',
         'Make push notifications require a human operator to click Send.'],
        1, XU, 195, 'notification sending'),
      q('If a queue delivers at-least-once, consumers should:',
        ['Assume exactly-once and double-charge users freely.',
         'Be idempotent so retries do not corrupt state.',
         'Crash the whole cluster on the first duplicate delivery.',
         'Disable acknowledgements so messages never leave the queue.'],
        1, DDIA, 257, 'delivery semantics'),
      tf('True or false: Queues trade immediate completion for resilience and smoother load.',
        true, XU, 34, 'message queue'),
      q('A dead-letter queue (DLQ) is useful when:',
        ['Every message succeeds on the first try forever.',
         'Poison messages fail repeatedly and need isolation / inspection.',
         'You want to delete monitoring because failures never happen.',
         'Producers should block forever without any backoff.'],
        1, XU, 195, 'fault tolerance'),
    ],
  },
  {
    folder: 'design-choices/api-structure',
    title: 'System Design — API structure',
    notes: `# API structure

**${XU}** designs APIs as REST-style endpoints early (see URL shortener, rate limiter). Clarify: resources, methods, pagination, errors, idempotency, versioning.

## Habits

- Agree APIs in Step 2 before deep dive
- Return clear errors when throttled (rate limiter chapter)
- Prefer idempotent writes where clients retry
`,
    questions: [
      q('In Xu’s URL shortener, the two primary REST-style endpoints are roughly:',
        ['POST to create a short URL; GET to resolve/redirect a short URL.',
         'DELETE only, with no way to create or resolve aliases.',
         'FTP upload of CSV files with no HTTP interface at all.',
         'WebSocket-only binary frames with no resource URLs.'],
        0, XU, 152, 'URL shortening… POST… URL redirecting… GET'),
      q('A rate limiter in the HTTP world primarily:',
        ['Increases every client’s QPS without bound for fairness.',
         'Limits how many client requests are allowed in a time window.',
         'Replaces TLS certificates every millisecond automatically.',
         'Stores all request bodies forever in browser localStorage.'],
        1, XU, 66, 'a rate limiter limits the number of client requests allowed to be sent over a specified period'),
      q('Xu lists a benefit of API rate limiting as:',
        ['Encouraging intentional DoS so capacity planning is realistic.',
         'Preventing resource starvation from DoS (intentional or not) and reducing cost/load.',
         'Removing the need for authentication on admin endpoints.',
         'Guaranteeing unlimited free calls to paid third-party APIs.'],
        1, XU, 67, 'Prevent resource starvation caused by Denial of Service (DoS) attack… Reduce cost… Prevent servers from being overloaded'),
      q('Client-side-only rate limiting is weak because:',
        ['Browsers cannot send HTTP requests at all without it.',
         'Clients can be forged/uncontrolled; enforcement belongs server-side or in middleware.',
         'Servers are not allowed to count requests in distributed systems.',
         'HTTP status codes cannot express throttling to clients.'],
        1, XU, 70, 'client is an unreliable place to enforce rate limiting because client requests can easily be forged'),
      tf('True or false: Xu’s rate limiter requirements include low latency, low memory, distributed use, clear exceptions, and fault tolerance.',
        true, XU, 69, 'Low latency… little memory… Distributed rate limiting… Exception handling… High fault tolerance'),
      q('When designing APIs in Step 2, you should:',
        ['Hide endpoints until after coding every storage engine quirk.',
         'Propose endpoints and get interviewer buy-in before deep dives.',
         'Only use SOAP envelopes with no resource naming.',
         'Avoid status codes so clients guess success from latency.'],
        1, XU, 58, 'Propose high-level design and get buy-in'),
    ],
  },
  {
    folder: 'design-choices/authentication-strategy',
    title: 'System Design — Authentication strategy',
    notes: `# Authentication strategy

Cross-cut from **${XU}** designs (sessions/stateless tokens) and **${FSA}** security as an architecture characteristic.

## Core ideas

- **Authentication** = who you are; **authorization** = what you may do
- Sessions vs JWT/opaque tokens; where secrets live
- Stateless web tier ⇒ shared session store or verified tokens
- Rate limit login; protect tokens; HTTPS everywhere
`,
    questions: [
      q('Stateless web servers typically require session data to live:',
        ['Only in an in-process memory map that dies with each instance.',
         'In a shared store (DB/cache) or in a verified client token design.',
         'Only inside the load balancer’s TLS certificate private key.',
         'Only on the user’s floppy disk mailed to the datacenter.'],
        1, XU, 28, 'stateless'),
      q('Authentication differs from authorization in that authentication:',
        ['Decides which resources a verified identity may access.',
         'Establishes identity (who the caller is).',
         'Only compresses response bodies for CDN edge caches.',
         'Only chooses which SQL index to use for a query plan.'],
        1, FSA, 31, 'architecture characteristics'),
      tf('True or false: Security/availability characteristics can force architects to make specific technology decisions.',
        true, FSA, 35, 'occasions where architects need to make specific technology decisions in order to preserve a particular architectural characteristic'),
      q('A login endpoint without rate limiting is risky because:',
        ['Browsers cannot display forms without exponential backoff.',
         'Attackers can brute-force credentials or overload auth infrastructure.',
         'JWT libraries refuse to run if rate limits are missing.',
         'DNS will stop resolving the hostname automatically.'],
        1, XU, 67, 'Prevent resource starvation… Prevent servers from being overloaded'),
      q('For APIs that charge per third-party call, rate limiting also helps:',
        ['Maximize spend with no upper bound on outbound calls.',
         'Control cost by capping excess requests to paid dependencies.',
         'Disable invoices so finance never sees usage.',
         'Force all calls onto a single shared password.'],
        1, XU, 67, 'Limiting the number of calls is essential to reduce costs'),
    ],
  },
  {
    folder: 'design-choices/scaling-strategy',
    title: 'System Design — Scaling strategy',
    notes: `# Scaling strategy

**${XU}** Ch 1 + Ch 5: vertical vs horizontal, load balancing, consistent hashing, sharding.

## Playbook

1. Measure load (QPS, data size, fan-out)
2. Scale web horizontally behind LB (stateless)
3. Scale reads with replicas + cache + CDN
4. Scale writes/data with sharding when needed
5. Expect architecture revisits each ~10× load (DDIA)
`,
    questions: [
      q('Horizontal scaling is more desirable at large scale mainly because:',
        ['A single machine can take unlimited RAM with no failures.',
         'Vertical scaling hits hard limits and lacks built-in redundancy.',
         'Load balancers are forbidden once you have more than one user.',
         'Sharding is illegal until you finish vertical scaling forever.'],
        1, XU, 14, 'Horizontal scaling is more desirable for large scale applications due to the limitation of vertical scaling'),
      q('A load balancer in front of web servers primarily provides:',
        ['A way to run the database inside each user’s browser only.',
         'Distribution of traffic across servers and a path to remove a single web SPOF.',
         'Automatic conversion of SQL to NoSQL without migrations.',
         'Free multi-region replication for every disk block.'],
        1, XU, 16, 'load balancer'),
      q('Sharding becomes necessary when:',
        ['One primary can easily hold all data and write throughput forever.',
         'Data volume or write throughput exceeds what a single primary can handle.',
         'You want to delete all secondary indexes for simplicity.',
         'CDN hit ratio reaches one hundred percent on HTML pages.'],
        1, DDIA, 337, 'If there’s so much data or such a high write throughput that a single'),
      q('Consistent hashing is used when scaling caches/servers so that:',
        ['Changing cluster size remaps nearly every key every time.',
         'Adding/removing a node remaps only a fraction of keys.',
         'Hash functions are replaced by round-robin DNS only.',
         'Keys are never stored and only computed from the weather.'],
        1, XU, 93, 'only k/n keys need to be remapped on average'),
      tf('True or false: DDIA warns you will likely rethink architecture on each order-of-magnitude load increase for a fast-growing service.',
        true, DDIA, 85, 'rethink your architecture on every order of magnitude load increase'),
    ],
  },
  {
    folder: 'design-choices/failure-handling-strategy',
    title: 'System Design — Failure-handling strategy',
    notes: `# Failure-handling strategy

**${DDIA}** reliability = correct behavior under faults. **${XU}**: redundancy, retries via queues, rate limiter fault tolerance (fail open vs closed carefully).

## Patterns

- Timeouts, retries with backoff, idempotency
- Replication / multi-AZ
- Circuit breakers; graceful degradation
- Dead-letter queues
- Clear user-visible errors when throttled
`,
    questions: [
      q('Reliability focuses on continuing correct operation when:',
        ['Everything is healthy and load is zero.',
         'Things go wrong — machines, networks, processes, humans.',
         'You disable all monitoring to avoid alert fatigue.',
         'You reject every request before it touches business logic.'],
        1, DDIA, 57, 'continuing to work correctly, even when things go wrong'),
      q('Xu’s rate limiter fault-tolerance requirement says if the limiter/cache fails:',
        ['The entire site must go offline until cache returns.',
         'Problems with the rate limiter should not take down the whole system.',
         'All users must be permanently banned automatically.',
         'DNS should return NXDOMAIN for the marketing site.'],
        1, XU, 69, 'If there are any problems with the rate limiter… it does not affect the entire system'),
      q('Redundancy helps availability because:',
        ['One server failure can be absorbed by another taking over.',
         'Identical bugs on all replicas magically cancel out.',
         'You can delete backups once two servers exist.',
         'Load disappears when you double the number of machines.'],
        0, DDIA, 42, 'When one fails, another one can take over'),
      tf('True or false: High availability is often expressed as “nines” of uptime in an SLA.',
        true, XU, 49, 'Uptime is traditionally measured in nines. The more the nines, the better'),
      q('Retries without idempotency are dangerous because:',
        ['Networks never duplicate or delay packets in practice.',
         'Duplicate side effects (double charge, double notify) can occur.',
         'HTTP forbids clients from ever resending a request.',
         'Queues delete messages before workers can see them always.'],
        1, DDIA, 257, 'delivery semantics'),
    ],
  },
  {
    folder: 'design-choices/logging-and-monitoring',
    title: 'System Design — Logging and monitoring',
    notes: `# Logging and monitoring

**${XU}** Ch 1 closes the scale journey with logging, metrics, automation — you cannot operate what you cannot see. **${FSA}**: fitness functions / compliance checks keep characteristics alive.

## Minimum bar

- Metrics: latency, error rate, saturation, QPS
- Structured logs + correlation IDs
- Alerts on user-visible failure, not every debug line
- Dashboards for the load parameters you estimated
`,
    questions: [
      q('As systems scale, Xu emphasizes adding operational tooling such as:',
        ['Deleting logs so disks stay empty during incidents.',
         'Logging, metrics, and automation to run the system.',
         'Manual SSH only with no metrics ever collected.',
         'Disabling alerts so on-call never wakes up.'],
        1, XU, 40, 'logging'),
      q('Architecture fitness functions (FSA) help architects:',
        ['Avoid verifying that teams follow decisions.',
         'Measure compliance with architecture characteristics automatically.',
         'Replace all production monitoring with slideware.',
         'Ban metrics because they encourage premature optimization.'],
        1, FSA, 36, 'measuring compliance using automated fitness functions'),
      tf('True or false: Without monitoring, you cannot tell whether scalability or reliability goals are actually met.',
        true, DDIA, 57, 'Defining and measuring the performance of a system'),
      q('Good alerts should primarily fire on:',
        ['Every debug log line in development laptops.',
         'User-visible symptoms (errors, latency, saturation) that need action.',
         'Successful health checks that return 200 OK continuously.',
         'CDN cache hits for static logo images only.'],
        1, XU, 40, 'automation'),
      q('Correlation IDs in logs help you:',
        ['Hide the path of a request across services during an incident.',
         'Trace one request across services when diagnosing failures.',
         'Encrypt the database by renaming columns randomly.',
         'Increase QPS without adding any capacity.'],
        1, XU, 40, 'logging'),
    ],
  },
  {
    folder: 'design-choices/security-controls',
    title: 'System Design — Security controls',
    notes: `# Security controls

Treat security as an **architecture characteristic** (**${FSA}**). Practical controls show up across Xu designs: rate limits, authn/z, least privilege, encryption in transit.

## Baseline checklist

- TLS everywhere
- Authn + authz on sensitive APIs
- Rate limit abuse paths
- Secrets not in source / client code
- Audit logs for sensitive actions
`,
    questions: [
      q('Rate limiting helps security posture by:',
        ['Allowing unlimited credential stuffing for realism.',
         'Blunting DoS and abusive request patterns against APIs.',
         'Removing passwords so attackers have nothing to steal.',
         'Publishing admin tokens in mobile app binaries.'],
        1, XU, 67, 'A rate limiter prevents DoS attacks, either intentional or unintentional'),
      q('Security as an architecture characteristic means:',
        ['It is optional decoration after the UI ships.',
         'It is a first-class capability that can drive structural decisions.',
         'Only marketers need to worry about account takeover.',
         'Encryption is banned because it slows microbenchmarks.'],
        1, FSA, 31, 'Architecture characteristics… security'),
      tf('True or false: Client-side enforcement alone is insufficient against malicious actors who forge requests.',
        true, XU, 70, 'client requests can easily be forged by malicious actors'),
      q('Least privilege for services typically means:',
        ['Every service uses the root cloud account for convenience.',
         'Each component gets only the permissions it needs to do its job.',
         'Database credentials are hardcoded into public mobile apps.',
         'All environments share one writable production credential.'],
        1, FSA, 31, 'architecture characteristics'),
      q('When users are throttled, Xu says the system should:',
        ['Fail silently with HTTP 200 and an empty body always.',
         'Show clear exceptions/signals that requests were throttled.',
         'Corrupt the user database to discourage retries.',
         'Disable TLS so the response is easier to cache.'],
        1, XU, 69, 'Show clear exceptions to users when their requests are throttled'),
    ],
  },

  // ─── Systems ─────────────────────────────────────────────────
  {
    folder: 'systems/url-shortener',
    title: 'System Design — URL shortener',
    notes: `# URL shortener

Read **${XU}** Chapter 8 (PDF ~p. 149–163). Classic interview system that forces API design, hashing/IDs, redirects, and scale math.

## Scope reminders

- Shorten long URL → short alias
- Redirect short → long
- Clarify: charset (base62), delete/update?, traffic, analytics

## Design sparks

- POST shorten / GET redirect
- **301** vs **302** (cache vs analytics)
- Hash / base62 ID generation; collision handling
- Cache hot redirects; shard storage for billions of rows
`,
    questions: [
      q('Basic use cases Xu lists for a URL shortener include:',
        ['Only deleting URLs with no create or redirect paths.',
         'Shorten long→short, redirect short→long, plus HA/scalability/fault tolerance.',
         'Training ML models on video frames exclusively.',
         'Replacing DNS for the entire public internet.'],
        1, XU, 150, 'URL shortening… URL redirecting… High availability, scalability, and fault tolerance'),
      q('A 301 redirect implies the short URL mapping is treated as:',
        ['Temporary, so every later click still hits the shortener first.',
         'Permanent, so browsers may cache and skip the shortener later.',
         'Invalid, so clients must poll with HTTP 100 Continue.',
         'Encrypted, so only POST can resolve the alias.'],
        1, XU, 153, 'A 301 redirect shows that the requested URL is “permanently” moved'),
      q('A reason to prefer 302 over 301 for a shortener is:',
        ['302 always reduces shortener load more than 301.',
         '302 keeps traffic flowing through the shortener for easier click analytics.',
         '302 disables HTTPS for all subsequent navigations.',
         '302 stores the long URL only in the DNS CNAME record.'],
        1, XU, 153, 'if analytics is important, 302 redirect is a better choice'),
      q('Xu’s example shortened URL charset is described as:',
        ['Only emoji and whitespace characters.',
         'Digits 0-9 and letters a-z / A-Z (base62-style).',
         'Only hexadecimal with mandatory dashes every two chars.',
         'Only Morse code transmitted over SMS.'],
        1, XU, 150, 'combination of numbers (0-9) and characters (a-z, A-Z)'),
      q('With 100M new URLs/day, write QPS is roughly:',
        ['100 million writes per second sustained all day.',
         'About 100M/86400 ≈ ~1k+ writes/sec order of magnitude (Xu ~1160).',
         'Exactly 2 writes per second regardless of assumptions.',
         'Zero writes because shorteners only redirect.'],
        1, XU, 151, '100 million / 24 /3600 = 1160'),
      tf('True or false: Clarifying whether aliases can be deleted/updated is part of establishing design scope.',
        true, XU, 150, 'Can shortened URLs be deleted or updated?'),
    ],
  },
  {
    folder: 'systems/notification-service',
    title: 'System Design — Notification service',
    notes: `# Notification service

Read **${XU}** Chapter 10 (PDF ~p. 187–204).

## Three channels

1. Mobile push (APNS / FCM)
2. SMS (Twilio-class providers)
3. Email (SendGrid-class providers)

## Shape

Services/events → notification system → queue(s) → workers per channel → third parties → devices.

Collect **device tokens / phone / email** at signup; honor **opt-out**. Soft real-time: fast when possible, delay OK under overload.
`,
    questions: [
      q('Xu’s notification formats in scope are:',
        ['Only carrier pigeons and fax machines.',
         'Mobile push, SMS, and email.',
         'Only in-process log lines with no user delivery.',
         'Only browser localStorage writes on the same device.'],
        1, XU, 187, 'mobile push notification, SMS message, and Email'),
      q('iOS push delivery commonly goes through:',
        ['A random public MQTT broker with no auth.',
         'Apple Push Notification Service (APNS) using device token + payload.',
         'Direct SMS gateways that ignore device tokens.',
         'FTP uploads to each phone overnight.'],
        1, XU, 190, 'Apple Push Notification Service (APNS)'),
      q('Android push in Xu’s overview commonly uses:',
        ['APNS exclusively for all Android devices.',
         'Firebase Cloud Messaging (FCM) as a common path.',
         'Only postal mail with printed QR codes.',
         'Direct SQL inserts into the phone’s SQLite over the open internet.'],
        1, XU, 191, 'Firebase Cloud Messaging (FCM) is commonly used'),
      q('Contact info gathering stores device tokens separately because:',
        ['A user can have multiple devices that should all receive pushes.',
         'Device tokens must never be associated with a user id.',
         'Email and SMS cannot be stored in any database table.',
         'APNS forbids persisting tokens longer than one second.'],
        0, XU, 193, 'A user can have multiple devices'),
      tf('True or false: Users who opt out should stop receiving notifications.',
        true, XU, 188, 'users who choose to opt-out will no longer receive notifications'),
      q('Calling the system “soft real-time” means:',
        ['Messages may be delayed forever with no delivery goal.',
         'Deliver ASAP, but slight delay under high load is acceptable.',
         'Every notification must arrive within one microsecond worldwide.',
         'Notifications only send when the on-call engineer presses a button.'],
        1, XU, 188, 'soft real-time… slight delay is acceptable'),
    ],
  },
  {
    folder: 'systems/quiz-platform',
    title: 'System Design — Quiz platform (Json2Exam)',
    notes: `# Quiz platform (this app)

Apply the books to **Json2Exam** itself.

## Today (local-first)

- Static Vite/React app
- Quizzes as JSON; Leitner progress in **localStorage**
- Optional APIs: Ask GPT / speak — serverless handlers
- PDFs via \`sources/\` + page references on cards

## If it grew (design exercise)

| Need | Building block |
|------|----------------|
| Cross-device progress | Auth + Postgres (or similar) |
| Shared classes | Multi-tenant data model |
| Spaced-repetition jobs | Queue / cron workers |
| Heavy AskGPT traffic | Rate limiter + cache |
| Analytics | Events → warehouse (batch) |

Write a one-page design: what stays local vs what moves server-side first. Prefer **trade-offs** over buzzwords (FSA First Law; DDIA).
`,
    questions: [
      q('Json2Exam’s quiz progress today is primarily stored:',
        ['In a globally sharded Postgres cluster with automatic failover.',
         'Locally (e.g. browser localStorage) for a single device profile.',
         'Only on paper flashcards mailed to CSUF each week.',
         'Inside the PDF binary as hidden XMP metadata.'],
        1, DDIA, 16, 'Small amounts of data, which can be stored and processed on a single machine, are often fairly easy to deal with'),
      q('The first scaling step if many classmates need shared progress is usually:',
        ['Jumping straight to multi-region Kafka before any auth exists.',
         'Add authentication and a durable shared database for progress.',
         'Delete all quizzes so there is nothing to sync.',
         'Put the entire SPA inside a CDN edge SQL engine.'],
        1, XU, 11, 'Separating web/mobile traffic… and database'),
      q('AskGPT endpoints under heavy abuse should get:',
        ['Unlimited free calls with no throttling.',
         'Server-side rate limiting and clear throttle errors.',
         'Client-only alerts that attackers will politely obey.',
         'A requirement that every prompt be sung aloud.'],
        1, XU, 66, 'rate limiter limits the number of client requests'),
      q('FSA would call “offline-first localStorage” vs “synced cloud progress” a:',
        ['Law of nature with no downside either way.',
         'Trade-off among simplicity, durability, multi-device access, and cost.',
         'Decision that AI should make without human context.',
         'Problem that microservices always solve automatically.'],
        1, FSA, 34, 'Everything in software architecture is a trade-off'),
      tf('True or false: Book page references on cards are a product feature that ties learning to source PDFs.',
        true, XU, 54, 'demonstrate your design skill'),
      q('Moving spaced-repetition reminders server-side suggests which building block?',
        ['Only a larger CSS file with more animations.',
         'A scheduled job or queue worker that triggers notifications.',
         'Deleting the Leitner algorithm entirely.',
         'Storing due dates only in DNS TXT records.'],
        1, XU, 187, 'notification system'),
    ],
  },
  {
    folder: 'systems/file-upload-system',
    title: 'System Design — File upload / cloud drive',
    notes: `# File upload / cloud drive

Inspired by **${XU}** Chapter 15 (Google Drive) themes + Ch 1 CDN/object storage intuition.

## Problems to name

- Large files, resumable upload
- Metadata DB vs blob/object storage
- Dedup / sync / sharing ACLs
- CDN for downloads; encryption

Even a “simple upload” is a system: API → auth → object store → metadata → processing queue (virus scan, thumbnails).
`,
    questions: [
      q('Why store file bytes in object storage and metadata in a database?',
        ['Because databases cannot store integers smaller than one million.',
         'Blobs scale differently than relational metadata (permissions, names, versions).',
         'Object stores forbid any metadata and databases forbid files always.',
         'CDNs require every file to be embedded in a SQL row as base64.'],
        1, XU, 295, 'Google Drive'),
      q('A CDN in a download-heavy file product mainly helps:',
        ['Transactional ACID writes to the metadata database.',
         'Delivering bytes from edge locations closer to users.',
         'Generating unique primary keys without any coordination.',
         'Running antivirus inside the user’s DNS resolver.'],
        1, XU, 22, 'CDN'),
      q('Resumable uploads matter because:',
        ['Networks never fail mid-transfer on mobile clients.',
         'Large transfers fail often; retrying from offsets saves bandwidth/time.',
         'HTTP cannot send more than 1 KB per connection by specification.',
         'Object storage rejects files larger than a JPEG thumbnail.'],
        1, XU, 295, 'upload'),
      tf('True or false: Authz/ACLs are part of a drive product because sharing is a core use case.',
        true, FSA, 31, 'architecture characteristics'),
      q('Thumbnail generation after upload is a good fit for:',
        ['The user’s browser alert() synchronously before upload returns.',
         'An async queue worker so the upload API stays fast.',
         'A full table lock on all metadata until thumbnails finish.',
         'Manual Photoshop by on-call engineers for each photo.'],
        1, XU, 34, 'message queue'),
    ],
  },
  {
    folder: 'systems/news-feed',
    title: 'System Design — News feed',
    notes: `# News feed

Read **${XU}** Chapter 11 (PDF ~p. 205+) and DDIA’s social timeline case study (~p. 57+).

## Two classic approaches

1. **Fan-out on write** (push): precompute feeds when someone posts — fast reads, heavy writes for celebrities.
2. **Fan-out on read** (pull): compute feed at read time — cheaper writes, heavier reads.

Hybrid: push for normal users, pull for celebrities (DDIA/Xu both reason about this tension).
`,
    questions: [
      q('DDIA’s home-timeline SQL sketch joins posts to follow relationships to:',
        ['Charge every user a fee before showing ads only.',
         'Fetch recent posts from people the user follows.',
         'Delete all followers older than one day automatically.',
         'Convert the social graph into a CDN edge certificate.'],
        1, DDIA, 60, 'home timeline, which displays recent posts by people the user is following'),
      q('Fan-out on write means:',
        ['Computing the feed only when the user opens the app.',
         'Pushing a new post into followers’ feed caches/stores at write time.',
         'Never storing posts so feeds are always empty.',
         'Sending each post via postal mail before any digital write.'],
        1, XU, 205, 'news feed'),
      q('Celebrity users break naive fan-out-on-write because:',
        ['They have so many followers that write amplification explodes.',
         'They are not allowed to post more than one byte of text.',
         'Databases refuse to store posts from verified accounts.',
         'Load balancers drop packets only for famous accounts.'],
        0, DDIA, 58, 'a few celebrities… have over 100 million followers'),
      q('Polling the timeline query every few seconds for millions online users:',
        ['Is free because SQL joins never cost CPU.',
         'Can create enormous read QPS and expensive joins — hence caching/fan-out designs.',
         'Is required by the HTTP specification for all social apps.',
         'Removes the need for indexes on follow tables.'],
        1, DDIA, 60, 'running the query 2 million times per second… This query is also quite expensive'),
      tf('True or false: Hybrid feed strategies exist because push and pull have opposite trade-offs.',
        true, FSA, 34, 'Everything in software architecture is a trade-off'),
    ],
  },
];

for (const deck of decks) {
  const dir = join(ROOT, deck.folder);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'notes.md'), deck.notes.trimStart());
  const questions = deck.questions.map((item) => {
    if (item.type !== 'multiple') return item;
    const idx = item.answer.charCodeAt(0) - 97;
    return Object.assign({}, item, { options: balanceLengths(item.options, idx) });
  });
  writeFileSync(join(dir, 'quiz.json'), JSON.stringify({ title: deck.title, questions }, null, 2) + '\n');
  console.log('wrote', deck.folder, questions.length);
}

console.log('done', decks.length, 'decks');
