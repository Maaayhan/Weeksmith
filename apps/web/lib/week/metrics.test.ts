import { describe, expect, it } from "vitest";
import { computeCompletionInsights } from "./metrics";

describe("computeCompletionInsights", () => {
  it("returns zeroed insight when no quotas exist", () => {
    const insight = computeCompletionInsights([]);
    expect(insight.completionPct).toBe(0);
    expect(insight.zone).toBe("low");
  });

  it("flags under 80% as low zone with guidance", () => {
    const insight = computeCompletionInsights([
      { qty: 5, completedQty: 2, status: "in_progress" },
      { qty: 5, completedQty: 2, status: "planned" },
    ]);

    expect(insight.completionPct).toBe(40);
    expect(insight.zone).toBe("low");
    expect(insight.guidance).toContain("Below 80%");
  });

  it("flags over 90% as high zone with guidance to add challenge", () => {
    const insight = computeCompletionInsights([
      { qty: 4, completedQty: 4, status: "completed" },
      { qty: 2, completedQty: 2, status: "completed" },
    ]);

    expect(insight.completionPct).toBe(100);
    expect(insight.zone).toBe("high");
    expect(insight.guidance).toContain("Above 90%");
  });

  it("keeps values within the target zone when between 80 and 90", () => {
    const insight = computeCompletionInsights([
      { qty: 5, completedQty: 4, status: "completed" },
      { qty: 5, completedQty: 4, status: "in_progress" },
    ]);

    expect(insight.completionPct).toBe(80);
    expect(insight.zone).toBe("target");
    expect(insight.guidance).toContain("optimal");
  });
});
