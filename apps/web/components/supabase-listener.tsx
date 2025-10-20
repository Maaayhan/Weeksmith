"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/supabase-provider";

export function SupabaseListener({
  serverAccessToken,
}: {
  serverAccessToken?: string;
}) {
  const router = useRouter();
  const { supabase } = useSupabase();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token !== serverAccessToken) {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, serverAccessToken, supabase]);

  return null;
}
