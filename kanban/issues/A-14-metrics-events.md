# A-14 Metrics & Observability

## Objective
Implement analytics events, metrics, and observability instrumentation including PostHog funnels and OpenTelemetry tracing per PRD.

## Subtasks
- [ ] Define analytics taxonomy covering events (`created_plan`, `ai_wam_opened`, etc.).
- [ ] Integrate PostHog and ensure event capture across core flows.
- [ ] Implement OpenTelemetry instrumentation via `instrumentation.ts` for Server Actions, route handlers, and external calls.
- [ ] Correlate logs and traces using `correlation_id` linking to audit logs.
- [ ] Build dashboards/funnels for activation, execution, retention metrics.

## Developer
- Assignee: gpt-5-codex

## Estimated Complexity
- M

## Acceptance Criteria
- Analytics events implemented matching PRD §16 definitions with consistent properties. (PRD §16)
- PostHog integration configured with environment toggles and documentation. (PRD §11, §16)
- OpenTelemetry instrumentation captures server actions, external integrations, and error sampling strategy. (PRD §5.4)
- Correlation IDs propagate from frontend to backend and audit logs. (PRD §5.4, §9)
- Dashboards or documentation describe funnels and metrics usage. (PRD §1.3, §16)

## Test Cases
- Trigger key events in development and verify PostHog ingestion with correct payloads.
- Inspect traces ensuring spans created for AI calls, database interactions, and exports.
- Confirm correlation ID present in logs, traces, and audit entries for a sample workflow.
- Validate feature flag or environment configuration prevents analytics in local tests when disabled.

## Related Docs / Designs
- Source PRD Section(s): [PRD §1.3, §5.4, §11, §16](../../PRD.md)
- Additional References:

## Dependencies
- [A-8-ai-wam-chat](A-8-ai-wam-chat.md)
- [A-9-export-templates](A-9-export-templates.md)
- [A-10-notifications](A-10-notifications.md)
- [A-11-retro-cycle](A-11-retro-cycle.md)

## Risks / Mitigations
- Risk: Performance overhead from instrumentation.
  - Mitigation: Configure sampling per PRD and monitor latency impacts.

## Definition of Done
- Metrics, analytics, and tracing integrated with documentation and validation evidence.

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
