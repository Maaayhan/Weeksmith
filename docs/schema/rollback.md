# Rollback Strategy for Migration 202510041230

This guide outlines the manual steps to revert the core schema migration if an incident occurs after deployment.

## Preconditions
- Ensure no dependent application releases are relying on the new tables. Freeze writes before executing rollback.
- Connect using a **service role** or admin Postgres session (RLS must be bypassed).

## Rollback Steps
1. **Drop Policies** (reverse creation order):
   ```sql
   DROP POLICY IF EXISTS chat_message_owner_manage ON chat_message;
   DROP POLICY IF EXISTS chat_session_owner_manage ON chat_session;
   DROP POLICY IF EXISTS audit_log_subject_read ON audit_log;
   DROP POLICY IF EXISTS plan_item_owner_manage ON plan_item;
   DROP POLICY IF EXISTS task_owner_manage ON task;
   DROP POLICY IF EXISTS weekly_plan_owner_manage ON weekly_plan;
   DROP POLICY IF EXISTS goal_owner_manage ON goal;
   DROP POLICY IF EXISTS cycle_owner_manage ON cycle;
   DROP POLICY IF EXISTS vision_owner_manage ON vision;
   ```

2. **Disable RLS** (if desired):
   ```sql
   ALTER TABLE chat_message DISABLE ROW LEVEL SECURITY;
   ALTER TABLE chat_session DISABLE ROW LEVEL SECURITY;
   ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;
   ALTER TABLE plan_item DISABLE ROW LEVEL SECURITY;
   ALTER TABLE task DISABLE ROW LEVEL SECURITY;
   ALTER TABLE weekly_plan DISABLE ROW LEVEL SECURITY;
   ALTER TABLE goal DISABLE ROW LEVEL SECURITY;
   ALTER TABLE cycle DISABLE ROW LEVEL SECURITY;
   ALTER TABLE vision DISABLE ROW LEVEL SECURITY;
   ```

3. **Drop Triggers and Functions**:
   ```sql
   DROP TRIGGER IF EXISTS trg_plan_item_lock ON plan_item;
   DROP TRIGGER IF EXISTS trg_plan_item_set_updated_at ON plan_item;
   DROP FUNCTION IF EXISTS enforce_plan_item_lock();
   DROP FUNCTION IF EXISTS set_plan_item_updated_at();
   ```

4. **Drop Tables** (child tables first):
   ```sql
   DROP TABLE IF EXISTS chat_message;
   DROP TABLE IF EXISTS chat_session;
   DROP TABLE IF EXISTS audit_log;
   DROP TABLE IF EXISTS plan_item;
   DROP TABLE IF EXISTS task;
   DROP TABLE IF EXISTS weekly_plan;
   DROP TABLE IF EXISTS goal;
   DROP TABLE IF EXISTS cycle;
   DROP TABLE IF EXISTS vision;
   ```

5. **Drop Enumerated Types** (optional if unused elsewhere):
   ```sql
   DROP TYPE IF EXISTS chat_role;
   DROP TYPE IF EXISTS actor_type;
   DROP TYPE IF EXISTS plan_item_status;
   DROP TYPE IF EXISTS plan_mode;
   DROP TYPE IF EXISTS goal_type;
   ```

6. **Audit**: Record the rollback in change management (update `/kanban/issues/A-3-data-model-migrations.md` and incident log).

## Post-Rollback Actions
- Restore backups or re-run prior migrations as needed.
- Coordinate with application team to redeploy a compatible build.
