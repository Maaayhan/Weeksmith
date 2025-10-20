import { headers } from "next/headers";
import { randomUUID } from "crypto";

export function getCorrelationId(): string {
  const store = headers();
  return store.get("x-correlation-id") ?? randomUUID();
}

export function getRequestMetadata(): {
  sourceIp: string | null;
  userAgent: string | null;
} {
  const store = headers();
  const forwardedFor = store.get("x-forwarded-for");
  const sourceIp = forwardedFor?.split(",")[0]?.trim() ?? null;
  const userAgent = store.get("user-agent");
  return {
    sourceIp,
    userAgent,
  };
}
