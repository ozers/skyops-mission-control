# Architecture Decision Records

Short records of non-obvious decisions. Context → Decision → Consequences, one page each.

> Reviewed and rewritten in my own words. Give them a final read before pushing.

| # | Decision | Status |
| --- | --- | --- |
| [1] | [Hexagonal architecture, domain-first](1-hexagonal-architecture.md) | Accepted |
| [2] | [Mission state machine lives in the domain](2-state-machine-in-domain.md) | Accepted |
| [3] | [`btree_gist` exclusion constraint for mission overlap](3-exclusion-constraint-for-overlap.md) | Accepted |
| [4] | [No message broker or search engine (yet)](4-excluded-broker-and-search.md) | Accepted |

Other decisions (row-level locking, idempotency keys, transactional outbox, Redis cache)
are recorded in [`../../PLAN.md`](../../PLAN.md) and may become their own ADRs later.
