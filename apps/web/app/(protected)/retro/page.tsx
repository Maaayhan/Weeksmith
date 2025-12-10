import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function RetroPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/auth/login?redirectTo=/retro");
  }

  return (
    <main>
      <section className="section-card">
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>📊 Retro</h1>
          <p style={{ fontSize: "1.125rem", color: "rgba(226, 232, 240, 0.7)", marginBottom: "2rem" }}>
            12-Week Retrospective & Next Cycle Planning
          </p>
          <div style={{ background: "rgba(127, 86, 217, 0.1)", padding: "2rem", borderRadius: "1rem", border: "1px solid rgba(127, 86, 217, 0.2)" }}>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", marginBottom: "1rem" }}>
              <strong>Coming Soon</strong>
            </p>
            <p style={{ fontSize: "0.9375rem", color: "rgba(226, 232, 240, 0.6)", lineHeight: "1.6" }}>
              The Retro feature will help you review your entire 12-week cycle, analyze completion patterns, identify
              wins and obstacles, and generate a draft for your next cycle. This feature is currently under development.
            </p>
            <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(126, 134, 158, 0.2)" }}>
              <p style={{ fontSize: "0.875rem", color: "rgba(226, 232, 240, 0.5)", marginBottom: "0.5rem" }}>
                Expected features:
              </p>
              <ul style={{ textAlign: "left", fontSize: "0.875rem", color: "rgba(226, 232, 240, 0.6)", lineHeight: "1.8", maxWidth: "500px", margin: "0 auto" }}>
                <li>12-week completion distribution charts</li>
                <li>85% target achievement rate statistics</li>
                <li>Failure pattern analysis (time/energy/environment/skill)</li>
                <li>Wins and obstacles summary</li>
                <li>Input vs output insights</li>
                <li>Generate next cycle draft</li>
                <li>Export retrospective summary (Markdown/CSV)</li>
                <li>2-week rest mode recommendation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
