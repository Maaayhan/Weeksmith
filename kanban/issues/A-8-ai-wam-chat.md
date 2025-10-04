# A-8 AI WAM Chat

## Objective
Build the AI WAM experience including persona, structured outputs, approval workflow, execution tooling, crisis handling, and exports per PRD.

## Subtasks
- [ ] Implement chat UI with insights/proposals panes and approval controls.
- [ ] Integrate AI persona prompts using structured outputs/function calling.
- [ ] Enforce input-only and lock constraints within proposal schema.
- [ ] Implement execution layer with human-in-the-loop approval tokens and audit logging.
- [ ] Provide Markdown/CSV export of session summary and commitments.
- [ ] Add crisis handling mode with minimal logging and resource prompts.

## Developer
- Assignee: gpt-5-codex

## Estimated Complexity
- XXL

## Acceptance Criteria
- Chat flow follows warm-up → user share → facts → diagnosis → proposals → approval → execution → recap. (PRD §4.4 A-3)
- Proposals rendered from structured JSON schema with schema validation and KPI/lock guards. (PRD §4.4 A-4, §5.5, §8.4)
- Approve/Edit/Reject actions require explicit confirmation and log before/after with correlation IDs. (PRD §4.4 A-5, §9)
- Export produces Markdown/CSV per template with status and commitments. (PRD §4.4 A-6, §20)
- Crisis detection halts proposals, surfaces resource template, and logs minimal metadata. (PRD §8.9)
- Performance SLO instrumentation in place (first token ≤2.5s, proposals ≤8s). (PRD §5.1)

## Test Cases
- Simulate conversation generating proposals and verify schema validation prevents KPI suggestions.
- Approve and reject proposals verifying execution tooling updates plan items and writes audit logs.
- Trigger lock violation attempt and confirm red warning and rejection.
- Export session and inspect Markdown/CSV for required sections.
- Simulate crisis keyword and confirm system switches to crisis mode without executing proposals.
- Measure response timings under load tests to verify SLOs.

## Related Docs / Designs
- Source PRD Section(s): [PRD §4.4, §5.1, §5.5, §8, §20](../../PRD.md)
- Additional References:

## Dependencies
- [A-3-data-model-migrations](A-3-data-model-migrations.md)
- [A-4-auth-rls-baseline](A-4-auth-rls-baseline.md)
- [A-6-plan-12-week](A-6-plan-12-week.md)
- [A-7-this-week-views](A-7-this-week-views.md)

## Risks / Mitigations
- Risk: AI latency may exceed SLO.
  - Mitigation: Implement caching, streaming, and degrade-to-summary strategies outlined in PRD.

## Definition of Done
- AI WAM chat operational with safety guards, performance instrumentation, exports, and full test coverage.

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
