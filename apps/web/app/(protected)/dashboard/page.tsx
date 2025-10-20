import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCorrelationId } from "@/lib/security/correlation";

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login?redirectTo=/dashboard");
  }

  const correlationId = getCorrelationId();

  return (
    <main>
      <section className="section-card">
        <h1>Cycle overview</h1>
        <p>
          Correlation ID for this session: <code>{correlationId}</code>
        </p>
        <p>
          RLS-enforced data pipelines are ready. Future tasks will surface the
          12-week cycle, WAM cadence, and lock policies here.
        </p>
      </section>
    </main>
  );
}
