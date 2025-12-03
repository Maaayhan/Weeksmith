"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { PlanMode } from "@weeksmith/schemas";
import { createServerActionSupabaseClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/security/audit";
import { getCorrelationId, getRequestMetadata } from "@/lib/security/correlation";

export type WeekActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
  mode?: PlanMode;
};

export const initialWeekState: WeekActionState = { status: "idle" };

const modeSchema = z.object({
  weeklyPlanId: z.string().uuid(),
  mode: z.enum(["time_block", "priority_queue"]),
});

const progressItemSchema = z.object({
  id: z.string().uuid(),
  completedQty: z.number().min(0),
  status: z.enum(["planned", "in_progress", "completed", "skipped"]),
});

const progressSchema = z.object({
  weeklyPlanId: z.string().uuid(),
  weekNo: z.number().int().min(1).max(12),
  lockedAfterWeek: z.number().int().min(1).max(12),
  items: progressItemSchema.array().max(64),
});

const obstacleSchema = z.object({
  planItemId: z.string().uuid(),
  weekNo: z.number().int().min(1).max(12),
  category: z.enum(["time", "energy", "environment", "skill"]),
  note: z.string().min(1).max(280),
});

export async function saveWeekMode(
  _prevState: WeekActionState,
  formData: FormData,
): Promise<WeekActionState> {
  const supabase = createServerActionSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/auth/login?redirectTo=/dashboard");
  }

  const parsed = modeSchema.safeParse({
    weeklyPlanId: formData.get("weeklyPlanId"),
    mode: formData.get("mode"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid mode selection." };
  }

  const { data, error } = await supabase
    .from("weekly_plan")
    .update({ mode: parsed.data.mode })
    .eq("id", parsed.data.weeklyPlanId)
    .eq("user_id", session.user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { status: "error", message: "Could not persist your view preference." };
  }

  const correlationId = getCorrelationId();
  const requestMetadata = getRequestMetadata();

  await recordAuditLog({
    action: "this_week.mode_change",
    actorType: "user",
    actorUserId: session.user.id,
    subjectUserId: session.user.id,
    correlationId,
    beforeState: null,
    afterState: { weeklyPlanId: parsed.data.weeklyPlanId, mode: parsed.data.mode },
    ...requestMetadata,
  });

  await revalidatePath("/dashboard");
  return { status: "success", message: "View saved.", mode: parsed.data.mode };
}

export async function saveWeekProgress(
  _prevState: WeekActionState,
  formData: FormData,
): Promise<WeekActionState> {
  const supabase = createServerActionSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/auth/login?redirectTo=/dashboard");
  }

  const raw = formData.get("payload");
  if (typeof raw !== "string") {
    return { status: "error", message: "Missing progress payload." };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse progress payload", error);
    return { status: "error", message: "Progress payload was invalid." };
  }

  const parsed = progressSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<string, string>> = {};
    parsed.error.issues.forEach((issue) => {
      fieldErrors[issue.path.join(".")] = issue.message;
    });
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors };
  }

  const { data: weeklyPlan } = await supabase
    .from("weekly_plan")
    .select("id, user_id, locked_after_week, week_no")
    .eq("id", parsed.data.weeklyPlanId)
    .maybeSingle();

  if (!weeklyPlan || weeklyPlan.user_id !== session.user.id) {
    return { status: "error", message: "Weekly plan not found." };
  }

  const lockedAfter = weeklyPlan.locked_after_week ?? parsed.data.lockedAfterWeek;
  const lockMessage =
    parsed.data.weekNo > lockedAfter
      ? `Week ${parsed.data.weekNo} is locked after week ${lockedAfter}. Quotas stay read-only.`
      : undefined;

  for (const item of parsed.data.items) {
    const { error } = await supabase
      .from("plan_item")
      .update({
        completed_qty: item.completedQty,
        status: item.status,
      })
      .eq("id", item.id)
      .eq("plan_id", parsed.data.weeklyPlanId);

    if (error) {
      console.error("Unable to update plan item", { error, item });
      return { status: "error", message: `Could not update ${item.id}.` };
    }
  }

  const correlationId = getCorrelationId();
  const requestMetadata = getRequestMetadata();
  await recordAuditLog({
    action: "this_week.progress_saved",
    actorType: "user",
    actorUserId: session.user.id,
    subjectUserId: session.user.id,
    correlationId,
    beforeState: null,
    afterState: { weekNo: parsed.data.weekNo, items: parsed.data.items },
    ...requestMetadata,
  });

  await revalidatePath("/dashboard");
  return {
    status: "success",
    message: lockMessage ?? "Progress saved.",
  };
}

export async function logObstacle(
  _prevState: WeekActionState,
  formData: FormData,
): Promise<WeekActionState> {
  const supabase = createServerActionSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/auth/login?redirectTo=/dashboard");
  }

  const parsed = obstacleSchema.safeParse({
    planItemId: formData.get("planItemId"),
    weekNo: Number(formData.get("weekNo")),
    category: formData.get("category"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Obstacle entry is incomplete." };
  }

  const correlationId = getCorrelationId();
  const requestMetadata = getRequestMetadata();
  await recordAuditLog({
    action: "this_week.obstacle",
    actorType: "user",
    actorUserId: session.user.id,
    subjectUserId: session.user.id,
    correlationId,
    beforeState: null,
    afterState: parsed.data,
    rationale: parsed.data.note,
    ...requestMetadata,
  });

  await revalidatePath("/dashboard");
  return { status: "success", message: "Obstacle captured for WAM and retro." };
}
