import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/sign-out";

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <main>
      <section className="section-card">
        <h1>Weeksmith</h1>
        <p>
          Six-Month Transformer — stay in the 85% learning zone with secure, audited
          execution.
        </p>
      </section>

      <section className="section-card" style={{ marginTop: "2rem" }}>
        {session ? (
          <div>
            <p>
              Signed in as <strong>{session.user.email}</strong>
            </p>
            <form action={signOut}>
              <button type="submit">Sign out</button>
            </form>
            <p style={{ marginTop: "1.5rem" }}>
              Head to your <Link href="/dashboard">cycle dashboard</Link> to review
              weekly quotas.
            </p>
          </div>
        ) : (
          <div>
            <p>You are not signed in.</p>
            <Link href="/auth/login">Continue with email</Link>
          </div>
        )}
      </section>
    </main>
  );
}
