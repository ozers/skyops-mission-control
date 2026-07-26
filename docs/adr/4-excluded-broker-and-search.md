# ADR-4 - No message broker or search engine (yet)

**Status:** Accepted

## Context

The brief needs a drone registry, mission scheduling, maintenance logs, a dashboard, and a
fleet health report. Nothing in it requires asynchronous messaging or full-text search, and
at this scale (150+ drones) PostgreSQL handles the query load. Judged against the actual
acceptance criteria, a message broker or a search cluster isn't warranted here.

## Decision

Don't build either, but keep the seam so each is an additive change if a requirement shows
up:

- Events go through a publisher port backed by a transactional outbox. A broker becomes a
  relay that reads the outbox and publishes - domain and application code don't change.
- Queries go through a query port; an Elasticsearch adapter would sit behind it if search
  outgrew Postgres indexes.

## If a broker is required (e.g. "integrate RabbitMQ")

Add a worker that reads unpublished `outbox` rows and publishes them to RabbitMQ
(at-least-once), marking rows as sent; add RabbitMQ to `docker-compose`, and add consumers
for whatever needs the events. Consumers dedupe by event id, and per-drone ordering is
handled with a routing key if needed. Because the outbox writes the event in the same
transaction as the state change, nothing is lost or double-emitted at the source - the
change is contained to infrastructure.

## Consequences

Smaller operational surface, and faster delivery of what the brief actually asks for. The
trade-off is no asynchronous delivery or full-text search today - both are adapter-sized
additions when the requirements call for them.
