-- Migration: Core schema for Weeksmith MVP
-- Description: Creates base tables, constraints, triggers, and RLS policies aligned with PRD §9–§11.
-- Rollback strategy: Drop dependent policies/triggers, then tables in reverse order (documented in docs/schema/rollback.md).

-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Domain enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_type') THEN
        CREATE TYPE goal_type AS ENUM ('personal', 'professional');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_mode') THEN
        CREATE TYPE plan_mode AS ENUM ('time_block', 'priority_queue');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_item_status') THEN
        CREATE TYPE plan_item_status AS ENUM ('planned', 'in_progress', 'completed', 'skipped');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'actor_type') THEN
        CREATE TYPE actor_type AS ENUM ('user', 'system', 'ai');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chat_role') THEN
        CREATE TYPE chat_role AS ENUM ('user', 'ai', 'system');
    END IF;
END
$$;

-- Table: vision
CREATE TABLE IF NOT EXISTS vision (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    daily TEXT NOT NULL DEFAULT '',
    weekly TEXT NOT NULL DEFAULT '',
    year TEXT NOT NULL DEFAULT '',
    life TEXT NOT NULL DEFAULT '',
    tags TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: cycle (12-week cycles)
CREATE TABLE IF NOT EXISTS cycle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_week SMALLINT NOT NULL DEFAULT 1 CHECK (current_week BETWEEN 1 AND 12),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT cycle_date_range CHECK (end_date > start_date)
);
CREATE INDEX IF NOT EXISTS idx_cycle_user ON cycle(user_id);

-- Table: goal (1 personal + 1 professional per cycle)
CREATE TABLE IF NOT EXISTS goal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    cycle_id UUID NOT NULL REFERENCES cycle(id) ON DELETE CASCADE,
    type goal_type NOT NULL,
    description TEXT NOT NULL,
    start_week SMALLINT NOT NULL CHECK (start_week BETWEEN 1 AND 12),
    end_week SMALLINT NOT NULL CHECK (end_week BETWEEN start_week AND 12),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT goal_unique_one_per_type UNIQUE (user_id, cycle_id, type)
);
CREATE INDEX IF NOT EXISTS idx_goal_cycle ON goal(cycle_id);
CREATE INDEX IF NOT EXISTS idx_goal_user ON goal(user_id);

-- Table: weekly_plan
CREATE TABLE IF NOT EXISTS weekly_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    cycle_id UUID NOT NULL REFERENCES cycle(id) ON DELETE CASCADE,
    week_no SMALLINT NOT NULL CHECK (week_no BETWEEN 1 AND 12),
    mode plan_mode NOT NULL,
    locked_after_week SMALLINT NOT NULL DEFAULT 6 CHECK (locked_after_week BETWEEN 1 AND 12),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, cycle_id, week_no)
);
CREATE INDEX IF NOT EXISTS idx_weekly_plan_cycle_week ON weekly_plan(cycle_id, week_no);
CREATE INDEX IF NOT EXISTS idx_weekly_plan_user ON weekly_plan(user_id);

-- Table: task (reusable task catalog)
CREATE TABLE IF NOT EXISTS task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'count',
    default_qty NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (default_qty >= 0),
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_task_user ON task(user_id);

