import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@weeksmith/schemas";
import { getClientEnv } from "@/lib/env";

const PROTECTED_PATHS = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const env = getClientEnv();
  const requestHeaders = new Headers(req.headers);
  const correlationId =
    requestHeaders.get("x-correlation-id") ?? crypto.randomUUID();
  requestHeaders.set("x-correlation-id", correlationId);

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  res.headers.set("x-correlation-id", correlationId);

  const supabase = createMiddlewareClient<Database>(
    { req, res },
    {
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const requiresAuth = PROTECTED_PATHS.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );

  if (!session && requiresAuth) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
