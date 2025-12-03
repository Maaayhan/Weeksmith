import { z } from "zod";
import { GoalTypeEnum } from "@weeksmith/schemas";

export type PlanActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export type PlanEntryInput = {
  weekNo: number;
  goalType: z.infer<typeof GoalTypeEnum>;
  task: string;
  qty: number;
  unit: string;
  existingId?: string;
};

export type PlanCopyInput = {
  fromWeek: number;
  toWeek: number;
  rationale?: string;
};

export type PlanPayload = {
  personalGoal: string;
  professionalGoal: string;
  lockedAfterWeek: number;
  entries: PlanEntryInput[];
  copies: PlanCopyInput[];
};

export const initialPlanState: PlanActionState = { status: "idle" };

export const PlanEntrySchema = z.object({
  weekNo: z.number().int().min(1).max(12),
  goalType: GoalTypeEnum,
  task: z.string().min(1, "Describe the input you will control"),
  qty: z.number().nonnegative(),
  unit: z.string().min(1, "Unit is required").max(32),
  existingId: z.string().uuid().optional(),
});

export const PlanCopySchema = z.object({
  fromWeek: z.number().int().min(1).max(12),
  toWeek: z.number().int().min(1).max(12),
  rationale: z.string().max(400).optional(),
});

export const PlanPayloadSchema = z.object({
  personalGoal: z.string().min(1, "Personal goal is required"),
  professionalGoal: z.string().min(1, "Professional goal is required"),
  lockedAfterWeek: z.number().int().min(1).max(12).default(6),
  entries: PlanEntrySchema.array().max(32),
  copies: PlanCopySchema.array().max(24),
});

export const KPI_PATTERNS: RegExp[] = [
  /%/, /followers?/i, /revenue/i, /profit/i, /subscribers?/i, /mrr/i, /arr/i, /ctr/i, /conversion/i, /\$\s?\d/, /views?/i,
];

export function hasKpiLanguage(text: string): boolean {
  const normalized = text.trim();
  return KPI_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function buildRewriteSuggestion(task: string): string {
  const trimmed = task.trim();
  return `Rewrite as input: If [trigger], then I will [action]. Example from your text: "If ${
    trimmed.slice(0, 40) || "morning block"
  } then I will block 90 minutes for the work."`;
}
