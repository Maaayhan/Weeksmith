import { redirect } from "next/navigation";
import type { Database } from "@weeksmith/schemas";
import type { VisionSummary } from "@/actions/vision-shared";
import { saveVision } from "@/actions/vision";
import { AlignmentSurface } from "@/components/vision/alignment-surface";
import { VisionForm } from "@/components/vision/vision-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const UNTITLED_TASK = "Unlabeled plan item";

type PlanItemRecord = {
  id: string;
  weekly_plan?: { week_no?: number | null } | null;
  task?: { title?: string | null; tags?: string[] | null } | null;
};

type AlignmentChip = {
  id: string;
  label: string;
  reason: string;
  tags: string[];
  weekNo?: number | null;
};

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export default async function VisionPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/login?redirectTo=/vision");
  }

  const userId = session.user.id;

  const { data: visionRowRaw } = await supabase
    .from("vision")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const visionRow = visionRowRaw as
    | Database["public"]["Tables"]["vision"]["Row"]
    | null;

  const vision: VisionSummary = {
    daily: visionRow?.daily ?? "",
    weekly: visionRow?.weekly ?? "",
    year: visionRow?.year ?? "",
    life: visionRow?.life ?? "",
    tags: Array.isArray(visionRow?.tags) ? (visionRow?.tags as string[]) : [],
    updatedAt: visionRow?.updated_at ?? "",
  };

  const visionTagSet = new Set(vision.tags.map(normalizeTag));

  const { data: cycleRaw } = await supabase
    .from("cycle")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cycle = cycleRaw as
    | Database["public"]["Tables"]["cycle"]["Row"]
    | null;

  const { data: planItemsRaw, error: planError } = await supabase
    .from("plan_item")
    .select(
      `id, weekly_plan:weekly_plan!inner(week_no), task:task_id(title, tags)`,
    )
    .eq("weekly_plan.user_id", userId);

  if (planError) {
    console.warn("Could not load plan items for alignment", planError);
  }

  const planItems = (planItemsRaw ?? []) as PlanItemRecord[];

  const signals = planItems.map<AlignmentChip>((record) => {
    const taskTags = Array.isArray(record.task?.tags)
      ? (record.task?.tags as string[])
      : [];
    const normalizedTaskTags = taskTags.map(normalizeTag);
    const hasMatch = normalizedTaskTags.some((tag) => visionTagSet.has(tag));
    const label = record.task?.title?.trim() || UNTITLED_TASK;
    const weekNo = record.weekly_plan?.week_no ?? null;

    let reason = "Add tags to this task to enable alignment checks.";
    if (taskTags.length && !hasMatch) {
      reason = `Tags ${taskTags.map((tag) => `#${tag}`).join(" ")} are outside your current focus.`;
    } else if (taskTags.length && hasMatch) {
      reason = "";
    }

    return {
      id: record.id,
      label,
      reason,
      tags: taskTags,
      weekNo,
    };
  });

  const planSignals = signals.filter((chip) => chip.reason);
  const currentWeek = cycle?.current_week ?? null;
  const weekSignals = planSignals.filter((chip) =>
    typeof currentWeek === "number" ? chip.weekNo === currentWeek : false,
  );

  return (
    <main>
      <section className="section-card vision-section">
        <VisionForm initialVision={vision} action={saveVision} />
      </section>

      <section className="section-card vision-section" style={{ marginTop: "2rem" }}>
        <AlignmentSurface planSignals={planSignals} weekSignals={weekSignals} />
      </section>
    </main>
  );
}
