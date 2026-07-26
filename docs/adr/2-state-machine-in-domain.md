# ADR-2 - Mission state machine lives in the domain

**Status:** Accepted

## Context

A mission moves `PLANNED → PRE_FLIGHT_CHECK → IN_PROGRESS → COMPLETED`, and the first
three can branch to `ABORTED` (with a reason). An invalid transition - e.g. restarting a
completed mission - corrupts the data. This is the core business rule in the brief.

## Decision

Transitions live in the domain as an explicit table, not scattered `if`s. `Mission`
exposes `beginPreFlight()`, `start()`, `complete(hours)`, `abort(reason)`; each checks the
table and throws `IllegalTransitionError`. Anything not in the table is illegal by default.
Transitions also drive drone side effects (`start` → drone `IN_MISSION`, `complete` → log
hours + re-check maintenance, `abort` → drone `AVAILABLE`). No TypeORM/NestJS in this file.

## Consequences

Every legal and illegal transition is unit-testable without a database. Rules sit in one
readable table, so a new state is a small local change; persistence only stores the result.
