# A-10 Notifications & Calendar

## Objective
Implement Web Push notifications, scheduling reminders, and calendar integrations per PRD, including iOS A2HS guidance.

## Subtasks
- [ ] Configure PWA installation flow and permission prompts.
- [ ] Implement Web Push scheduling for weekly plan reminders, WAM reminders, and scoring prompts.
- [ ] Provide settings to control frequency and quiet hours.
- [ ] Integrate Google Calendar event creation (MVP) with roadmap for `events.watch` (v1.x).
- [ ] Author in-app guide for iOS 16.4+ A2HS push enablement.

## Developer
- Assignee: gpt-5-codex

## Estimated Complexity
- L

## Acceptance Criteria
- PWA install prompt and push subscription flow work on desktop/mobile browsers with fallback messaging. (PRD §4.6 N-1, §11)
- Default reminder schedule: Sunday plan, WAM pre-meeting, weekend scoring; users can adjust frequency. (PRD §4.6 N-1, §14)
- Push notifications respect quiet hours and minimal payload data. (PRD §5.3 Privacy)
- Calendar integration creates recurring WAM/Retro events with user consent; roadmap documented for watch sync. (PRD §4.6 N-2)
- iOS A2HS guide accessible in settings with step-by-step instructions. (PRD §4.6, §14)

## Test Cases
- Install PWA on desktop and mobile, validate push subscription and notification receipt.
- Adjust notification frequency and confirm schedule updates.
- Create calendar event and confirm details/timezone accuracy.
- Attempt push without permission and confirm graceful fallback guidance.
- Verify accessibility for settings (keyboard focus, screen reader descriptions).

## Related Docs / Designs
- Source PRD Section(s): [PRD §4.6, §5.3, §11, §14](../../PRD.md)
- Additional References:

## Dependencies
- [A-4-auth-rls-baseline](A-4-auth-rls-baseline.md)
- [A-7-this-week-views](A-7-this-week-views.md)
- [A-8-ai-wam-chat](A-8-ai-wam-chat.md)

## Risks / Mitigations
- Risk: Browser push limitations on iOS.
  - Mitigation: Provide comprehensive A2HS guide and degrade to email reminders where needed.

## Definition of Done
- Notifications and calendar integrations live with settings, tests, documentation, and analytics hooks.

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
