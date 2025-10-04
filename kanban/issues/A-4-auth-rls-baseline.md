# A-4 Auth & RLS Baseline

## Objective
Implement authentication and row-level security foundations ensuring user isolation, minimal data exposure, and compliance with PRD security requirements.

## Subtasks
- [ ] Configure Supabase auth (email-based) and session handling within Next.js App Router.
- [ ] Enable RLS on all user-domain tables with baseline policies.
- [ ] Implement audit logging scaffolding and correlation IDs.
- [ ] Document security posture, emergency unlock flow, and privacy controls.

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
- YYYY-MM-DD: 

## Commands Executed
- 

## Test Evidence
- 

## Bugs & Fixes
- (Date) P#: Description — Resolution / Commit

## Review Log
- (Date) Reviewer: Summary & Outcome

## QA Report
- Test Session: 
- Link to Test Report: 
- Summary:

## Final Acceptance
- Date:
- Outcome:
- Sign-off:
