# SkyOps Mission Control

Mission control and maintenance tracker for an industrial drone fleet: a drone registry,
mission scheduling with a state machine, maintenance logs, and a fleet health report.

Built as a production-shaped NestJS backend. Business rules live in a dependency-free
domain layer, ports and adapters sit around it, and the interesting invariants (no
double-booked drones, correct concurrent state transitions) are enforced in PostgreSQL
rather than only in application code.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | NestJS (TypeScript), TypeORM |
| Database | PostgreSQL 16 (`btree_gist` exclusion constraint, hand-written migrations) |
| Testing | Jest (unit + integration), supertest (e2e) |
| Tooling | pnpm workspaces, strict TypeScript, GitHub Actions CI |
| API docs | Swagger UI at `/docs` |

Redis is included in `docker-compose` for the fleet-health cache adapter described in
[ADR-4](docs/adr/4-excluded-broker-and-search.md); the app runs without it.

## Getting started

Prerequisites: Node.js 20.x, pnpm 10.x, Docker.

```bash
# 1. install
pnpm install

# 2. start Postgres and Redis
docker compose up -d

# 3. configure the API (defaults match docker-compose; Postgres is published on 5433)
cp apps/api/.env.example apps/api/.env

# 4. run migrations and seed data (20 drones, 50 missions, 30 maintenance logs)
pnpm --filter api migration:run
pnpm --filter api seed

# 5. start the API
pnpm --filter api start:dev
```

The API listens on `http://localhost:3000`. Swagger UI is at `http://localhost:3000/docs`.

> Postgres is published on host port **5433** to avoid clashing with a local Postgres on
> 5432. In CI, where there is no conflict, it uses 5432 (the code default).

## Testing

```bash
pnpm --filter api test              # unit (domain + use cases), no database
pnpm --filter api test:integration  # repository tests against Postgres
pnpm --filter api test:e2e          # full HTTP flow against Postgres
```

Integration and e2e tests need the Docker stack up and migrated.

## API

All routes are under `/api/v1`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/drones` | Register a drone |
| GET | `/drones` | List drones (paginated, filter by status) |
| GET | `/drones/:id` | Get a drone |
| PATCH | `/drones/:id` | Update a drone |
| DELETE | `/drones/:id` | Delete a drone (409 if it has history) |
| POST | `/drones/:id/retire` | Retire a drone (409 if it has scheduled missions) |
| POST | `/drones/:id/maintenance` | Put a drone into maintenance |
| POST | `/drones/:id/maintenance-logs` | Log completed maintenance |
| GET | `/drones/:id/maintenance-logs` | Maintenance history |
| POST | `/missions` | Schedule a mission |
| GET | `/missions` | List missions (filter by status, drone, date range) |
| POST | `/missions/:id/transitions` | Transition a mission through its lifecycle |
| GET | `/fleet/health` | Fleet health report |
| GET | `/health`, `/health/ready` | Liveness and readiness |

## Architecture

Ports and adapters, one bounded context per feature:

```
apps/
  api/
    src/<context>/
      domain/          rules, value objects, state machine, errors  (no framework, no DB)
      application/     use cases; depend on port interfaces only
      infrastructure/  TypeORM entities, repositories, transaction runner
      interface/       controllers, DTOs, presenters
packages/
  contracts/           shared enums and response types (backend <-> frontend)
```

Dependencies point inward, toward the domain. The domain knows nothing about NestJS or
TypeORM, so the business rules unit-test in milliseconds without a database.

Key decisions are recorded as ADRs:

- [ADR-1 — Hexagonal architecture, domain-first](docs/adr/1-hexagonal-architecture.md)
- [ADR-2 — Mission state machine in the domain](docs/adr/2-state-machine-in-domain.md)
- [ADR-3 — `btree_gist` exclusion constraint for mission overlap](docs/adr/3-exclusion-constraint-for-overlap.md)
- [ADR-4 — No message broker or search engine (yet)](docs/adr/4-excluded-broker-and-search.md)

Two invariants worth calling out:

- **No double-booked drones.** A `btree_gist` exclusion constraint makes overlapping active
  missions for the same drone impossible at the database level. The app checks first for a
  clean 409; the constraint is the guarantee, and a concurrency test proves it.
- **Correct concurrent transitions.** A mission transition runs in one transaction with the
  mission and drone rows locked `FOR UPDATE`, so two concurrent transitions can't lose an
  update. A concurrency test proves that too.

## Status and next steps

The backend is complete and tested. Still to do:

- React frontend (dashboard and management pages) with a Playwright e2e flow.
- Redis cache for the fleet health report (the seam is in place; see ADR-4).
- Domain events and an `Idempotency-Key` on mission creation.
