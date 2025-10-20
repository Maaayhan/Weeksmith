import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";
import { recordAuditLog } from "@/lib/security/audit";
import { getCorrelationId, getRequestMetadata } from "@/lib/security/correlation";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") ?? "/";
  const supabase = createRouteHandlerSupabaseClient();

  if (code) {
    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      await recordAuditLog({
        action: "auth.exchange.error",
        actorType: "system",
        subjectUserId: session?.user?.id ?? "",
        rationale: error.message,
        correlationId: getCorrelationId(),
        ...getRequestMetadata(),
      });
      return NextResponse.redirect(new URL(`/auth/login?message=${encodeURIComponent(error.message)}`, requestUrl.origin));
    }

    if (session?.user?.id) {
      await recordAuditLog({
        action: "auth.sign_in",
        actorType: "user",
        subjectUserId: session.user.id,
        actorUserId: session.user.id,
        rationale: "Email magic link exchange",
        correlationId: getCorrelationId(),
        ...getRequestMetadata(),
      });
    }
  }

  // Sanitize redirect target to prevent open redirects
  const resolveSafeRedirect = (target: string, base: URL): URL => {
    try {
      // Disallow protocol-relative or absolute URLs (e.g. //evil.com or https://evil.com)
      if (target.startsWith("//") || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(target)) {
        return new URL("/", base.origin);
      }
      const url = new URL(target, base.origin);
      // Enforce same-origin only
      if (url.origin !== base.origin) {
        return new URL("/", base.origin);
      }
      return url;
    } catch {
      return new URL("/", base.origin);
    }
  };

  const redirectUrl = resolveSafeRedirect(redirectTo, requestUrl);
  return NextResponse.redirect(redirectUrl);
}
