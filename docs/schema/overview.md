# Core Data Model Overview

This document summarizes the initial database schema introduced in migration `202510041230_core_schema.sql`. The design aligns with PRD §4–§11 and prepares Supabase/PostgreSQL for Weeksmith's MVP scope.

## Entity Summary

| Table | Purpose | Key Fields |
| --- | --- | --- |
| `vision` | Stores the multi-horizon vision statements per user. | `user_id`, `daily`, `weekly`, `year`, `life`, `tags` |
| `cycle` | Represents a 12-week transformation cycle. | `user_id`, `start_date`, `end_date`, `current_week` |
| `goal` | Holds the personal/professional goal pair per cycle. | `cycle_id`, `type`, `description`, `start_week`, `end_week` |
| `weekly_plan` | Weekly execution plan with selectable workflow mode. | `cycle_id`, `week_no`, `mode`, `locked_after_week` |
| `task` | Reusable catalog of input-style actions. | `title`, `unit`, `default_qty`, `tags` |
| `plan_item` | Week-specific quotas tied to a plan and optional task. | `plan_id`, `goal_id`, `qty`, `status` |
| `audit_log` | Minimal before/after audit entries per ASVS V7 guidance. | `actor_type`, `subject_user_id`, `before_state`, `after_state` |
| `chat_session` | Captures each AI WAM session context. | `user_id`, `cycle_id`, `summary_md` |
| `chat_message` | Stores structured conversation turns with proposal payloads. | `session_id`, `role`, `proposal_json` |

## Constraints and Business Rules

- **1+1 Goals**: `UNIQUE(user_id, cycle_id, type)` ensures exactly one personal and one professional goal per cycle.
- **12-week Boundaries**: `CHECK` constraints guard week numbering on `cycle`, `goal`, and `weekly_plan`.
- **Lock Enforcement**: Trigger `enforce_plan_item_lock` disallows quota changes once `week_no > locked_after_week` (default 6), aligning with the 6/6 lock requirement.
- **Input-style Tasks**: `plan_item.qty` uses non-negative numeric quantities; RLS combined with application validation will enforce qualitative input wording.
- **Audit JSON Shape**: `jsonb_typeof` checks guarantee structured object payloads for `before_state` and `after_state`.

## Row-Level Security Baseline

RLS is enabled on every user-owned table. Policies follow two patterns:

1. **Direct Ownership** (`vision`, `cycle`, `goal`, `weekly_plan`, `task`, `chat_session`): `auth.uid()` must match `user_id` for `SELECT/INSERT/UPDATE/DELETE`.
2. **Ownership via Parent** (`plan_item`, `chat_message`): correlated subqueries verify that the associated parent record belongs to the authenticated user.
3. **Audit Log Readback**: A read-only policy exposes `audit_log` rows where `subject_user_id = auth.uid()`. Inserts are expected via service role or trusted server actions.

## Enumerations

- `goal_type`: `personal`, `professional`.
- `plan_mode`: `time_block`, `priority_queue`.
- `plan_item_status`: `planned`, `in_progress`, `completed`, `skipped`.
- `actor_type`: `user`, `system`, `ai`.
- `chat_role`: `user`, `ai`, `system`.

## Triggers & Functions

- `set_plan_item_updated_at`: Maintains `updated_at` timestamps on modification.
- `enforce_plan_item_lock`: Raises `P0001` when quota edits occur on locked weeks, providing database-level enforcement to complement server checks.

## Supabase Integration Notes

- `CREATE EXTENSION "pgcrypto"` provides `gen_random_uuid()` for UUID primary keys. Supabase enables this extension by default, but the migration guards against missing installs.
- Policies rely on `auth.uid()` available within Supabase's Postgres auth context.
- Audit logging retains minimal metadata to satisfy security requirements while avoiding sensitive payload storage.

## Future Considerations

- Introduce materialized views or summary tables once analytics requirements emerge.
- Expand audit logging to capture request IDs and tool invocation metadata as instrumentation matures.
- Evaluate partial indexes on `plan_item` status when workloads grow.
