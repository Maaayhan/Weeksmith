# A-4 Auth & RLS Baseline

## Objective
Implement authentication and row-level security foundations ensuring user isolation, minimal data exposure, and compliance with PRD security requirements.

## Subtasks
- [x] Configure Supabase auth (email-based) and session handling within Next.js App Router.
- [x] Enable RLS on all user-domain tables with baseline policies.
- [x] Implement audit logging scaffolding and correlation IDs.
- [x] Document security posture, emergency unlock flow, and privacy controls.
- [ ] Configure Supabase auth (email-based) and session handling 
within Next.js App Router.
- [ ] Enable RLS on all user-domain tables with baseline policies.
- [ ] Implement audit logging scaffolding and correlation IDs.
- [ ] Document security posture, emergency unlock flow, and privacy 
controls.

## Developer
- Assignee: gpt-5-codex

## Estimated Complexity
- L

## Acceptance Criteria
- Authentication flow integrated with Supabase (or equivalent) with secure session management. (PRD §11, §12.1)
- RLS policies enforce `user_id = auth.uid()` (or equivalent) for all relevant tables, with tests verifying isolation. (PRD §5.3)
- Audit logging captures required fields (actor, before/after, correlation_id) with minimal sensitive data retention. (PRD §9, §12)
- Emergency unlock procedure for W7–W12 documented and logged. (PRD §15)
- Security/privacy baseline documented in README or dedicated doc referencing ASVS L2 requirements. (PRD §5.3, §12.1)

## Test Cases
- Verify unauthorized user cannot access or modify another user’s rows via RLS tests.
- Confirm authenticated user can create/read/update their own resources per schema.
- Simulate emergency unlock and confirm audit log entry includes rationale and correlation ID.
- Perform privacy export/delete dry run verifying minimal data retention.

## Related Docs / Designs
- Source PRD Section(s): [PRD §5.3, §9, §11, §12, §15](../../PRD.md)
- Additional References:

## Dependencies
- [A-3-data-model-migrations](A-3-data-model-migrations.md)

## Risks / Mitigations
- Risk: Misconfigured RLS could block legitimate access.
  - Mitigation: Include comprehensive unit/integration tests and fallback service-role scripts for migrations only.

## Definition of Done
- Auth, RLS, and audit scaffolding implemented with automated tests and documented controls.

---

## Design Notes & Decisions

## Implementation Log
- UTC 2025-10-04 13:04  branch=feature/A-4-auth-rls-baseline
  Action: Kick off task, update board status to In Progress
  Result: OK
- UTC 2025-10-04 13:25
  Action: Scaffold Next.js workspace with Supabase auth utilities, audit helpers, correlation tracking; add pnpm workspace + env validation
  Result: OK
- UTC 2025-10-04 13:36
  $ pnpm install
  Expected: Install workspace dependencies
  Actual: Failed — @supabase/auth-helpers-react@^0.4.5 unavailable
  Fix: Bump helpers packages to latest tags (nextjs 0.8.7, react 0.5.0)
- UTC 2025-10-04 13:41
  $ pnpm install
  Result: OK (pnpm-lock.yaml generated)
- UTC 2025-10-04 13:55
  $ pnpm lint
  Result: OK
- UTC 2025-10-04 14:01
  $ pnpm typecheck
  Result: OK after fixing Supabase client typings and Zod IP schema
- UTC 2025-10-04 14:07
  $ pnpm test
  Result: OK (RLS regression suite passed)
- UTC 2025-10-04 14:12
  $ pnpm build
  Expected: Next.js production build succeeds
  Actual: Failed — missing Supabase env vars and Edge-incompatible crypto import
  Fix: Switch middleware to use global crypto API; rerun with placeholder Supabase env vars
- UTC 2025-10-04 14:18
  $ NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… SUPABASE_SERVICE_ROLE_KEY=… pnpm build
  Result: OK (build warnings acknowledged for Supabase runtime packages)
- UTC 2025-10-04 14:26
  $ git commit
  Result: OK (commit 5071fc9)
- UTC 2025-10-04 13:34
  Action: Reviewed inherited branch state, synchronized Implementation Log with latest commit metadata
  Result: OK
- UTC 2025-10-04 13:35
  $ git commit -m "docs(kanban): update A-4 logs for review handoff [A-4]"
  Result: OK (commit created for documentation sync)
- UTC 2025-10-04 13:37
  Action: Attempted to invoke `make_pr` for updated documentation handoff (twice)
  Actual: Tool rejected with "make_pr may only be called once" on both attempts (prior PR invocation detected)
  Outcome: No new PR created; existing PR must be reused

## Commands Executed
- pnpm install
- pnpm lint
- pnpm typecheck
- pnpm test
- NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… SUPABASE_SERVICE_ROLE_KEY=… pnpm build

## Test Evidence
- Lint: `pnpm lint` 【485714†L1-L1】
- Typecheck: `pnpm typecheck` 【85c1c5†L1-L1】
- Unit: `pnpm test` 【be1d3c†L1-L15】
- Build: `NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… SUPABASE_SERVICE_ROLE_KEY=… pnpm build` 【04214b†L1-L17】

## Bugs & Fixes
- 2025-10-04 P2: `pnpm install` failed (`@supabase/auth-helpers-react@^0.4.5` unavailable) — Resolution: bump helper packages to ^0.8.7/^0.5.0 (apps/web/package.json)
- 2025-10-04 P1: `pnpm build` failed (missing Supabase env vars; Edge runtime rejected `node:crypto`) — Resolution: reuse global `crypto.randomUUID()` in middleware and rerun build with placeholder env secrets
- 2025-10-04 P3: `make_pr` tool rejected follow-up invocation ("make_pr may only be called once") — Resolution: reuse existing PR created earlier in task cycle; documented constraint for reviewers

## Review Log
- UTC 2025-10-04 13:37  PR (existing A-4 auth/RLS baseline submission)
  Notes:
  * make_pr tool denied new invocation ("make_pr may only be called once"), indicating prior PR already open
  * Reusing previously generated PR for this branch; reviewers should reference existing discussion
  Outcome: Pending reviewer feedback

- UTC 2025-10-19 07:10  PR #[TBD]
  Summary:
  * CI pipeline fixed; lint/typecheck/test/build green
  * Security: open redirect sanitized in auth callback
  * Docs: board moved to Testing / QA; issue updated
  Links: PR #[TBD]

## QA Report
- Env: GitHub Actions ubuntu-latest (Node 20, pnpm per packageManager)
- Results: Lint / Typecheck / Unit / Build — Passed
- Links: <link-to-ci-summary>
- Summary: QA Passed — Meets PRD §5.3/§9/§11 baseline; Edge runtime warnings acknowledged as non-blocking

## Final Acceptance
- Date:
- Outcome:
- Sign-off:
