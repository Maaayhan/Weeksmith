# A-7 This Week Views

## Objective
Implement the weekly execution surface offering time-blocking and priority queue workflows, progress gauge, and obstacle tracking aligned with the PRD.

## Subtasks
- [ ] Build view selection and persistence between Time-blocking and Priority Queue modes.
- [ ] Implement calendar-style time-block editor with sync to plan quotas.
- [ ] Implement kanban/priority queue board with completion tracking.
- [ ] Develop completion gauge highlighting 80–90% zone with guidance cards.
- [ ] Add quick notes and obstacle categorization (time/energy/environment/skill).

## Developer
- Assignee: gpt-5-codex

## Estimated Complexity
- XL

## Acceptance Criteria
- User can choose between Time-blocking and Priority Queue workflows and switch views without altering quotas. (PRD §4.3 W-1)
- Completion gauge calculates completion % and highlights 80–90% zone with guidance for low/high extremes. (PRD §4.3 W-2)
- Locking cues for W7–W12 appear with explanatory messaging consistent with plan lock state. (PRD §4.3 W-4)
- Obstacles logging captures categories and displays within weekly summary. (PRD §4.3 W-3)
- Data sync ensures weekly plan items reflect plan quotas and updates feed AI WAM insights. (PRD §4.3, §8)

## Test Cases
- Switch workflow modes mid-week and confirm data persistence.
- Complete tasks and verify gauge updates and guidance messaging (<80% vs >90%).
- Attempt to edit locked week quotas from This Week view and confirm blocked with explanation.
- Log obstacle categories and ensure they appear in summary data for AI WAM.
- Accessibility: verify drag/drop alternatives (keyboard) and focus management.

## Related Docs / Designs
- Source PRD Section(s): [PRD §4.3, §7.3, §7.6](../../PRD.md)
- Additional References:

## Dependencies
- [A-6-plan-12-week](A-6-plan-12-week.md)

## Risks / Mitigations
- Risk: Time-blocking may require calendar integrations later.
  - Mitigation: Abstract data model to support external sync while meeting MVP offline requirements.

## Definition of Done
- Weekly execution views functional, accessible, tested, and documented with data feeding AI/Retro flows.

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
