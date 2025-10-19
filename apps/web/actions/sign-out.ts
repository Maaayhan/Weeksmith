"use server";

import { redirect } from "next/navigation";
import { createServerActionSupabaseClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/security/audit";
import { getCorrelationId, getRequestMetadata } from "@/lib/security/correlation";

export async function signOut() {
  const supabase = createServerActionSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user?.id) {
    await recordAuditLog({
      action: "auth.sign_out",
      actorType: "user",
      subjectUserId: session.user.id,
      actorUserId: session.user.id,
      rationale: "User initiated sign out",
      correlationId: getCorrelationId(),
      ...getRequestMetadata(),
    });
  }

  await supabase.auth.signOut();
  redirect("/auth/login");
}
