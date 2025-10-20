import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(
  process.cwd(),
  "supabase",
  "migrations",
  "202510041230_core_schema.sql",
);

const migrationSql = readFileSync(migrationPath, "utf8");

describe("RLS baseline", () => {
  const tables = [
    "vision",
    "cycle",
    "goal",
    "weekly_plan",
    "task",
    "plan_item",
    "audit_log",
    "chat_session",
    "chat_message",
  ];

  it("enables row level security on every user table", () => {
    for (const table of tables) {
      expect(migrationSql).toMatch(
        new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`, "i"),
      );
    }
  });

  it("enforces ownership policies via auth.uid()", () => {
    const directPolicies: Record<string, RegExp> = {
      vision: /CREATE POLICY vision_owner_manage[\s\S]+auth\.uid\(\) = user_id/,
      cycle: /CREATE POLICY cycle_owner_manage[\s\S]+auth\.uid\(\) = user_id/,
      goal: /CREATE POLICY goal_owner_manage[\s\S]+auth\.uid\(\) = user_id/,
      weekly_plan: /CREATE POLICY weekly_plan_owner_manage[\s\S]+auth\.uid\(\) = user_id/,
      task: /CREATE POLICY task_owner_manage[\s\S]+auth\.uid\(\) = user_id/,
      chat_session:
        /CREATE POLICY chat_session_owner_manage[\s\S]+auth\.uid\(\) = user_id/,
    };

    for (const [table, pattern] of Object.entries(directPolicies)) {
      expect(migrationSql).toMatch(pattern);
    }

    expect(migrationSql).toMatch(
      /CREATE POLICY plan_item_owner_manage[\s\S]+weekly_plan\s+wp[\s\S]+wp\.user_id = auth\.uid\(\)/,
    );
    expect(migrationSql).toMatch(
      /CREATE POLICY chat_message_owner_manage[\s\S]+chat_session\s+cs[\s\S]+cs\.user_id = auth\.uid\(\)/,
    );
  });

  it("restricts audit log reads to the subject user", () => {
    expect(migrationSql).toMatch(
      /CREATE POLICY audit_log_subject_read[\s\S]+FOR SELECT[\s\S]+subject_user_id = auth\.uid\(\)/,
    );
  });
});
