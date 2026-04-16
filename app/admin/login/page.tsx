"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SessionResponse {
  authenticated: boolean;
  authConfigured: boolean;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authConfigured, setAuthConfigured] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const session = (await response.json()) as SessionResponse;

      setAuthConfigured(session.authConfigured);

      if (session.authenticated) {
        router.replace("/admin/dashboard");
      }
    };

    void checkSession();
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = (await response.json().catch(() => ({}))) as { error?: string };

    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? "Unable to login.");
      return;
    }

    router.replace("/admin/dashboard");
  };

  return (
    <main className="admin-shell">
      <section className="admin-card login-card">
        <h1>Admin Login</h1>
        <p>Sign in to manage draft content, preview updates, and publish portfolio changes.</p>

        {!authConfigured && (
          <div className="admin-warning">
            Admin auth is not configured yet. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your env.
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form-stack">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="admin-error">{error}</p>}

          <button type="submit" disabled={loading || !authConfigured}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

