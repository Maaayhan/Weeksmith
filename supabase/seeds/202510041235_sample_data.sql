-- Seed data for local development/testing
-- Applies sample user, cycle, goals, weekly plan, tasks, and chat history.

BEGIN;

-- Sample user UUIDs (align with Supabase auth users to be inserted separately)
\set user_id '00000000-0000-0000-0000-000000000001'
\set cycle_id '11111111-1111-1111-1111-111111111111'
\set plan_week1 '22222222-2222-2222-2222-222222222221'
\set plan_week7 '22222222-2222-2222-2222-222222222227'
\set personal_goal '33333333-3333-3333-3333-333333333331'
\set professional_goal '33333333-3333-3333-3333-333333333332'
\set deep_work_task '44444444-4444-4444-4444-444444444441'
\set fitness_task '44444444-4444-4444-4444-444444444442'
\set session_id '55555555-5555-5555-5555-555555555551'

INSERT INTO vision (id, user_id, daily, weekly, year, life, tags)
VALUES (
    gen_random_uuid(), :'user_id',
    'Morning deep work and mindful evening',
    'Ship consistent content while maintaining health routines',
    'Publish a learning series and stay healthy',
    'Live a balanced creator lifestyle',
    ARRAY['health', 'creation', 'freedom']
)
ON CONFLICT (user_id) DO UPDATE SET
    daily = EXCLUDED.daily,
    weekly = EXCLUDED.weekly,
    year = EXCLUDED.year,
    life = EXCLUDED.life,
    tags = EXCLUDED.tags,
    updated_at = NOW();

INSERT INTO cycle (id, user_id, start_date, end_date, current_week)
VALUES (
    :'cycle_id', :'user_id', '2025-09-01', '2025-11-23', 5
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO goal (id, user_id, cycle_id, type, description, start_week, end_week)
VALUES
    (:'personal_goal', :'user_id', :'cycle_id', 'personal', 'Complete 3 strength workouts weekly', 1, 12),
    (:'professional_goal', :'user_id', :'cycle_id', 'professional', 'Publish one technical article weekly', 1, 12)
ON CONFLICT (id) DO NOTHING;

INSERT INTO weekly_plan (id, user_id, cycle_id, week_no, mode, locked_after_week)
VALUES
    (:'plan_week1', :'user_id', :'cycle_id', 1, 'priority_queue', 6),
    (:'plan_week7', :'user_id', :'cycle_id', 7, 'time_block', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO task (id, user_id, title, unit, default_qty, tags)
VALUES
    (:'deep_work_task', :'user_id', 'Deep work block', 'hours', 10, ARRAY['focus', 'creation']),
    (:'fitness_task', :'user_id', 'Strength training session', 'sessions', 3, ARRAY['health'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO plan_item (id, plan_id, goal_id, task_id, unit, qty, completed_qty, status, notes)
VALUES
    (gen_random_uuid(), :'plan_week1', :'professional_goal', :'deep_work_task', 'hours', 10, 8, 'completed', 'Shipped newsletter and video scripts'),
    (gen_random_uuid(), :'plan_week1', :'personal_goal', :'fitness_task', 'sessions', 3, 2, 'in_progress', 'Need to book trainer for session 3'),
    (gen_random_uuid(), :'plan_week7', :'professional_goal', :'deep_work_task', 'hours', 10, 0, 'planned', 'Locked quota after week 6')
ON CONFLICT DO NOTHING;

INSERT INTO chat_session (id, user_id, cycle_id, started_at, summary_md)
VALUES (
    :'session_id', :'user_id', :'cycle_id', NOW() - INTERVAL '3 days',
    '# Week 5 WAM\n- Completion: 82%\n- Highlights: Newsletter shipped early.\n- Frictions: Gym closed on Friday.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO chat_message (session_id, role, content, proposal_json)
VALUES
    (:'session_id', 'system', 'Week-in-review snapshot prepared.', NULL),
    (:'session_id', 'user', 'Felt stretched but managed the publishing cadence.', NULL),
    (:'session_id', 'ai', 'Recommend booking trainer on Sunday to unblock workout #3.', jsonb_build_object('type', 'task_adjustment', 'task', 'Strength training session', 'action', 'schedule', 'target_date', '2025-09-28'))
ON CONFLICT DO NOTHING;

INSERT INTO audit_log (id, actor_user_id, actor_type, subject_user_id, action, after_state)
VALUES (
    gen_random_uuid(), :'user_id', 'user', :'user_id', 'weekly_plan.update',
    jsonb_build_object('week_no', 1, 'completed_pct', 82)
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
