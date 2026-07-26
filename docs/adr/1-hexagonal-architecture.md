# ADR-1 - Hexagonal architecture, domain-first

**Status:** Accepted

## Context

Default NestJS mixes business rules into controllers and TypeORM entities. Testing one
rule then needs a database, and small changes touch the DB.

## Decision

Four layers per context - `domain` (rules, no framework/DB), `application` (use cases,
depend on ports only), `infrastructure` (TypeORM/Redis adapters), `interface`
(controllers/DTOs). Dependencies point inward; the domain knows nothing outside it.

## Consequences

Rules are testable without a database, and a feature or bug stays in one layer - adding a
`PAUSED` state is one row in the domain table plus a migration. Cost: more files and
mapping, which is overkill for plain CRUD but justified by the domain logic here.
