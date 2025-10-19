import type { Metadata } from "next";
import "./globals.css";
import SupabaseProvider from "@/components/supabase-provider";
import { SupabaseListener } from "@/components/supabase-listener";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Weeksmith",
  description: "Six-Month Transformer — Authenticated workspace",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body>
        <SupabaseProvider session={session}>
          <SupabaseListener serverAccessToken={session?.access_token} />
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
