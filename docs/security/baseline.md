# Security & Privacy Baseline

- Status: Draft
- Last Updated: 2025-10-04 (UTC)

## Authentication Flow

- Supabase email magic links (OTP) drive sign-in, routed via `/api/auth/callback`.
- `middleware.ts` seeds/propagates the `x-correlation-id` header and hydrates sessions using
  `@supabase/auth-helpers-nextjs`.
- Server components and actions consume a shared `createServerSupabaseClient` helper for
  consistent session validation.
- Magic link requests validate input via Zod and record audit breadcrumbs for success/failure
  (unauthenticated actors are normalized to the zero UUID sentinel).

## Row-Level Security

- All user-facing tables enable RLS (see `202510041230_core_schema.sql`). Policies enforce
  `auth.uid() = user_id` or equivalent join ownership checks for nested tables.
- `audit_log` exposes read-only access to the subject user, while inserts are restricted to
  service-role usage through the backend utilities.
- Automated regression tests (`supabase/tests/rls.policies.test.ts`) parse the migration to
  ensure RLS statements are preserved.

## Audit Logging & Correlation IDs

- `recordAuditLog` centralizes inserts via the Supabase service role client. Each entry includes
  actor/subject IDs, rationale, correlation ID, IP, and user agent metadata while minimizing
  sensitive payloads.
- `getCorrelationId` + middleware guarantee every request has a stable UUID for observability.
- Unauthenticated actions (e.g., requesting a magic link) map to `00000000-0000-0000-0000-000000000000`
  to avoid storing PII before account creation.

## Emergency Unlock Procedure (W7–W12)

1. CS/Support collects user request and correlates with the on-call lead.
2. Support triggers a privileged server action (to be implemented) that writes an
   `audit_log` entry (`plan.unlock.override`) referencing the correlation ID, rationale,
   and before/after quota snapshots.
3. Service-role client temporarily patches `weekly_plan.locked_after_week` for the affected week.
4. On completion, support restores the lock and records closure in the audit log.

Until the override UI exists, operations must use the Supabase SQL editor with explicit `audit_log`
entries referencing the support ticket and correlation ID.

## Privacy Controls

- Environment variables segregate public (URL/anon key) and secret (service role) values with
  runtime Zod validation.
- Audit payloads exclude raw email addresses or sensitive content; only IDs and metadata persist.
- `.env` files are gitignored; `.env.example` documents required variables.
- Deletion/export tooling will extend the audit scaffolding to satisfy PRD §12.1.

## References

- [Supabase Migration](../../supabase/migrations/202510041230_core_schema.sql)
- [Auth Implementation](../../apps/web)
- [PRD §5.3, §9, §11, §12, §15](../../PRD.md)
