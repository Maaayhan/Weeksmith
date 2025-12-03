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
    const payload = {
      personalGoal: "Complete strength training",
      professionalGoal: "Publish articles",
      lockedAfterWeek: 6,
      entries: [
        {
          weekNo: 1,
          goalType: "personal",
          task: "If 7am, then lift weights",
          qty: 3,
          unit: "sessions",
        },
      ],
      copies: [],
    };

    const result = PlanPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
