"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createServerActionSupabaseClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/security/audit";
import { getCorrelationId, getRequestMetadata } from "@/lib/security/correlation";

const signInSchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().optional(),
});

export async function requestMagicLink(prevState: { message: string | null }, formData: FormData) {
  const values = signInSchema.safeParse({
    email: formData.get("email"),
    redirectTo: formData.get("redirectTo") ?? undefined,
  });

  if (!values.success) {
    return { message: "Enter a valid email address." };
  }

  const supabase = createServerActionSupabaseClient();
  const headerStore = headers();
  const origin =
    headerStore.get("origin") ??
    `${headerStore.get("x-forwarded-proto") ?? "https"}://${headerStore.get("host") ?? "localhost:3000"}`;

  const callback = new URL("/api/auth/callback", origin);
  if (values.data.redirectTo) {
    callback.searchParams.set("redirectTo", values.data.redirectTo);
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: values.data.email,
    options: {
      emailRedirectTo: callback.toString(),
    },
  });

  if (error) {
    await recordAuditLog({
      action: "auth.magic_link.error",
      actorType: "system",
      subjectUserId: values.data.email,
      rationale: error.message,
      correlationId: getCorrelationId(),
      ...getRequestMetadata(),
    });
    return { message: `Unable to send magic link: ${error.message}` };
  }

  await recordAuditLog({
    action: "auth.magic_link.requested",
    actorType: "system",
    subjectUserId: values.data.email,
    rationale: "Magic link dispatched via Supabase", 
    correlationId: getCorrelationId(),
    ...getRequestMetadata(),
  });

  return { message: "Check your email for the secure sign-in link." };
}
