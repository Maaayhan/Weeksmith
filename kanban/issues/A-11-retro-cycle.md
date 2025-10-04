# A-11 Retro & Next Cycle

## Objective
Create the 12-week retro experience with analytics, insights, rest mode recommendation, and next-cycle draft generation.

## Subtasks
- [ ] Build retro dashboard with charts (completion distribution, 85% hit rate, wins/losses, input vs output insights).
- [ ] Implement guided reflection workflow culminating in summary export.
- [ ] Generate next-cycle draft copying structure with tuning options and rest mode toggle.
- [ ] Integrate rest mode view (light tracking suggestions) for two-week break.
- [ ] Ensure retro data feeds exports and AI recommendations.

## Developer
- Assignee: gpt-5-codex

## Estimated Complexity
- L

## Acceptance Criteria
- Retro dashboard displays required charts and summaries derived from 12-week data. (PRD §4.5 R-1, R-2)
- Guided flow covers reflection prompts and produces export-ready summary. (PRD §4.5, §20)
- Next-cycle draft generator copies plan with modifications respecting 1+1/input-only/lock rules. (PRD §4.5 R-3)
- Rest mode offers light tracking suggestions and toggles plan state. (PRD §4.5, §15)
- Data integrates with AI WAM for continuity and exports include retro insights. (PRD §4.5, §8)

## Test Cases
- Complete retro flow with sample data and verify charts and summaries render.
- Trigger next-cycle generation and verify new cycle respects constraints.
- Enable rest mode and confirm UI/integrations adjust accordingly.
- Export retro summary and check Markdown/CSV content.

## Related Docs / Designs
- Source PRD Section(s): [PRD §4.5, §15, §20](../../PRD.md)
- Additional References:

## Dependencies
- [A-6-plan-12-week](A-6-plan-12-week.md)
- [A-7-this-week-views](A-7-this-week-views.md)
- [A-8-ai-wam-chat](A-8-ai-wam-chat.md)
- [A-9-export-templates](A-9-export-templates.md)

## Risks / Mitigations
- Risk: Data visualization performance for long histories.
  - Mitigation: Use lazy loading and aggregation queries.

## Definition of Done
- Retro flow functional with charts, next-cycle automation, rest mode, exports, and documentation.

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
