"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Database, Json } from "@weeksmith/schemas";
import { VisionUpsertSchema } from "@weeksmith/schemas";
import { createServerActionSupabaseClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/security/audit";
import { getCorrelationId, getRequestMetadata } from "@/lib/security/correlation";

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

type VisionField = "daily" | "weekly" | "year" | "life" | "tags";

const initialMessage: VisionActionState = {
  status: "idle",
};

const visionFormSchema = z.object({
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

const MAX_TAGS = 12;

function parseTags(input: string): string[] {
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
    if (unique.length >= MAX_TAGS) {
      break;
    }
  }
  return unique;
}

function toCamelVision(row: Database["public"]["Tables"]["vision"]["Row"]): VisionSummary {
  return {
    daily: row.daily ?? "",
    weekly: row.weekly ?? "",
    year: row.year ?? "",
    life: row.life ?? "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

export async function saveVision(
  _prevState: VisionActionState,
  formData: FormData,
): Promise<VisionActionState> {
  const supabase = createServerActionSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/auth/login?redirectTo=/vision");
  }

  const raw = {
    daily: ((formData.get("daily") ?? "") as string).trim(),
    weekly: ((formData.get("weekly") ?? "") as string).trim(),
    year: ((formData.get("year") ?? "") as string).trim(),
    life: ((formData.get("life") ?? "") as string).trim(),
    tags: ((formData.get("tags") ?? "") as string).trim(),
  };

  const parsed = visionFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<VisionField, string>> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path.length) {
        const key = issue.path[0] as VisionField;
        fieldErrors[key] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please resolve the highlighted issues.",
      fieldErrors,
    };
  }

  const tags = parseTags(parsed.data.tags);
  if (tags.length > MAX_TAGS) {
    return {
      status: "error",
      message: `Limit tags to ${MAX_TAGS} unique entries to keep focus.`,
      fieldErrors: { tags: `Limit tags to ${MAX_TAGS} unique entries.` },
    };
  }

  const payload = VisionUpsertSchema.parse({
    daily: parsed.data.daily,
    weekly: parsed.data.weekly,
    year: parsed.data.year,
    life: parsed.data.life,
    tags,
  });

  const userId = session.user.id;

  const { data: existingVisionRaw, error: readError } = await supabase
    .from("vision")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const existingVision = existingVisionRaw as
    | Database["public"]["Tables"]["vision"]["Row"]
    | null;

  if (readError) {
    console.error("Failed to read existing vision", readError);
    return {
      status: "error",
      message: "Could not load your current vision. Please retry.",
    };
  }

  const upsertPayload: Database["public"]["Tables"]["vision"]["Insert"] = {
    user_id: userId,
    daily: payload.daily,
    weekly: payload.weekly,
    year: payload.year,
    life: payload.life,
    tags: payload.tags,
  };

  const { error } = await (supabase.from("vision") as any).upsert(upsertPayload);

  if (error) {
    console.error("Failed to save vision", error);
    return {
      status: "error",
      message: "We could not save your vision. Please try again.",
    };
  }

  const { data: freshVisionRaw } = await supabase
    .from("vision")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const freshVision = freshVisionRaw as
    | Database["public"]["Tables"]["vision"]["Row"]
    | null;

  const summary = freshVision
    ? toCamelVision(freshVision)
    : {
        daily: payload.daily,
        weekly: payload.weekly,
        year: payload.year,
        life: payload.life,
        tags: payload.tags,
        updatedAt: new Date().toISOString(),
      };

  const beforeState: Json | null = existingVision
    ? {
        daily: existingVision.daily,
        weekly: existingVision.weekly,
        year: existingVision.year,
        life: existingVision.life,
        tags: existingVision.tags,
        updated_at: existingVision.updated_at,
      }
    : null;

  const afterState: Json = freshVision
    ? {
        daily: freshVision.daily,
        weekly: freshVision.weekly,
        year: freshVision.year,
        life: freshVision.life,
        tags: freshVision.tags,
        updated_at: freshVision.updated_at,
      }
    : {
        daily: payload.daily,
        weekly: payload.weekly,
        year: payload.year,
        life: payload.life,
        tags: payload.tags,
      };

  await recordAuditLog({
    action: existingVision ? "vision.update" : "vision.create",
    actorType: "user",
    subjectUserId: userId,
    actorUserId: userId,
    beforeState,
    afterState,
    correlationId: getCorrelationId(),
    ...getRequestMetadata(),
  });

  revalidatePath("/vision");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Vision saved successfully.",
    vision: summary,
  };
}

export { initialMessage as initialVisionActionState };
