import { describe, expect, it } from "vitest";
import {
  PlanPayloadSchema,
  buildRewriteSuggestion,
  hasKpiLanguage,
} from "./plan-shared";

describe("plan validation helpers", () => {
  it("flags KPI-style language", () => {
    expect(hasKpiLanguage("Grow 500 followers")).toBe(true);
    expect(hasKpiLanguage("Write three essays")).toBe(false);
  });

  it("suggests input-based rewrite guidance", () => {
    const suggestion = buildRewriteSuggestion("Add 20% revenue");
    expect(suggestion).toContain("Rewrite as input");
    expect(suggestion).toContain("If");
  });

  it("accepts a well-formed payload", () => {
    const weeks = Array.from({ length: 12 }, (_, index) => ({
      weekNo: index + 1,
      tasks:
        index === 0
          ? [
              {
                goalType: "personal",
                task: "If 7am, then lift weights",
              },
              {
                goalType: "professional",
                task: "If afternoon block, then outline article",
              },
            ]
          : [],
      locked: false,
    }));

    const payload = {
      personalGoal: "Complete strength training",
      professionalGoal: "Publish articles",
      lockedAfterWeek: 6,
      weeks,
      copies: [],
    };

    const result = PlanPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
