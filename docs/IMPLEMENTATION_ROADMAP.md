# ARGUS AI Backend Productionization Roadmap

This roadmap follows the findings in [ENGINEERING_AUDIT.md](ENGINEERING_AUDIT.md). The repository is an early prototype; no phase should be marketed as complete until its code, tests, and deployment path demonstrate it.

## Phase 0 — Safety baseline

- Establish verified Clerk identity for private API routes, tenant-aware ownership and negative cross-tenant tests; define a separate read-only synthetic demo boundary.
- Constrain REST and SQL connector destinations, redirects, protocols, DNS resolution, response sizes, query behavior, credentials, and error redaction.
- Fail closed when configured persistence is unavailable; remove silent persistence fallbacks and swallowed write errors.
- Add request IDs, safe errors, input/body limits, rate controls and readiness that reports real dependency state.

## Phase 1 — Persistent foundation

- Adopt SQLAlchemy 2.x repositories and Alembic migrations against PostgreSQL; reconcile the existing DDL and ORM before migrating data.
- Model users/workspaces and tenant-owned datasets, dataset versions, documents, document versions/chunks, ingestion jobs, runs/evidence/citations, audit events, evaluations and usage records.
- Move original and derived artifacts to S3-compatible storage; define backup/restore and local-only SQLite test/dev modes.

## Phase 2 — Document ingestion and jobs

- Implement validated TXT/Markdown first, then isolated PDF and DOCX parsing with byte/resource limits and provenance offsets/page/section metadata.
- Persist idempotent job lifecycle, retry/recovery, duplicate detection, versioning, reprocessing, deletion and truthful status events.
- Add Redis/RQ worker service only alongside lifecycle and worker-restart tests; keep API request handlers bounded.

## Phase 3 — Retrieval and evidence answers

- Establish PostgreSQL lexical retrieval and pinned, versioned embedding generation with explicit dimensions and pgvector storage.
- Enforce permissions before retrieval results enter bounded context; fuse rankings with deterministic RRF and add reranking only behind measured need.
- Validate citation membership and source spans; add claim support/contradiction review and abstention behavior. Preserve explicit limitations where semantic support cannot be established.

## Phase 4 — Unified provider and analytics controls

- Consolidate providers behind one typed gateway with redacted logs, timeouts, bounded retries, circuit behavior, token/cost accounting and distinct configured/reachable/inference-tested states.
- Preserve deterministic analytics; add a strict tool registry, SQL AST validation, execution limits, reproducible traces and dataset-version provenance.
- Remove unused dependencies/status claims only after verifying no active path depends on them.

## Phase 5 — Evaluation and operations

- Maintain reviewed/versioned evidence labels; produce machine-readable runs with commit/config/model metadata and honestly measured retrieval, citation, abstention, latency, usage, cost, throughput and recovery metrics.
- Expand CI with PostgreSQL migrations/isolation, connector security, ingestion/retrieval/provider/worker tests, dependency scanning and workflow integration tests.
- Document deployment, environment configuration, backup/restore, alerts and rollback. Keep target thresholds separate from measured results.

## Phase 6 — Minimal frontend integration

- Preserve ARGUS visual identity and page structure. Update only authentication headers, real ingestion/job states, provider/readiness status, persistence-backed sessions, citation navigation and accurate limitations as backend paths become available.
- Rename structured-data lineage to Source Lineage when that interface is next touched; do not imply a document knowledge graph or unsupported multimodal capability.

## Delivery gates

1. Private route authentication and cross-tenant negative tests pass.
2. Connector destination and redirect attacks are blocked without internal network access.
3. PostgreSQL migrations, startup failure, transactions, and restore are demonstrated; uploads survive restart.
4. Worker failures recover and status reflects persisted events.
5. Retrieval returns real permission-filtered source passages; citation source/span checks and abstention tests pass.
6. Analytics remains deterministic and bounded; provider and job failures are visible and redacted.
7. CI passes on synthetic/test data; evaluation reports include measured output only.
8. Deployment configuration, required variables, backup/restore, and known limitations are documented.

## Current execution slice

The initial implementation slice removes silent configured-database fallback from engine construction, schema initialization, and startup restoration. Regression tests cover each boundary. The full API suite also exposed that Parquet support lacked its runtime engine dependency; `pyarrow` is now declared in both dependency manifests. These are necessary safety/capability corrections, not completion of Phase 0: later persistence reads/writes in `main.py` still contain broad exception suppression and must be migrated behind transactional repositories.
