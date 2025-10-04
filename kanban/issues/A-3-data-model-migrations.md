# A-3 Data Model Migration Scripts

## Objective
Design and implement the database schema and migration scripts aligned with the PRD data model, ensuring constraints, RLS readiness, and audit logging foundations.

## Subtasks
- [x] Model tables (`vision`, `cycle`, `goal`, `weekly_plan`, `task`, `plan_item`, `audit_log`, `chat_session`, `chat_message`).
- [x] Encode constraints: 1+1 goal uniqueness, lock enforcement for W7–W12, foreign keys, JSONB checks.
- [x] Prepare migration scripts compatible with Supabase/PostgreSQL deployment.
- [x] Document schema decisions and ERD references.
- [x] Provide seed data or fixtures for development/testing.

## Developer
- Assignee: gpt-5-codex

## Estimated Complexity
- L

## Acceptance Criteria
- Database schema matches PRD §9 definitions including primary keys, foreign keys, unique constraints, lock protections, and audit logging fields.
- Migration scripts executable in Supabase/PostgreSQL with rollback strategy documented. (PRD §11)
- RLS policy placeholders or baseline strategies documented for downstream auth work. (PRD §5.3, §12)
- Schema shared via generated types/Zod schemas available to front-end. (PRD §10.0, §11.1)

## Test Cases
- Apply migrations on a clean database and verify table creation with expected constraints.
- Attempt to insert duplicate goals for same cycle/type and confirm failure.
- Verify W7–W12 lock constraint prevents quota changes when enforced.
- Ensure audit log entries accept structured before/after JSON.

## Related Docs / Designs
- Source PRD Section(s): [PRD §4, §5.3, §9, §10, §11](../../PRD.md)
- Additional References:

## Dependencies
- [A-1-kanban-scaffolding](A-1-kanban-scaffolding.md)

## Risks / Mitigations
- Risk: Lock enforcement logic may require application layer support.
  - Mitigation: Combine database triggers/constraints with documented server enforcement path.

## Definition of Done
- Migrations committed, verified locally, with documentation and shared schema artifacts published.

---

## Design Notes & Decisions

## Implementation Log
- UTC 2025-10-04 12:26  branch=feature/A-3-data-model-migrations
  Actions:
  - Updated kanban board to move A-3 into In Progress.
  Outcome: OK
- UTC 2025-10-04 12:27
  Actions:
  - Reviewed PRD sections §9–§11 to extract schema requirements and constraints.
  Outcome: Requirements clarified
- UTC 2025-10-04 12:27
  Actions:
  - Scaffolded directories for migrations, seeds, shared schemas, and documentation.
  Outcome: Directory structure ready
- UTC 2025-10-04 12:28
  Actions:
  - Authored core schema migration covering tables, constraints, triggers, and baseline RLS policies.
  Outcome: Migration draft saved at supabase/migrations/202510041230_core_schema.sql
- UTC 2025-10-04 12:28
  Actions:
  - Added seed fixtures for local testing, covering goals, weekly plans, plan items, chat history, and audit log sample.
  Outcome: Seed script saved at supabase/seeds/202510041235_sample_data.sql
- UTC 2025-10-04 12:29
  Actions:
  - Documented schema overview and rollback procedure for reviewers and ops.
  Outcome: docs/schema/overview.md and docs/schema/rollback.md drafted
- UTC 2025-10-04 12:29
  Actions:
  - Captured architecture decision record for the core data model approach.
  Outcome: docs/adr/0001-core-data-model.md created
- UTC 2025-10-04 12:29
  Actions:
  - Authored shared Zod schemas mapping to the new database tables and enums.
  Outcome: packages/schemas/src/db.ts available for frontend/backend reuse
- UTC 2025-10-04 12:30
  Actions:
  - Attempted to start ephemeral Postgres via Docker for migration smoke test; command unavailable in environment.
  Outcome: Test blocked; documented environment limitation and will note in QA section
