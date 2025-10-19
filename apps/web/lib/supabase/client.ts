"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@weeksmith/schemas";

const createClient = () => createClientComponentClient<Database>();

let browserClient: ReturnType<typeof createClient> | null = null;

export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
