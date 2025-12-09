import { z } from "zod";
import type { Database } from "@weeksmith/schemas";

export type VisionActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<VisionField, string>>;
  vision?: VisionSummary;
};

export type VisionSummary = {
  daily: string;
  weekly: string;
  year: string;
  life: string;
  tags: string[];
  updatedAt: string;
};

export type VisionField = "daily" | "weekly" | "year" | "life" | "tags";

export const initialVisionActionState: VisionActionState = {
  status: "idle",
};

export const visionFormSchema = z.object({
  daily: z
    .string()
    .min(1, "Daily vision is required")
    .max(2000, "Keep the daily vision under 2000 characters"),
  weekly: z
    .string()
    .min(1, "Weekly vision is required")
    .max(2000, "Keep the weekly vision under 2000 characters"),
  year: z
    .string()
    .min(1, "Year vision is required")
    .max(2000, "Keep the year vision under 2000 characters"),
  life: z
    .string()
    .min(1, "Life vision is required")
    .max(2000, "Keep the life vision under 2000 characters"),
  tags: z.string(),
});

export const MAX_TAGS = 12;

export function parseTags(input: string): string[] {
  if (!input) {
    return [];
  }
  const normalized = input
    .split(/[\n,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const tag of normalized) {
    const lowered = tag.toLowerCase();
    if (!seen.has(lowered)) {
      seen.add(lowered);
      unique.push(tag);
    }
  }
  return unique;
}

export function toCamelVision(row: Database["public"]["Tables"]["vision"]["Row"]): VisionSummary {
  return {
    daily: row.daily ?? "",
    weekly: row.weekly ?? "",
    year: row.year ?? "",
    life: row.life ?? "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}


