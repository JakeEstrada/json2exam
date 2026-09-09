# Chapter 5 — Establishing the Business Requirements

**Main idea:** Why are we building this product, where are we trying to go, and how much of that goal are we building right now?

Business requirements explain *why* the organization is building the product. Two major parts: **product vision** and **project scope**.

## Vision vs Scope

| | Vision | Scope |
|---|---|---|
| Question | Where are we ultimately trying to go? | What part of that are we building now? |
| Timeframe | Long term | Short term, per release |
| Changes | Slowly | Per release |

Memory hook:

- **Vision = destination**
- **Scope = how far we're going on this trip**

Scope must account for cost, schedule, resources, and quality.

## Stakeholder conflicts

Different stakeholders want different things:

- Customer wants simplicity
- User wants convenience and features
- Developer might want interesting technology
- Manager wants predictability and profit

Not everyone gets everything. The **project sponsor** resolves major business-level conflicts.

## Business requirements drive the lower levels

They guide:

- Which use cases belong in the system
- Which use cases are most important
- How extensively they should be implemented

If a feature doesn't support a business objective, there'd better be a strong reason for it.

## Vision and Scope Document

Owned by the **project sponsor**, with input from stakeholders and subject-matter experts. Three sections:

### 1. Business Requirements

- Background
- Business opportunity
- Business objectives
- Success metrics
- Vision statement
- Business risks
- Assumptions and dependencies

### 2. Scope and Limitations

- Major features
- Initial release scope
- Future release scope
- Limitations
- Exclusions

### 3. Business Context

- Stakeholder profiles
- Project priorities
- Deployment considerations

## Scope representation techniques

- **Context diagram:** the system, external entities, and info flowing between them
- **Ecosystem map:** the broader systems/components that interact with each other
- **Feature tree:** breaks a large feature into sub-features

Feature tree example:

```
Order Chemicals
├── Search
│   ├── Search local lab
│   ├── Search preferred vendor
│   └── Search vendor catalog
└── Chemical Request
```

That's step-by-step refinement.

## Scope control

Goal: prevent uncontrolled scope creep. When a new requirement shows up, three options:

1. In scope → keep it
2. Out of scope → reject or defer it
3. Technically out of scope but valuable enough → intentionally change the scope

Option 3 matters. Changing scope isn't automatically bad. **Uncontrolled** scope change is the problem.
