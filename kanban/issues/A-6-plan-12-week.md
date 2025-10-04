# A-6 Plan (12-week) Module

## Objective
Build the 12-week planning experience enforcing 1+1 goals, input-only actions, W1–W6 adjustable/W7–W12 locked rules, and AI-assisted quota suggestions.

## Subtasks
- [ ] Implement UI with personal/professional goal split and 12×week grid.
- [ ] Enforce input-only validation with rewrite suggestions.
- [ ] Apply lock controls for W7–W12 both client and server side.
- [ ] Integrate AI quota generator with human confirmation workflow.
- [ ] Support copy-to-week functionality and audit logging.

## Developer
- Assignee: gpt-5-codex

## Estimated Complexity
- XL

## Acceptance Criteria
- Users can define exactly one personal and one professional goal with enforcement of uniqueness. (PRD §4.2 P-1)
- Input-only constraint blocks KPI-style entries and offers rewrite prompts using If-Then templates. (PRD §4.2 P-2, §7.2)
- W1–W6 quotas editable; W7–W12 locked with explanatory messaging; backend rejects forbidden changes. (PRD §4.2 P-3, §7.2)
- AI generator proposes weekly quotas based on vision context with confirmation steps and schema validation. (PRD §4.2 P-4, §5.5)
- Copy-to-week and audit logging capture approvals and rationale. (PRD §4.2, §9, §5.5)

## Test Cases
- Attempt to add second personal goal and confirm validation error.
- Enter KPI phrase (e.g., "+500 followers") and verify rewrite guidance.
- Modify W8 quota and confirm lock prevents change and logs rejection.
- Run AI generator, approve subset of weeks, and confirm resulting plan items saved with audit trail.
- Accessibility: ensure keyboard navigation across grid and announcements for lock state.

## Related Docs / Designs
- Source PRD Section(s): [PRD §4.2, §5.5, §7.2, §15](../../PRD.md)
- Additional References:

## Dependencies
- [A-3-data-model-migrations](A-3-data-model-migrations.md)
- [A-4-auth-rls-baseline](A-4-auth-rls-baseline.md)
- [A-5-vision-flow](A-5-vision-flow.md)

## Risks / Mitigations
- Risk: AI generator outputs invalid schema or KPI language.
  - Mitigation: Enforce server-side schema validation and sanitization before surfacing to user.

## Definition of Done
- Planning module delivered with full validation, AI integration, automated tests, and documentation.

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
