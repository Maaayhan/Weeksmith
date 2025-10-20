"use client";

import { createContext, useContext, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";

type SupabaseClientType = ReturnType<typeof getBrowserClient>;

type SupabaseContextValue = {
  supabase: SupabaseClientType;
  session: Session | null;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

export default function SupabaseProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [supabaseClient] = useState<SupabaseClientType>(() => getBrowserClient());

  return (
    <SupabaseContext.Provider value={{ supabase: supabaseClient, session }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const value = useContext(SupabaseContext);
  if (!value) {
    throw new Error("SupabaseProvider is missing in the component tree");
  }
  return value;
}
