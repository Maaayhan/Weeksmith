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

  // Check for KPI language in all tasks across all weeks
  const kpiIssues: Array<{ weekNo: number; taskIndex: number; task: string }> = [];
  for (const week of validated.data.weeks) {
    for (let taskIndex = 0; taskIndex < week.tasks.length; taskIndex++) {
      const task = week.tasks[taskIndex];
      if (hasKpiLanguage(task.task)) {
        kpiIssues.push({ weekNo: week.weekNo, taskIndex, task: task.task });
      }
    }
  }

  if (kpiIssues.length) {
    const fieldErrors: Partial<Record<string, string>> = {};
    for (const issue of kpiIssues) {
      const fieldPath = `weeks.${issue.weekNo - 1}.tasks.${issue.taskIndex}.task`;
      fieldErrors[fieldPath] = buildRewriteSuggestion(issue.task);
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

  // Get current week for lock validation
  const currentWeek = cycle.current_week;

  // Process each week and its tasks
  for (const weekEntry of validated.data.weeks) {
    const plan = weeklyMap[weekEntry.weekNo];
    if (!plan) {
      return { status: "error", message: `Weekly plan missing for week ${weekEntry.weekNo}.` };
    }

    // Check if week is locked based on current execution progress
    const isLocked = currentWeek >= 7 && weekEntry.weekNo > validated.data.lockedAfterWeek;
    if (isLocked) {
      // For locked weeks, verify no changes were made
      const existingWeekItems = existingItems.filter((item) => item.weekly_plan?.week_no === weekEntry.weekNo);
      
      // Check 1: Total task count must match (prevents adding new tasks)
      if (weekEntry.tasks.length !== existingWeekItems.length) {
        return {
          status: "error",
          message: `Week ${weekEntry.weekNo} is locked. Cannot add or remove tasks.`,
          fieldErrors: {
            [`week-${weekEntry.weekNo}`]: `Locked: You're in week ${currentWeek}, weeks 7-12 cannot be modified.`,
          },
        };
      }

      // Check 2: All tasks must have IDs (no new tasks allowed)
      const tasksWithoutIds = weekEntry.tasks.filter((t) => !t.id);
      if (tasksWithoutIds.length > 0) {
        return {
          status: "error",
          message: `Week ${weekEntry.weekNo} is locked. Cannot add new tasks.`,
          fieldErrors: {
            [`week-${weekEntry.weekNo}`]: `Locked: You're in week ${currentWeek}, weeks 7-12 cannot be modified.`,
          },
        };
      }

      // Check 3: All task IDs must exist in existing items (prevents ID manipulation)
      const existingTaskIds = new Set(existingWeekItems.map((item) => item.id));
      const submittedTaskIds = new Set(weekEntry.tasks.map((t) => t.id!));
      const hasUnknownIds = [...submittedTaskIds].some((id) => !existingTaskIds.has(id));
      if (hasUnknownIds) {
        return {
          status: "error",
          message: `Week ${weekEntry.weekNo} is locked. Invalid task IDs detected.`,
          fieldErrors: {
            [`week-${weekEntry.weekNo}`]: `Locked: You're in week ${currentWeek}, weeks 7-12 cannot be modified.`,
          },
        };
      }

      // Check 4: Verify no existing tasks were modified
      for (const task of weekEntry.tasks) {
        if (!task.id) {
          // This should never happen due to Check 2, but double-check
          return {
            status: "error",
            message: `Week ${weekEntry.weekNo} is locked. Invalid task data.`,
            fieldErrors: {
              [`week-${weekEntry.weekNo}`]: `Locked: You're in week ${currentWeek}, weeks 7-12 cannot be modified.`,
            },
          };
        }

        const existing = existingWeekItems.find((item) => item.id === task.id);
        if (!existing) {
          // This should never happen due to Check 3, but double-check
          return {
            status: "error",
            message: `Week ${weekEntry.weekNo} is locked. Task not found.`,
            fieldErrors: {
              [`week-${weekEntry.weekNo}`]: `Locked: You're in week ${currentWeek}, weeks 7-12 cannot be modified.`,
            },
          };
        }

        const goal = goalByType[task.goalType];
        if (!goal) {
          return { status: "error", message: `Goal missing for ${task.goalType}.` };
        }

        const unchanged =
          (existing.notes ?? "") === task.task.trim() &&
          existing.goal_id === goal.id;
        if (!unchanged) {
          return {
            status: "error",
            message: `Week ${weekEntry.weekNo} is locked. Cannot modify tasks.`,
            fieldErrors: {
              [`week-${weekEntry.weekNo}`]: `Locked: You're in week ${currentWeek}, weeks 7-12 cannot be modified.`,
            },
          };
        }
      }

      // If we reach here, locked week is valid - skip processing (tasks unchanged)
      continue;
    }

    // Process each task in the week (only for unlocked weeks)
    for (const task of weekEntry.tasks) {
      const goal = goalByType[task.goalType];
      if (!goal) {
        return { status: "error", message: `Goal missing for ${task.goalType}.` };
      }

      const existing = task.id
        ? existingItems.find((item) => item.id === task.id)
        : undefined;

      const payload: Database["public"]["Tables"]["plan_item"]["Insert"] = {
        id: existing?.id ?? task.id,
        plan_id: plan.id,
        goal_id: goal.id,
        task_id: null,
        unit: "count", // Default unit since we don't use qty/unit anymore
        qty: 1, // Default qty since we don't use qty/unit anymore
        notes: task.task.trim(),
        status: existing?.status ?? "planned",
      } as any;

      const { error } = await supabase.from("plan_item").upsert(payload);
      if (error) {
        console.error("Failed to upsert plan item", { error, payload });
        return { status: "error", message: `Could not save week ${weekEntry.weekNo}, task ${task.task}.` };
      }
    }

    // Remove tasks that were deleted (only for unlocked weeks)
    if (!isLocked) {
      const existingWeekItems = existingItems.filter((item) => item.weekly_plan?.week_no === weekEntry.weekNo);
      const currentTaskIds = new Set(weekEntry.tasks.filter((t) => t.id).map((t) => t.id!));
      const toDelete = existingWeekItems.filter((item) => !currentTaskIds.has(item.id));

      for (const itemToDelete of toDelete) {
        const { error } = await supabase.from("plan_item").delete().eq("id", itemToDelete.id);
        if (error) {
          console.error("Failed to delete plan item", { error, id: itemToDelete.id });
        }
      }
    }
  }

  for (const copy of validated.data.copies) {
    const beforeItems = existingItems.filter((item) => item.weekly_plan?.week_no === copy.toWeek);
    const afterWeek = validated.data.weeks.find((week) => week.weekNo === copy.toWeek);
    await recordAuditLog({
      action: "plan.copy_to_week",
      actorType: "user",
      actorUserId: userId,
      subjectUserId: userId,
      correlationId,
      beforeState: beforeItems.length > 0
        ? {
            week: copy.toWeek,
            tasks: beforeItems.map((item) => ({
              notes: item.notes,
            })),
          }
        : null,
      afterState: afterWeek
        ? {
            week: copy.toWeek,
            tasks: afterWeek.tasks.map((task) => ({
              notes: task.task,
            })),
          }
        : null,
      rationale: copy.rationale ?? null,
      ...requestMetadata,
    });
  }

  await revalidatePath("/plan");
  return { status: "success", message: "Plan saved with 6/6 lock enforcement." };
}
