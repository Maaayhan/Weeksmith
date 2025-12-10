import type { PlanItemStatus } from "@weeksmith/schemas";

type ProgressInput = {
  qty: number;
  completedQty: number;
  status: PlanItemStatus;
};

export type CompletionInsight = {
  completionPct: number;
  totalQty: number;
  completedQty: number;
  zone: "low" | "target" | "high";
  guidance: string;
};

export function computeCompletionInsights(items: ProgressInput[]): CompletionInsight {
  const totals = items.reduce(
    (acc, item) => {
      const planned = Number.isFinite(item.qty) ? Math.max(item.qty, 0) : 0;
      const completed = Number.isFinite(item.completedQty)
        ? Math.min(Math.max(item.completedQty, 0), Math.max(planned, 0))
        : 0;
      return { total: acc.total + planned, completed: acc.completed + completed };
    },
    { total: 0, completed: 0 },
  );

  const completionPct = totals.total === 0 ? 0 : Math.round((totals.completed / totals.total) * 100);

  if (completionPct < 85) {
    return {
      completionPct,
      totalQty: totals.total,
      completedQty: totals.completed,
      zone: "low",
      guidance: "Below 85% — goals were too hard. Reduce scope or frequency to reach the 85% learning zone.",
    };
  }

  if (completionPct > 90) {
    return {
      completionPct,
      totalQty: totals.total,
      completedQty: totals.completed,
      zone: "high",
      guidance: "Above 90% — goals were too easy. Add challenge or volume to push back into the 85–90% band.",
    };
  }

  return {
    completionPct,
    totalQty: totals.total,
    completedQty: totals.completed,
    zone: "target",
    guidance: "Great pace — 85% is the optimal learning zone. You're learning effectively without getting lost.",
  };
}
