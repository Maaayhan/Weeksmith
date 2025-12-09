import { redirect } from "next/navigation";
import type { Database } from "@weeksmith/schemas";
import { PlanBuilder } from "@/components/plan/plan-builder";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type PlanItemRecord = {
  id: string;
  qty: number;
  unit: string;
  notes: string | null;
  goal?: { type?: string | null } | null;
  weekly_plan?: { week_no?: number | null; locked_after_week?: number | null } | null;
};

export default async function PlanPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/auth/login?redirectTo=/plan");
  }

  const userId = session.user.id;

  const { data: visionRow } = await supabase
    .from("vision")
    .select("tags")
    .eq("user_id", userId)
    .maybeSingle();
  const vision = visionRow as Database["public"]["Tables"]["vision"]["Row"] | null;

  const visionTags = Array.isArray(vision?.tags) ? (vision.tags as string[]) : [];

  const { data: cycleRaw } = await supabase
    .from("cycle")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cycle = cycleRaw as Database["public"]["Tables"]["cycle"]["Row"] | null;
  const currentWeek = cycle?.current_week ?? 1; // Get current execution week

  const { data: goalsRaw } = cycle?.id
    ? await supabase
        .from("goal")
        .select("*")
        .eq("user_id", userId)
        .eq("cycle_id", cycle.id)
    : { data: [] };
  const goals = (goalsRaw ?? []) as Database["public"]["Tables"]["goal"]["Row"][];

  const personalGoal = goals.find((goal) => goal.type === "personal")?.description ?? "";
  const professionalGoal = goals.find((goal) => goal.type === "professional")?.description ?? "";

  let planItems: PlanItemRecord[] = [];
  if (cycle?.id) {
    const { data: planData } = await supabase
      .from("plan_item")
      .select(
        "id, qty, unit, notes, goal:goal_id(type), weekly_plan:weekly_plan!inner(week_no, locked_after_week)",
      )
      .eq("weekly_plan.user_id", userId)
      .eq("weekly_plan.cycle_id", cycle.id);

    planItems = (planData ?? []) as PlanItemRecord[];
  }

  let lockedAfterWeek = 6;
  const lockedFromPlan = planItems.find((item) => typeof item.weekly_plan?.locked_after_week === "number")?.weekly_plan
    ?.locked_after_week;
  if (typeof lockedFromPlan === "number") {
    lockedAfterWeek = lockedFromPlan;
  }

  // Helper function to determine if a week is locked based on current execution progress
  const isWeekLocked = (weekNo: number, currentWeek: number, lockedAfterWeek: number): boolean => {
    // Lock weeks 7-12 only when we've reached week 7 or later
    return currentWeek >= 7 && weekNo > lockedAfterWeek;
  };

  // Group plan items by week and build week entries with multiple tasks
  const initialWeeks = Array.from({ length: 12 }, (_, index) => {
    const weekNo = index + 1;
    // Get all tasks for this week
    const weekTasks = planItems.filter((item) => item.weekly_plan?.week_no === weekNo);
    
    // Convert to PlanTaskItem format (no qty/unit needed)
    const tasks = weekTasks.map((item) => ({
      id: item.id,
      goalType: (item.goal?.type as "personal" | "professional") ?? "personal",
      task: item.notes ?? "",
    }));

    // Determine if this week is locked based on current execution progress
    const locked = isWeekLocked(weekNo, currentWeek, lockedAfterWeek);

    return {
      weekNo,
      tasks,
      locked,
    };
  });

  return (
    <main>
      <section className="section-card plan-section">
        <PlanBuilder
          initialGoals={{ personal: personalGoal, professional: professionalGoal }}
          initialWeeks={initialWeeks}
          lockedAfterWeek={lockedAfterWeek}
          currentWeek={currentWeek}
          visionTags={visionTags}
        />
      </section>
    </main>
  );
}
