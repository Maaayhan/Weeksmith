 "use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database, Json } from "@weeksmith/schemas";
import { VisionUpsertSchema } from "@weeksmith/schemas";
import { createServerActionSupabaseClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/security/audit";
import { getCorrelationId, getRequestMetadata } from "@/lib/security/correlation";
import {
  MAX_TAGS,
  parseTags,
  toCamelVision,
  visionFormSchema,
  type VisionActionState,
  type VisionField,
  type VisionSummary,
} from "@/actions/vision-shared";

export async function saveVision(
  _prevState: VisionActionState,
  formData: FormData,
): Promise<VisionActionState> {
  const supabase = createServerActionSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/login?redirectTo=/vision");
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

  let error;
  let freshVisionRaw;
  
  if (existingVision) {
    // Update existing record
    const { data: updatedData, error: updateError } = await (supabase.from("vision") as any)
      .update({
        daily: payload.daily,
        weekly: payload.weekly,
        year: payload.year,
        life: payload.life,
        tags: payload.tags,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();
    error = updateError;
    freshVisionRaw = updatedData;
  } else {
    // Insert new record
    const { data: insertedData, error: insertError } = await (supabase.from("vision") as any)
      .insert(upsertPayload)
      .select()
      .single();
    error = insertError;
    freshVisionRaw = insertedData;
  }

  if (error) {
    console.error("Failed to save vision", error);
    return {
      status: "error",
      message: "We could not save your vision. Please try again.",
    };
  }

  const { data: fetchedData, error: fetchError } = await supabase
    .from("vision")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  
  if (fetchError) {
    console.error("Failed to fetch saved vision", fetchError);
    // If fetch fails but we have freshVisionRaw, use it as fallback
    if (!freshVisionRaw) {
      return {
        status: "error",
        message: "We could not verify your vision was saved. Please refresh the page.",
      };
    }
  } else {
    // Use fetched data as it's guaranteed to be fresh
    freshVisionRaw = fetchedData;
  }

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
