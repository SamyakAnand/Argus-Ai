# ARGUS / NEXUS product boundary

## Live comparison (17 October 2026)

Both deployed `/workspace` pages were opened read-only at the same browser viewport. They share the same dataset-first three-column workspace: dataset inventory at left, natural-language analytics composer and five-stage analysis flow in the center, insights/evidence/data/notes at right, and a trace drawer below. Both exposed the same Retail Operations demo (12 columns, 6,564 rows), dataset preview/upload, cleaning, analysis history, reports, agent traces and evaluations. ARGUS added shell routes and relabeled the product “Knowledge Intelligence,” but the live workspace still returned deterministic dataset statistics, charts, SQL, and field-based evidence. Visual changes (dark palette and shell navigation) did not establish a different product workflow.

## Overlap and gaps ordered by impact

1. **Core workflow duplication (P0):** ARGUS and NEXUS both center on structured datasets and analytical operations. Keep NEXUS as the autonomous data analyst; ARGUS should center on document questions, evidence, provenance, conflicts and decisions.
2. **Knowledge capability absent (P0):** before this change, no document ingestion, chunk records, lexical/vector index, RRF, document citations, answerability decision, or evidence-grounded generation existed. The existing `knowledge_embeddings` database DDL was not wired into application code.
3. **ARGUS navigation was misleading (P1):** “Documents” uploaded CSV/XLSX/JSON; “Intelligence Search” invoked dataset analysis; “Knowledge Graph” rendered structured source lineage; research sessions lived in browser storage. Evaluation mostly measured deterministic analytics fixtures. These names overstated the underlying ARGUS-specific workflows.
4. **Administration and security gaps (P0):** unauthenticated API routes, no tenant ownership filters, in-memory analytics state, ephemeral Vercel filesystem, broad swallowed database errors, and caller-controlled connector URLs make sensitive multi-tenant use unsafe.
5. **Shared patterns worth retaining:** keyboard-accessible shell, responsive navigation, visible execution state, inspectable traces, evidence panel structure, and explicit unavailable states. Keep these as generic interaction patterns only.

## Implemented vertical slices

- Added a separate local SQLite-backed store for Markdown and UTF-8 text documents, with SHA-256 content identity, stable document/chunk IDs, offsets, duplicate-upload idempotency, a 5 MiB limit, and 1,000-character overlapping chunks.
- Added `/knowledge/documents` upload/list and `/knowledge/search` lexical term-frequency ranking. Search returns actual passage text, source/version IDs, offsets, retrieval method and measured score.
- Added `/knowledge/ask`: bounded retrieval and optional structured answer generation through the existing gateway. Generation defaults off; without an opted-in provider, it returns evidence only. Citation IDs must resolve to retrieved passages; the check is syntactic, not semantic entailment.
- ARGUS Documents separates knowledge sources from structured datasets. Ask ARGUS displays supported facts, inferences, conflicts, unanswered issues, clickable provenance, provider failures, and a small reproducible synthetic evaluation.

## Explicitly not implemented / remaining

No PDF/DOCX parsing, OCR, embeddings, semantic retrieval, BM25 implementation, RRF, reranker, semantic entailment validator, robust conflict detector, investigations, decision briefs, document deletion/version history, authentication, authorization, tenant isolation, persistent audit event store, or durable shared object storage. The local SQLite store has no tenant boundary and the Vercel filesystem is ephemeral. Do not put sensitive data into this prototype. See [BUILD_STATUS.md](BUILD_STATUS.md).