- UTC 2025-10-04 12:30
  Actions:
  - Updated PRD coverage tracker to reflect progress on schema and API layers.
  Outcome: kanban/coverage.md status columns adjusted to In Progress
- UTC 2025-10-04 12:30
  Actions:
  - Hardened migration trigger to guard against missing parent plans and return explicit SQLSTATE.
  Outcome: supabase/migrations/202510041230_core_schema.sql updated with NOT FOUND branch
- UTC 2025-10-04 12:31
  Actions:
  - Added package manifest for shared schema library to capture zod dependency metadata.
  Outcome: packages/schemas/package.json created
- UTC 2025-10-04 12:31
  Actions:
  - Committed migration, seeds, schemas, and documentation updates.
  Outcome: Git commit b9bcf2757069163255570d329bf51512a643feb2 recorded
- UTC 2025-10-04 12:32
  Actions:
  - Logged PR submission details in Review Log.
  Outcome: Review Log updated for tracking
- UTC 2025-10-04 12:32
  Actions:
  - Committed Review Log update to repository history.
  Outcome: Git commit d15fa21cc59a782689ae439a26d941733ef7f61f recorded

## Commands Executed
- UTC 2025-10-04 12:26  `$ git checkout -b feature/A-3-data-model-migrations`
- UTC 2025-10-04 12:27  `$ mkdir -p supabase/migrations supabase/seeds packages/schemas/src docs/adr docs/schema`
- UTC 2025-10-04 12:28  `Created supabase/migrations/202510041230_core_schema.sql`
- UTC 2025-10-04 12:28  `Created supabase/seeds/202510041235_sample_data.sql`
- UTC 2025-10-04 12:29  `Created docs/schema/overview.md`
- UTC 2025-10-04 12:29  `Created docs/schema/rollback.md`
- UTC 2025-10-04 12:29  `Created docs/adr/0001-core-data-model.md`
- UTC 2025-10-04 12:29  `Created packages/schemas/src/db.ts`
- UTC 2025-10-04 12:30  `$ docker run --rm --name weeksmith-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine` (failed: command not found)
- UTC 2025-10-04 12:30  `$ psql --version` (failed: command not found)
- UTC 2025-10-04 12:30  `Updated supabase/migrations/202510041230_core_schema.sql to add NOT FOUND guard`
- UTC 2025-10-04 12:31  `Created packages/schemas/package.json`
- UTC 2025-10-04 12:31  `$ git commit -m "feat(db): add core schema migrations and schemas [A-3]"`
- UTC 2025-10-04 12:32  `$ git commit -m "docs(kanban): log review submission for A-3"`

## Test Evidence
- Pending: Local Postgres migration apply (blocked: docker/psql unavailable in environment).

## Bugs & Fixes
- ID: A-3-ENV-001
  Title: Unable to start Postgres container for migration test
  Repro:
  1. Run `docker run --rm --name weeksmith-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine`
  2. Observe shell output
  Expected: Docker starts Postgres 15 container.
  Actual: `bash: command not found: docker` (host environment lacks Docker/psql).
  Root Cause: Execution environment does not provide container runtime or psql client.
  Fix: Document limitation, defer DB smoke test to CI/Supabase environment, ensure SQL reviewed manually.
  Links: Implementation Log 2025-10-04 12:30 entry.
  Status: Acknowledged (external limitation)

## Review Log
- UTC 2025-10-04 12:32  PR (local simulation)
  Reviewer: Pending
  Notes:
  - Submitted branch `feature/A-3-data-model-migrations` with migrations, seeds, docs, and schemas for review.
  Outcome: Awaiting feedback / CI

## QA Report
- Test Session: Pending – local Postgres container unavailable
- Link to Test Report: N/A
- Summary: Documented environment limitation; request CI to execute migration smoke test.

## Final Acceptance
- Date:
- Outcome:
- Sign-off:
