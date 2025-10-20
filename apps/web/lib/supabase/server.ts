import { cookies } from "next/headers";
import {
  createRouteHandlerClient,
  createServerActionClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";
import type { Database } from "@weeksmith/schemas";
import { getClientEnv } from "@/lib/env";

const env = getClientEnv();

export function createServerSupabaseClient() {
  return createServerComponentClient<Database>(
    { cookies },
    {
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  );
}

export function createServerActionSupabaseClient() {
  return createServerActionClient<Database>(
    { cookies },
    {
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  );
}

export function createRouteHandlerSupabaseClient() {
  return createRouteHandlerClient<Database>(
    { cookies },
    {
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  );
}
