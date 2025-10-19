"use client";

import { useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";
import Link from "next/link";
import { requestMagicLink } from "./actions";

const initialState = { message: null as string | null };

export default function LoginPage() {
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") ?? undefined;
  const queryMessage = params.get("message");
  const [state, formAction] = useFormState(requestMagicLink, initialState);

  return (
    <main>
      <section className="section-card">
        <h1>Secure email link</h1>
        <p>
          Enter your email to receive a one-time magic link. Links expire after 5
          minutes and are bound to this device.
        </p>
        <form action={formAction}>
          <input type="email" name="email" placeholder="you@example.com" required autoComplete="email" />
          {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
          <button type="submit">Send magic link</button>
        </form>
        {state.message ? <p>{state.message}</p> : null}
        {queryMessage ? <p>{queryMessage}</p> : null}
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/">Back to home</Link>
        </p>
      </section>
    </main>
  );
}
