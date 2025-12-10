import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function WAMPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/auth/login?redirectTo=/wam");
  }

  return (
    <main>
      <section className="section-card">
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>💬 AI WAM</h1>
          <p style={{ fontSize: "1.125rem", color: "rgba(226, 232, 240, 0.7)", marginBottom: "2rem" }}>
            Weekly Accountability Meeting with AI
          </p>
          <div style={{ background: "rgba(127, 86, 217, 0.1)", padding: "2rem", borderRadius: "1rem", border: "1px solid rgba(127, 86, 217, 0.2)" }}>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", marginBottom: "1rem" }}>
              <strong>Coming Soon</strong>
            </p>
            <p style={{ fontSize: "0.9375rem", color: "rgba(226, 232, 240, 0.6)", lineHeight: "1.6" }}>
              The AI WAM feature will help you review your week, identify obstacles, and generate actionable proposals
              to improve your next week&apos;s plan. This feature is currently under development.
            </p>
            <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(126, 134, 158, 0.2)" }}>
              <p style={{ fontSize: "0.875rem", color: "rgba(226, 232, 240, 0.5)", marginBottom: "0.5rem" }}>
                Expected workflow:
              </p>
              <ul style={{ textAlign: "left", fontSize: "0.875rem", color: "rgba(226, 232, 240, 0.6)", lineHeight: "1.8", maxWidth: "500px", margin: "0 auto" }}>
                <li>AI warm-up and check-in</li>
                <li>You share your week&apos;s experience</li>
                <li>AI presents facts and insights</li>
                <li>Collaborative diagnosis</li>
                <li>Proposal cards (Approve/Edit/Reject)</li>
                <li>Export meeting summary</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
