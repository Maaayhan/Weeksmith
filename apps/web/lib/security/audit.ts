import type { ActorType, Json } from "@weeksmith/schemas";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase/service";

const uuidSchema = z.string().uuid();

export const UNAUTHENTICATED_SUBJECT_ID = "00000000-0000-0000-0000-000000000000";

type AuditLogInput = {
  action: string;
  actorType: ActorType;
  subjectUserId: string;
  actorUserId?: string | null;
  beforeState?: Json | null;
  afterState?: Json | null;
  rationale?: string | null;
  correlationId?: string | null;
  sourceIp?: string | null;
  userAgent?: string | null;
};

export async function recordAuditLog(entry: AuditLogInput): Promise<void> {
  const supabase = getServiceRoleClient();
  const subjectUserId = uuidSchema.safeParse(entry.subjectUserId).success
    ? entry.subjectUserId
    : UNAUTHENTICATED_SUBJECT_ID;
  const actorUserId = entry.actorUserId && uuidSchema.safeParse(entry.actorUserId).success
    ? entry.actorUserId
    : null;

  const { error } = await supabase.from("audit_log").insert({
    action: entry.action,
    actor_type: entry.actorType,
    subject_user_id: subjectUserId,
    actor_user_id: actorUserId,
    before_state: entry.beforeState ?? null,
    after_state: entry.afterState ?? null,
    rationale: entry.rationale ?? null,
    correlation_id: entry.correlationId ?? null,
    source_ip: entry.sourceIp ?? null,
    user_agent: entry.userAgent ?? null,
  });
  if (error) {
    console.error("Failed to record audit log", {
      error,
      action: entry.action,
      subjectUserId,
      correlationId: entry.correlationId ?? null,
    });
  }
}
