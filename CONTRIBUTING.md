# Contributing to ARGUS AI

Thank you for considering a contribution to ARGUS AI. The project is a development-preview knowledge workspace. Contributions should improve source traceability, safe document handling, retrieval behavior, evaluation, or the clarity of its product boundaries.

## Start here

- Read [README.md](README.md), especially the project-status, local-development, and security sections.
- For a substantial feature or behavior change, open an issue before implementation so the scope and acceptance criteria can be discussed.
- Keep each pull request focused and explain any impact on local setup, authentication, data storage, or deployment.
- Never commit API keys, Clerk secrets, local tokens, environment files, user documents, or generated local databases.

## Local checks

The CI workflow currently uses Python 3.12 and Node.js 22.

### API tests

From the repository root:

\`\`\`bash
python -m pip install -r apps/api/requirements.txt pytest httpx
pytest -c apps/api/pytest.ini apps/api/tests
\`\`\`

### Web checks

\`\`\`bash
cd apps/web
npm ci
npm run typecheck
npm run build
\`\`\`

Run the relevant checks before requesting review. If a change introduces new behavior, add tests or document a repeatable manual verification procedure.

## Project-specific engineering principles

### Evidence and retrieval

- Preserve source identifiers and offsets so retrieved passages can be traced to their original document.
- Do not claim that a citation-ID check proves semantic entailment.
- Keep retrieval behavior and optional answer synthesis distinct in code and documentation.
- When a requested answer cannot be supported by retrieved evidence, prefer a clear limitation over invented content.

### Identity and data boundaries

- Treat authenticated identity as server-verified input; do not trust a user ID supplied in an arbitrary request body.
- Keep local development-token behavior separate from hosted authentication.
- Do not weaken tenant scoping, authorization checks, or database row-level security.
- Never expose secrets to browser bundles or commit them to the repository.
- Do not describe local SQLite or development-token flows as production-ready multi-tenant security.

### Honest product scope

- Distinguish the current document knowledge workflow from legacy structured-data analytics features.
- Describe parser-derived code/data relationships as incomplete where applicable.
- Do not imply that the system is ready for sensitive workloads or production tenant administration unless the required controls are implemented and tested.
- Include reproducible evidence for quality, performance, or security claims.

## Pull request checklist

- [ ] The change has a clear problem statement and bounded scope.
- [ ] Relevant API tests pass.
- [ ] Web type-check and production build pass when frontend code changes.
- [ ] New behavior has tests or reproducible manual verification steps.
- [ ] Source references, offsets, and authorization boundaries remain correct.
- [ ] Documentation reflects actual behavior and known limitations.
- [ ] No secrets, private documents, local databases, or unrelated files are included.

## Describe your pull request

Include:

1. **Problem:** what needs to improve?
2. **Approach:** what changed and why?
3. **Verification:** exact commands and outcomes.
4. **Security/data impact:** any change to identity, storage, retention, or access control.
5. **Limitations:** what remains out of scope?

Thanks for helping keep ARGUS useful, inspectable, and honest about its evidence.
