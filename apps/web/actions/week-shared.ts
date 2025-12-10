import type { PlanMode } from "@weeksmith/schemas";

export type WeekActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
  mode?: PlanMode;
};

export const initialWeekState: WeekActionState = { status: "idle" };