-- Table: plan_item (quota entries for weekly plans)
CREATE TABLE IF NOT EXISTS plan_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES weekly_plan(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES goal(id) ON DELETE SET NULL,
    task_id UUID REFERENCES task(id) ON DELETE SET NULL,
    unit TEXT NOT NULL,
    qty NUMERIC(10,2) NOT NULL CHECK (qty >= 0),
    completed_qty NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (completed_qty >= 0),
    status plan_item_status NOT NULL DEFAULT 'planned',
    notes TEXT DEFAULT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_plan_item_plan ON plan_item(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_item_goal ON plan_item(goal_id);
CREATE INDEX IF NOT EXISTS idx_plan_item_task ON plan_item(task_id);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID,
    actor_type actor_type NOT NULL,
    subject_user_id UUID NOT NULL,
    action TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    rationale TEXT,
    correlation_id UUID,
    source_ip INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT audit_before_json_object CHECK (before_state IS NULL OR jsonb_typeof(before_state) = 'object'),
    CONSTRAINT audit_after_json_object CHECK (after_state IS NULL OR jsonb_typeof(after_state) = 'object')
);
CREATE INDEX IF NOT EXISTS idx_audit_subject_user ON audit_log(subject_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_user_id);

-- Chat session table
CREATE TABLE IF NOT EXISTS chat_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    cycle_id UUID REFERENCES cycle(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    summary_md TEXT
);
CREATE INDEX IF NOT EXISTS idx_chat_session_user ON chat_session(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_session_cycle ON chat_session(cycle_id);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_session(id) ON DELETE CASCADE,
    role chat_role NOT NULL,
    content TEXT NOT NULL,
    proposal_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chat_message_proposal_object CHECK (proposal_json IS NULL OR jsonb_typeof(proposal_json) = 'object')
);
CREATE INDEX IF NOT EXISTS idx_chat_message_session ON chat_message(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_role ON chat_message(role);

-- Trigger to maintain updated_at on plan_item
CREATE OR REPLACE FUNCTION set_plan_item_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_plan_item_set_updated_at ON plan_item;
CREATE TRIGGER trg_plan_item_set_updated_at
BEFORE UPDATE ON plan_item
FOR EACH ROW
EXECUTE FUNCTION set_plan_item_updated_at();

-- Trigger to enforce W7–W12 lock on quota changes
CREATE OR REPLACE FUNCTION enforce_plan_item_lock()
RETURNS TRIGGER AS $$
DECLARE
    plan_record weekly_plan%ROWTYPE;
BEGIN
    SELECT * INTO plan_record FROM weekly_plan WHERE id = NEW.plan_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Weekly plan % missing for plan_item %', NEW.plan_id, NEW.id
            USING ERRCODE = 'P0002';
    END IF;
    IF plan_record.week_no > plan_record.locked_after_week AND NEW.qty <> OLD.qty THEN
        RAISE EXCEPTION 'Plan items are locked for week % after lock week %', plan_record.week_no, plan_record.locked_after_week
            USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_plan_item_lock ON plan_item;
CREATE TRIGGER trg_plan_item_lock
BEFORE UPDATE ON plan_item
FOR EACH ROW
EXECUTE FUNCTION enforce_plan_item_lock();

-- RLS enablement and baseline policies
ALTER TABLE vision ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE task ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_message ENABLE ROW LEVEL SECURITY;

-- Vision policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vision' AND policyname = 'vision_owner_manage'
    ) THEN
        CREATE POLICY vision_owner_manage ON vision
            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Cycle policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cycle' AND policyname = 'cycle_owner_manage'
    ) THEN
        CREATE POLICY cycle_owner_manage ON cycle
            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Goal policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'goal' AND policyname = 'goal_owner_manage'
    ) THEN
        CREATE POLICY goal_owner_manage ON goal
            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Weekly plan policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'weekly_plan' AND policyname = 'weekly_plan_owner_manage'
    ) THEN
        CREATE POLICY weekly_plan_owner_manage ON weekly_plan
            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Task policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'task' AND policyname = 'task_owner_manage'
    ) THEN
        CREATE POLICY task_owner_manage ON task
            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Plan item policies referencing weekly_plan ownership
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'plan_item' AND policyname = 'plan_item_owner_manage'
    ) THEN
        CREATE POLICY plan_item_owner_manage ON plan_item
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM weekly_plan wp
                    WHERE wp.id = plan_item.plan_id AND wp.user_id = auth.uid()
                )
            ) WITH CHECK (
                EXISTS (
                    SELECT 1 FROM weekly_plan wp
                    WHERE wp.id = plan_item.plan_id AND wp.user_id = auth.uid()
                )
            );
    END IF;
END
$$;

-- Audit log policies (read-only for subject user, inserts via service role)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_log' AND policyname = 'audit_log_subject_read'
    ) THEN
        CREATE POLICY audit_log_subject_read ON audit_log
            FOR SELECT USING (subject_user_id = auth.uid());
    END IF;
END
$$;

-- Chat session policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_session' AND policyname = 'chat_session_owner_manage'
    ) THEN
        CREATE POLICY chat_session_owner_manage ON chat_session
            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Chat message policies referencing chat_session
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_message' AND policyname = 'chat_message_owner_manage'
    ) THEN
        CREATE POLICY chat_message_owner_manage ON chat_message
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM chat_session cs
                    WHERE cs.id = chat_message.session_id AND cs.user_id = auth.uid()
                )
            ) WITH CHECK (
                EXISTS (
                    SELECT 1 FROM chat_session cs
                    WHERE cs.id = chat_message.session_id AND cs.user_id = auth.uid()
                )
            );
    END IF;
END
$$;

-- Comment on plan_item lock behavior for app layer alignment
COMMENT ON FUNCTION enforce_plan_item_lock IS 'Prevents quota changes on plan items when the associated weekly plan is locked (week_no > locked_after_week).';
COMMENT ON TABLE audit_log IS 'Minimal audit log storing before/after JSON and metadata per ASVS V7 guidance.';
