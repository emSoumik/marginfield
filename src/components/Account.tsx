import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Dialog } from "./Dialog";
export function Setup({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="Connect your Marginfield workspace" onClose={onClose}>
      <div className="form-body">
        <p className="form-description">
          You’re exploring the local preview. Your sample library is separate
          from any cloud account.
        </p>
        <ol className="setup-list">
          <li>Connect a new Convex development project.</li>
          <li>
            Set <code>VITE_CONVEX_URL</code> in the local environment.
          </li>
          <li>Configure Convex Auth and provider keys on the backend.</li>
          <li>Restart the app, then create your account.</li>
        </ol>
        <p className="subtle-note">
          Keys never belong in the browser. See the project README and provider
          setup guide. No email is sent by this preview.
        </p>
        <button className="primary-button" onClick={onClose}>
          Keep exploring
          <ArrowRightIcon size={17} />
        </button>
      </div>
    </Dialog>
  );
}
export function SignIn({ onPreview }: { onPreview: () => void }) {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="brand">
          <img src="/brand/mark.png" alt="" width="43" height="43" />
          <span>marginfield</span>
        </div>
        <h1>
          Your reading.
          <br />A little more perspective.
        </h1>
        <p>
          Save the good things. Connect the ideas. Make room for what matters.
        </p>
        <form
          className="form-body"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            setError("");
            const data = new FormData(e.currentTarget);
            data.set("flow", flow);
            try {
              await signIn("password", data);
            } catch {
              setError(
                flow === "signIn"
                  ? "Sign-in failed. Check your email and password, then try again."
                  : "Account creation failed. Check your details or try signing in.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={
              flow === "signIn" ? "current-password" : "new-password"
            }
            required
            minLength={8}
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button" disabled={busy}>
            {busy
              ? "One moment…"
              : flow === "signIn"
                ? "Sign in"
                : "Create account"}
            <ArrowRightIcon size={17} />
          </button>
          <button
            type="button"
            className="auth-switch"
            onClick={() => {
              setFlow(flow === "signIn" ? "signUp" : "signIn");
              setError("");
            }}
          >
            {flow === "signIn"
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </form>
        <button className="secondary-button" onClick={onPreview}>
          Explore the sample workspace
        </button>
      </section>
    </main>
  );
}
