import { redirect } from "next/navigation";
import { z } from "zod";
import type { Database, PlanMode, PlanItemStatus } from "@weeksmith/schemas";
import { ThisWeekSurface } from "@/components/week/this-week-surface";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service";

type PlanItemRecord = {
  id: string;
  qty: number;
  unit: string;
  notes: string | null;
  completed_qty: number;
  status: PlanItemStatus;
  goal?: { type?: string | null } | null;
};

type ObstacleLog = {
  id: string;
  planItemId: string | null;
  category: "time" | "energy" | "environment" | "skill";
  note: string;
  createdAt: string;
  weekNo: number;
};

const obstacleStateSchema = z.object({
  planItemId: z.string().uuid().optional().nullable(),
  category: z.enum(["time", "energy", "environment", "skill"]),
  note: z.string(),
  weekNo: z.number().int().min(1).max(12),
});

function mapObstacleRows(rows: any[] | null | undefined): ObstacleLog[] {
  if (!rows?.length) return [];
  return rows
    .map((row) => {
      const parsed = obstacleStateSchema.safeParse(row.after_state);
      if (!parsed.success) return null;
      return {
        id: row.id as string,
        planItemId: parsed.data.planItemId ?? null,
        category: parsed.data.category,
        note: (row.rationale as string | null) ?? parsed.data.note,
        createdAt: row.created_at as string,
        weekNo: parsed.data.weekNo,
      } satisfies ObstacleLog;
    })
    .filter(Boolean) as ObstacleLog[];
}

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/auth/login?redirectTo=/dashboard");
  }

  const userId = session.user.id;

  const { data: cycleRaw } = await supabase
    .from("cycle")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cycle = cycleRaw as Database["public"]["Tables"]["cycle"]["Row"] | null;
  const weekNo = cycle?.current_week ?? 1;
  const cycleStartDate = cycle?.start_date ? new Date(cycle.start_date) : null;

  // Compute current week's elapsed percentage based on the 12-week cycle start date
  let weekProgressPct = 0;
  if (cycleStartDate) {
    const addDays = (date: Date, days: number) => {
      const d = new Date(date.getTime());
      d.setDate(d.getDate() + days);
      return d;
    };
    const startOfCurrentWeek = addDays(cycleStartDate, (weekNo - 1) * 7);
    const startOfNextWeek = addDays(cycleStartDate, weekNo * 7);
    const now = new Date();
    const progress =
      (now.getTime() - startOfCurrentWeek.getTime()) /
      Math.max(1, startOfNextWeek.getTime() - startOfCurrentWeek.getTime());
    weekProgressPct = Math.min(100, Math.max(0, Math.round(progress * 100)));
  }

  const { data: weeklyPlanRaw } = cycle?.id
    ? await supabase
        .from("weekly_plan")
        .select("*")
        .eq("user_id", userId)
        .eq("cycle_id", cycle.id)
        .eq("week_no", weekNo)
        .maybeSingle()
    : { data: null };

  const weeklyPlan = weeklyPlanRaw as Database["public"]["Tables"]["weekly_plan"]["Row"] | null;
  const lockedAfterWeek = weeklyPlan?.locked_after_week ?? 6;
  const planMode: PlanMode = weeklyPlan?.mode ?? "priority_queue";

  const { data: planItemsRaw } = weeklyPlan?.id
    ? await supabase
        .from("plan_item")
        .select("id, qty, unit, notes, completed_qty, status, goal:goal_id(type)")
        .eq("plan_id", weeklyPlan.id)
    : { data: [] };

  const planItems = (planItemsRaw ?? []) as PlanItemRecord[];

  const weekItems = planItems.map((item) => ({
    id: item.id,
    task: item.notes ?? "Untitled input",
    qty: Number(item.qty ?? 0),
    unit: item.unit ?? "sessions",
    completedQty: Number(item.completed_qty ?? 0),
    status: (item.status ?? "planned") as PlanItemStatus,
    goalType: (item.goal?.type as "personal" | "professional" | undefined) ?? "personal",
  }));

  const serviceSupabase = getServiceRoleClient();
  const { data: obstacleRows } = await serviceSupabase
    .from("audit_log")
    .select("id, created_at, after_state, rationale")
    .eq("subject_user_id", userId)
    .eq("action", "this_week.obstacle")
    .order("created_at", { ascending: false })
    .limit(12);

  const obstacles = mapObstacleRows(obstacleRows);

  return (
    <main>
      <section className="section-card week-section">
        <ThisWeekSurface
          weekNo={weekNo}
          lockedAfterWeek={lockedAfterWeek}
          weeklyPlanId={weeklyPlan?.id ?? null}
          initialMode={planMode}
          items={weekItems}
          obstacles={obstacles}
          weekProgressPct={weekProgressPct}
        />
      </section>
    </main>
  );
}
