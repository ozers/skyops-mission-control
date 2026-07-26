# SkyOps Mission Control

Mission control and maintenance tracker for an industrial drone fleet - drone registry,
mission scheduling with a state machine, maintenance logs, a dashboard, and a fleet health
report.

Built as a small but production-shaped NestJS reference: business rules isolated in a
dependency-free domain layer, ports and adapters around it, and the interesting invariants
(mission overlap, concurrent state transitions) enforced in PostgreSQL rather than only in
application code.

> **Status: work in progress.** Foundation is being scaffolded; modules land next.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | NestJS (TypeScript), TypeORM |
| Database | PostgreSQL (`btree_gist` exclusion constraints), Redis |
| Frontend | React (TypeScript) |
| Testing | Jest (unit + integration), Playwright (e2e) |
| Tooling | pnpm workspaces, strict TypeScript |

## Architecture

Ports-and-adapters, one bounded context per feature:

```
apps/
  api/            NestJS backend
    <context>/
      domain/          rules, value objects, events - no framework, no DB
      application/     use cases; depend on ports only
      infrastructure/  TypeORM / Redis adapters
      interface/       controllers, DTOs
  web/            React frontend
packages/
  contracts/      shared DTO / response types
```

Key decisions are recorded as ADRs:

- [ADR-1 - Hexagonal architecture, domain-first](docs/adr/1-hexagonal-architecture.md)
- [ADR-2 - Mission state machine in the domain](docs/adr/2-state-machine-in-domain.md)
- [ADR-3 - `btree_gist` exclusion constraint for mission overlap](docs/adr/3-exclusion-constraint-for-overlap.md)
- [ADR-4 - No message broker or search engine (yet)](docs/adr/4-excluded-broker-and-search.md)

## Getting started

Prerequisites: Node.js 20.x, pnpm 10.x, Docker.

```bash
pnpm install
```

Run instructions (Docker Compose stack, migrations, seed, dev servers) will be documented
here as the backend lands.

## License

MIT
