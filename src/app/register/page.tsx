"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { ErrorMessage } from "@/components/error/error-message";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setFeedback(null);
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError("Email and password are required.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    const result = await register({ email, password, username });
    if (!result.success) {
      setFormError(result.message ?? "Unable to register right now.");
      return;
    }

    setFeedback(result.message ?? "Registration successful.");
    if (!(result.message ?? "").toLowerCase().includes("check your email")) {
      router.push("/profile");
    }
  }

  return (
    <PlaceholderPage
      eyebrow="Account"
      title="Create account"
      description="Create an account to save and sync teams with Supabase. Guest builder tools stay available either way."
    >
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3">
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Username (optional)</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Pokemon trainer name"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="you@example.com"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="At least 8 characters"
          />
        </label>

        {(formError || authError) && (
          <ErrorMessage
            title="Registration failed"
            message={formError ?? authError ?? "Unable to register right now."}
          />
        )}

        {feedback && (
          <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {feedback}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" className="rounded-xl" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link href="/login">Already have an account? Sign in</Link>
          </Button>
        </div>
      </form>
    </PlaceholderPage>
  );
}
