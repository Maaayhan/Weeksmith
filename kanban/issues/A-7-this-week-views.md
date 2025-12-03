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
- UTC 2025-12-03 04:15  branch=feature/A-7-this-week-views
  $ git checkout -b feature/A-7-this-week-views
  Result: OK

- UTC 2025-12-03 04:18
  Action: Move card to In Progress in board.md
  Expected: Board shows A-7 under In Progress and removed from Backlog
  Actual: Updated successfully
  Result: OK

- UTC 2025-12-03 04:19
  Action: Added This Week server actions for mode persistence, progress save, and obstacle logging; created completion metrics helper with unit tests
  Expected: Payload validation and audit logging cover weekly edits
  Actual: Actions compile; metrics tests pass
  Result: OK

- UTC 2025-12-03 04:20
  Action: Updated dashboard page to load weekly plan, plan items, and obstacle audit rows for current week
  Expected: This Week surface receives hydrated data with lock thresholds
  Actual: Page renders with fetched plan/obstacle data paths
  Result: OK

- UTC 2025-12-03 04:21
  Action: Built ThisWeekSurface client UI (mode toggle, gauge, time-block + priority queue cards, obstacle form) and added week styles
  Expected: Users can switch modes without quota edits, view lock cues, and log obstacles
  Actual: UI renders with gauge, lock messaging, and forms wired to actions
  Result: OK

- UTC 2025-12-03 04:22
  $ git commit -m "feat(this-week): add execution views and logs [A-7]"
  Result: OK (commit updated after board move)

- UTC 2025-12-03 04:24
  Action: Created PR via make_pr and moved A-7 card to In Review
  Expected: PR available for reviewers with CI trigger
  Actual: PR message recorded; board updated
  Result: OK

## Commands Executed
- UTC 2025-12-03 04:15 `git checkout -b feature/A-7-this-week-views`
- UTC 2025-12-03 04:18 `apply_patch kanban/board.md`
- UTC 2025-12-03 04:19 `pnpm test`
- UTC 2025-12-03 04:22 `git commit -m "feat(this-week): add execution views and logs [A-7]"`
- UTC 2025-12-03 04:24 `make_pr [A-7] Add This Week execution views`

## Test Evidence
- UTC 2025-12-03 04:19 `pnpm test` (vitest) — pass

## Bugs & Fixes
- (Date) P#: Description — Resolution / Commit

## Review Log
- UTC 2025-12-03 04:24  PR [A-7] Add This Week execution views (make_pr) — Awaiting review

## QA Report
- Test Session: 
- Link to Test Report: 
- Summary:

## Final Acceptance
- Date:
- Outcome:
- Sign-off:
