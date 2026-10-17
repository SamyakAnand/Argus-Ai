# Build status

**Current verified state:** M3 end-to-end integration and M4 Clerk development-auth foundation (prototype).

## Completed

- Compared deployed ARGUS and NEXUS workspaces read-only at the same viewport; documented exact overlap and distinction.
- Added a private-to-process local SQLite document/chunk store for Markdown and UTF-8 text, stable IDs, SHA-256 deduplication, chunk offsets and a 5 MiB upload cap.
- Added actual document inventory and lexical evidence search endpoints; search returns source passages and offsets, or an explicit insufficient-evidence state.
- Reworked ARGUS Documents to separate text knowledge from structured datasets; Intelligence Search now searches text evidence.
- Added typed `POST /knowledge/ask`: bounded lexical retrieval, explicit insufficient-evidence handling, evidence-only deterministic mode, and opt-in generation through the existing provider gateway.
- Added structured supported-fact/inference/conflict/unanswered sections; references are accepted only when their IDs exist in this request's retrieval set. Uncited and fabricated-reference claims are omitted and counted.
- Added prompt-injection guidance that treats retrieved passages as untrusted; sanitized provider failure responses and secret-safe gateway error logging.
- Added configurable passage/context limits, the synthetic `argus-knowledge-v1` retrieval/citation fixture, and `/knowledge/evaluation` metrics.
- Diagnosed local service mismatch: Next rewrites `/api/*` to `BACKEND_URL`, defaulting to `http://127.0.0.1:8000`; Vercel routes `/api/*` to its API service. On this machine, 3000 was ARGUS Next, 8010 was an older ARGUS API, and Windows saw 8000/3001 owned by `wslrelay.exe` without enough visibility to identify the WSL services. No existing service was stopped or reconfigured. A separate ARGUS API/frontend preview was run on verified-free ports 8012/3002.
- Added a local-only bearer-token adapter. Server environment maps distinct tokens to principal names; the API derives scope from the token and filters document inventory and retrieval by `owner_id`. Scoped content hashes and IDs keep identical uploads under different local principals separate. Legacy database rows migrate to the `local-development` owner. The browser token lives only in tab-scoped session storage and is sent only to knowledge routes. Missing/invalid auth is rejected and local auth fails closed when unset or when `VERCEL` is set.
- Enforced upload extension, media type, strict UTF-8 decoding, and the existing 5 MiB byte limit. Added negative cross-principal tests for inventory, search, ask, and duplicate content IDs.
- The browser upload surfaced a correlated count query bug that reported zero passages after storing a document. Qualified the SQLite subquery and added a regression test asserting one passage in the upload response.
- Expanded the evaluation response with expected evidence IDs, ranked IDs, per-case precision/reciprocal rank, abstention details, and explicit denominators. Added deterministic edge, workflow, auth, and provider-state tests. No ranking algorithm was changed because this fixture does not support a ranking change.
- Preserved the legacy analytics path and existing Git history. No NEXUS files modified.

## Clerk authentication foundation (local development)

- Clerk CLI accountless setup completed for this ARGUS web project. It wrote temporary development keys to ignored `apps/web/.env.local` and claim metadata to ignored `apps/web/.clerk/`; no production instance keys were pulled, no account was created/claimed in the browser, and no deployment was changed. The pre-existing Clerk application named `nexus-web` was not selected; accountless keys were used instead.
- Added `@clerk/nextjs` provider, Clerk proxy middleware, sign-in/sign-up routes, and signed-in account controls. The knowledge API client obtains a Clerk session token and sends it only to `/knowledge/*`; existing local development bearer tokens remain a fallback.
- Added official Python `clerk-backend-api` session verification. The API derives data ownership from the verified Clerk `sub` claim, checks the configured `CLERK_AUTHORIZED_PARTIES`, and continues to ignore request-supplied tenant IDs. Local startup loads the ignored web `.env.local` into the API only outside Vercel. Vercel requires API credentials and an explicit allowed-origin list; no production Vercel variables were configured.
- Added deterministic tests for Clerk verified-user ownership separation, invalid sessions, and local-token rejection on Vercel. These tests use a verifier double; they do not authenticate an actual Clerk user.
- Started an isolated local preview at `http://localhost:3003` with API `http://127.0.0.1:8013`; the existing 3000/3002 and API ports were left running. Sign-in/sign-up pages returned HTTP 200, API health returned 200, and missing/malformed knowledge credentials returned 401 both directly and through the web proxy.

## Blockers / limitations

