import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@weeksmith/schemas";
import { getClientEnv, getServerEnv } from "@/lib/env";

let serviceRoleClient: SupabaseClient<Database> | undefined;

export function getServiceRoleClient() {
  if (!serviceRoleClient) {
    const clientEnv = getClientEnv();
    const serverEnv = getServerEnv();
    serviceRoleClient = createClient<Database>(
      clientEnv.NEXT_PUBLIC_SUPABASE_URL,
      serverEnv.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
        },
      },
    );
  }
  return serviceRoleClient;
}
