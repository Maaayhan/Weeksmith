# A-3 Data Model Migration Scripts

## Objective
Design and implement the database schema and migration scripts aligned with the PRD data model, ensuring constraints, RLS readiness, and audit logging foundations.

## Subtasks
- [ ] Model tables (`vision`, `cycle`, `goal`, `weekly_plan`, `task`, `plan_item`, `audit_log`, `chat_session`, `chat_message`).
- [ ] Encode constraints: 1+1 goal uniqueness, lock enforcement for W7–W12, foreign keys, JSONB checks.
- [ ] Prepare migration scripts compatible with Supabase/PostgreSQL deployment.
- [ ] Document schema decisions and ERD references.
- [ ] Provide seed data or fixtures for development/testing.

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