- Clerk authentication is wired for knowledge routes, but production credentials/origins, account lifecycle policy, key rotation/revocation, encryption, deletion/version lifecycle, durable Vercel persistence, and persistent audit events remain unconfigured or unimplemented. This is not a production security certification.
- Knowledge ownership is derived from the verified Clerk subject or a server-configured local development token. Cross-principal tests cover the knowledge routes, but the legacy structured-data API is outside Clerk authorization and full production tenant isolation has not been audited.
- The Vercel filesystem is ephemeral; this knowledge slice is not durable across serverless instances/redeploys.
- The answer engine is opt-in and provider-dependent; prompt instructions do not guarantee resistance to all document prompt injection. Syntactic citation checks do not prove semantic support. Provider usage can incur cost if a user enables it.
- The existing preview processes on 3000/8000/8010 were left untouched. Their integration remains stale; the isolated source preview used 8012/3002.
- No production Clerk settings were added to Vercel. The API fails closed when production credentials or allowed origins are absent. The Vercel SQLite filesystem remains ephemeral and cannot be used for durable multi-user storage.
- No external model calls were made. Browser answers used generation-disabled mode; deterministic provider doubles cover a cited answer and provider failure in API tests.
- Full responsive and accessibility review remains outstanding.

## Last checks

- Baseline API before dependencies were installed: **31 passed, 2 failed** because this environment lacked the already-declared `openpyxl` and `pyarrow` packages.
- API suite after Clerk work: **50 passed** (one non-failing joblib CPU detection warning). Clerk verifier behavior in these tests uses deterministic doubles.
- Frontend TypeScript check after Clerk work: **passed** (`npm run typecheck`).
- Production Next.js build after Clerk work: **passed**, including the Clerk sign-in/sign-up routes in isolated `.next-argus-clerk-verification` output.
- Local Clerk UI/API smoke check: **passed** sign-in and sign-up pages (HTTP 200), browser rendering of sign-in and create-account controls, API health (HTTP 200), and missing/malformed knowledge sessions rejected with 401 directly and through the frontend proxy. A real account/session sign-in was not performed.
- Isolated browser workflow on port 3002 through the 8012 API: **passed** document upload, duplicate upload returning one document/one passage, supported question retrieving the source excerpt, explicit unsupported-question abstention, empty-library/loading states, invalid-token API error display, stale-result clearing, and generation-disabled evidence-only state.
- Deterministic provider double in the browser: **passed** a cited claim rendered with a clickable `[1]` anchor targeting the actual retrieved passage; a separate provider-error double visibly showed provider failure while preserving the source evidence. These test doubles made no external calls.
- Deterministic API integration test: **passed** upload → deduplication → passage count → search → cited answer whose citation maps to a real retrieved passage → unsupported-question abstention. Provider-disabled and provider-error branches are covered with local doubles.
- Existing local preview at 3000 remains **not integrated** with the current API and was not changed.
- `git diff --check`: **passed** after the final UI and documentation edits. Git printed expected Windows line-ending conversion notices only.

### Synthetic evaluation (argus-knowledge-v1)

Four synthetic questions, three labeled evidence passages, one expected abstention; measured with local lexical retrieval at K=3. Each positive case returns exactly its expected passage at rank 1; the abstention case returns none. Recall@3 is 3/3 = **1.000**. Macro Precision@3 is (1/3 + 1/3 + 1/3 + 0)/4 = **0.250** because each positive case contributes one hit over three result slots and the abstention contributes zero. MRR@3 is (1 + 1 + 1 + 0)/4 = **0.750**, with the abstention case included as zero in the case denominator. Abstention accuracy is **1.000**. Citation reference acceptance **1.000** and fabricated-reference rejection **1.000** test validator protocol only, not semantic entailment or relevance. This tiny fixture is not a production benchmark.

## Next step

Next, configure Clerk production credentials and allowed origins, audit all production routes, and add durable tenant-scoped storage before any sensitive use; then implement safe PDF/DOCX extraction, hybrid retrieval, semantic citation review, and a human-reviewed evaluation set. Do not deploy the current prototype for sensitive data.

## Acceptance snapshot

| Criterion | Status |
| --- | --- |
| ARGUS and NEXUS product overlap documented; NEXUS checkout untouched | PASS |
| Distinct knowledge library and Ask ARGUS UI wired to APIs | PASS |
| Markdown/UTF-8 text ingestion, stable IDs, chunk offsets, lexical retrieval | PASS (local prototype) |
| No-provider mode returns evidence only; unsupported question abstains | PASS (tested) |
| Opt-in structured claims with current-result citation ID validation | PASS (tests; semantic entailment NOT VERIFIED) |
| PDF/DOCX, embeddings, hybrid retrieval, semantic citation entailment | NOT IMPLEMENTED |
| Local bearer adapter and principal filtering on knowledge routes | PASS (local-only; tests) |
| Production identity, tenant isolation and durable shared storage | NOT IMPLEMENTED |
| API tests / typecheck / production build | PASS (50 API tests; typecheck and build passed) |
| Browser upload, dedup, retrieval, abstention and visible errors | PASS on isolated local preview |
| Comprehensive responsive/accessibility QA | NOT VERIFIED |
| Existing local preview connected to current API | NOT CONNECTED (stale services left untouched) |
| Deployment verification | NOT VERIFIED |
| Commit, push, deploy | NOT PERFORMED (not authorized by the current task directive) |
