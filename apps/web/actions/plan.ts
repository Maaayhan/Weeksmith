"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Database } from "@weeksmith/schemas";
import {
  PlanActionState,
  PlanCopyInput,
  PlanPayload,
  PlanPayloadSchema,
  buildRewriteSuggestion,
  hasKpiLanguage,
} from "@/actions/plan-shared";
import { createServerActionSupabaseClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/security/audit";
import { getCorrelationId, getRequestMetadata } from "@/lib/security/correlation";

function extractFieldErrors(issues: z.ZodIssue[]): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {};
  for (const issue of issues) {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  }
  return errors;
}

function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function ensureCycle(userId: string, supabase: any) {
  const { data: existing } = await supabase
    .from("cycle")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return existing as Database["public"]["Tables"]["cycle"]["Row"];
  }

  const start = new Date();
  const end = new Date(start.getTime() + 83 * 24 * 60 * 60 * 1000);
  const payload: Database["public"]["Tables"]["cycle"]["Insert"] = {
    user_id: userId,
    start_date: formatDate(start),
    end_date: formatDate(end),
    current_week: 1,
  };

  const { data, error } = await supabase
    .from("cycle")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to create 12-week cycle");
  }

  return data as Database["public"]["Tables"]["cycle"]["Row"];
}

export async function savePlan(
  _prevState: PlanActionState,
  formData: FormData,
): Promise<PlanActionState> {
  const supabase = createServerActionSupabaseClient() as any;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/auth/login?redirectTo=/plan");
  }

  const raw = formData.get("payload");
  if (typeof raw !== "string") {
    return { status: "error", message: "Missing plan payload." };
  }

  let parsed: PlanPayload;
  try {
    parsed = JSON.parse(raw) as PlanPayload;
  } catch (error) {
    console.error("Failed to parse plan payload", error);
    return { status: "error", message: "Plan data was invalid JSON." };
  }

  const validated = PlanPayloadSchema.safeParse(parsed);
  if (!validated.success) {
    return {
      status: "error",
      message: "Please resolve the highlighted issues.",
      fieldErrors: extractFieldErrors(validated.error.issues),
    };
  }

  const kpiIssues = validated.data.entries.filter((entry) => hasKpiLanguage(entry.task));
  if (kpiIssues.length) {
    const fieldErrors: Partial<Record<string, string>> = {};
    for (const issue of kpiIssues) {
      fieldErrors[`week-${issue.weekNo}`] = buildRewriteSuggestion(issue.task);
    }
    return {
      status: "error",
      message: "Input-only rule: avoid KPI language. Use actions you fully control.",
      fieldErrors,
    };
  }

  const userId = session.user.id;
  const correlationId = getCorrelationId();
  const requestMetadata = getRequestMetadata();

  let cycle;
  try {
    cycle = await ensureCycle(userId, supabase);
  } catch (error) {
    console.error("Failed to initialize cycle", error);
    return { status: "error", message: "Could not initialize your 12-week cycle." };
  }

  const goalPayloads: Database["public"]["Tables"]["goal"]["Insert"][] = [
    {
      user_id: userId,
      cycle_id: cycle.id,
      type: "personal",
      description: validated.data.personalGoal.trim(),
      start_week: 1,
      end_week: 12,
    },
    {
      user_id: userId,
      cycle_id: cycle.id,
      type: "professional",
      description: validated.data.professionalGoal.trim(),
      start_week: 1,
      end_week: 12,
    },
  ];

  const { data: goals, error: goalError } = await supabase
    .from("goal")
    .upsert(goalPayloads, { onConflict: "user_id,cycle_id,type" })
    .select("*");

  if (goalError || !goals?.length) {
    console.error("Unable to upsert goals", goalError);
    return { status: "error", message: "Could not save your goals. Please retry." };
  }

  const goalRows = goals as Database["public"]["Tables"]["goal"]["Row"][];
  const goalByType = goalRows.reduce<Record<string, Database["public"]["Tables"]["goal"]["Row"]>>(
    (acc, goal) => {
      acc[goal.type] = goal;
      return acc;
    },
    {},
  );

  const weeklyPayloads: Database["public"]["Tables"]["weekly_plan"]["Insert"][] = Array.from(
    { length: 12 },
    (_, index) => ({
      user_id: userId,
      cycle_id: cycle.id,
      week_no: index + 1,
      mode: "priority_queue",
      locked_after_week: validated.data.lockedAfterWeek,
    }),
  );

  const { data: weeklyPlans, error: weeklyError } = await supabase
    .from("weekly_plan")
    .upsert(weeklyPayloads, { onConflict: "user_id,cycle_id,week_no" })
    .select("id, week_no, locked_after_week");

  if (weeklyError || !weeklyPlans?.length) {
    console.error("Unable to upsert weekly plans", weeklyError);
    return { status: "error", message: "Could not prepare weekly plans." };
  }

  const weeklyPlanRows = weeklyPlans as Database["public"]["Tables"]["weekly_plan"]["Row"][];
  const weeklyMap = weeklyPlanRows.reduce<Record<number, { id: string; lockedAfter: number }>>((acc, plan) => {
    acc[plan.week_no] = { id: plan.id, lockedAfter: plan.locked_after_week ?? validated.data.lockedAfterWeek };
    return acc;
  }, {});

  const { data: existingPlanItems } = await supabase
    .from("plan_item")
    .select("id, qty, unit, notes, plan_id, goal_id, weekly_plan:weekly_plan!inner(week_no, locked_after_week)")
    .eq("weekly_plan.cycle_id", cycle.id)
    .eq("weekly_plan.user_id", userId);

  const existingItems = (existingPlanItems ?? []) as (Database["public"]["Tables"]["plan_item"]["Row"] & {
    weekly_plan?: { week_no?: number | null; locked_after_week?: number | null } | null;
  })[];

  for (const entry of validated.data.entries) {
    const plan = weeklyMap[entry.weekNo];
    if (!plan) {
      return { status: "error", message: `Weekly plan missing for week ${entry.weekNo}.` };
    }

    const goal = goalByType[entry.goalType];
    if (!goal) {
      return { status: "error", message: `Goal missing for ${entry.goalType}.` };
    }

    const existing = existingItems.find((item) => item.weekly_plan?.week_no === entry.weekNo);

    const lockedAfter = plan.lockedAfter;
    if (entry.weekNo > lockedAfter && existing) {
      const unchanged =
        Number(existing.qty) === entry.qty &&
        existing.unit === entry.unit &&
        (existing.notes ?? "") === entry.task.trim() &&
        existing.goal_id === goal.id;
      if (!unchanged) {
        return {
          status: "error",
          message: `Week ${entry.weekNo} is locked after week ${lockedAfter}.`,
          fieldErrors: { [`week-${entry.weekNo}`]: "Locked — quotas after week 6 are read-only." },
        };
      }
    }

    const payload: Database["public"]["Tables"]["plan_item"]["Insert"] = {
      id: existing?.id ?? entry.existingId,
      plan_id: plan.id,
      goal_id: goal.id,
      task_id: null,
      unit: entry.unit.trim(),
      qty: entry.qty,
      notes: entry.task.trim(),
      status: existing?.status ?? "planned",
    } as any;

    const { error } = await supabase.from("plan_item").upsert(payload);
    if (error) {
      console.error("Failed to upsert plan item", { error, payload });
      return { status: "error", message: `Could not save week ${entry.weekNo}.` };
    }
  }

  for (const copy of validated.data.copies) {
    const before = existingItems.find((item) => item.weekly_plan?.week_no === copy.toWeek);
    const after = validated.data.entries.find((entry) => entry.weekNo === copy.toWeek);
    await recordAuditLog({
      action: "plan.copy_to_week",
      actorType: "user",
      actorUserId: userId,
      subjectUserId: userId,
      correlationId,
      beforeState: before
        ? { week: copy.toWeek, qty: before.qty, unit: before.unit, notes: before.notes }
        : null,
      afterState: after
        ? { week: copy.toWeek, qty: after.qty, unit: after.unit, notes: after.task }
        : null,
      rationale: copy.rationale ?? null,
      ...requestMetadata,
    });
  }

  await revalidatePath("/plan");
  return { status: "success", message: "Plan saved with 6/6 lock enforcement." };
}
