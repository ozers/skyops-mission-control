# ADR-3 - `btree_gist` exclusion constraint for mission overlap

**Status:** Accepted

## Context

A drone can't be double-booked: no two active missions for it may have overlapping
windows. Checking in app code ("is it free?" then insert) loses to concurrency - two
requests pass the check and both insert. So app-level validation isn't enough.

## Decision

Enforce it in Postgres:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE missions ADD CONSTRAINT missions_no_overlap
  EXCLUDE USING gist (
    drone_id WITH =,
    tstzrange(scheduled_start, scheduled_end) WITH &&
  )
  WHERE (status IN ('PLANNED', 'PRE_FLIGHT_CHECK', 'IN_PROGRESS'));
```

`btree_gist` lets equality (`drone_id =`) and range overlap (`&&`) share one GiST index.
The partial `WHERE` means only active missions block each other. The app still checks first
for a clean `409`; the constraint is the guarantee, and the repo maps violations to a
domain conflict error.

## Alternatives considered

- **App check only** - not concurrency-safe.
- **`SERIALIZABLE`** - correct, but needs a retry loop and adds contention.
- **Advisory lock / `FOR UPDATE` per drone** - works, but breaks if a code path forgets the
  lock; no declarative guarantee.
- **Discrete slot + `UNIQUE`** - can't express arbitrary ranges.

Only the exclusion constraint makes overlap impossible at the storage layer.

## Consequences

Double-booking is impossible under concurrency, proven by a parallel-insert test. Cost: the
`btree_gist` extension and a hand-written SQL migration (TypeORM can't express it) - fine,
since it's explicit. Row-level locking on single-mission transitions is a separate concern.
