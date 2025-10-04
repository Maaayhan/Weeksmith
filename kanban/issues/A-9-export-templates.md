# A-9 Export Templates

## Objective
Implement Markdown and CSV export capabilities covering AI WAM summaries, commitments, and retro data per PRD templates.

## Subtasks
- [ ] Define reusable Markdown/CSV templates for WAM sessions and retros.
- [ ] Build export endpoints (`GET /export/week/:week.(md|csv)`, `/wam/export`).
- [ ] Ensure exports include completion metrics, proposals, commitments, and lock status messaging.
- [ ] Handle async generation with retry queue integration (QStash or equivalent).
- [ ] Document usage and link from UI.

## Developer
- Assignee: gpt-5-codex

## Estimated Complexity
- M

## Acceptance Criteria
- Markdown template matches PRD §20 with dynamic placeholders populated from session data. (PRD §4.4 A-6, §20)
- CSV export includes headers for proposals, actions, outcomes, and obstacles for external analysis. (PRD §4.4, §4.5)
- Exports accessible via UI one-click action and optional download/email queue with retries. (PRD §4.4 A-6, §5.1)
- Audit logs track export requests and delivery status. (PRD §9)
- Security/privacy considerations applied (minimum data, user scope). (PRD §5.3, §12)

## Test Cases
- Generate WAM export and verify Markdown content matches template sections.
- Generate CSV and check for correct headers/rows for proposals and commitments.
- Simulate export failure and confirm retry with notification.
- Confirm only authenticated owner can access export endpoints.

## Related Docs / Designs
- Source PRD Section(s): [PRD §4.4, §4.5, §5.1, §9, §20](../../PRD.md)
- Additional References:

## Dependencies
- [A-8-ai-wam-chat](A-8-ai-wam-chat.md)
- [A-11-retro-cycle](A-11-retro-cycle.md)

## Risks / Mitigations
- Risk: Export templates drift from UI data model.
  - Mitigation: Centralize template generation with shared schema definitions.

## Definition of Done
- Export endpoints and templates delivered with tests, retries, and documentation.

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
