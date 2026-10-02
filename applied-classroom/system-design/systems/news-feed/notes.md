# News feed

Read **System Design Interview – An Insider's Guide** Chapter 11 (PDF ~p. 205+) and DDIA’s social timeline case study (~p. 57+).

## Two classic approaches

1. **Fan-out on write** (push): precompute feeds when someone posts — fast reads, heavy writes for celebrities.
2. **Fan-out on read** (pull): compute feed at read time — cheaper writes, heavier reads.

Hybrid: push for normal users, pull for celebrities (DDIA/Xu both reason about this tension).
