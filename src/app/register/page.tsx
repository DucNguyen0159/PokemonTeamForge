"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { AuthLayout, PasswordInput } from "@/components/auth/auth-layout";
import { ErrorMessage } from "@/components/error/error-message";
import { Button } from "@/components/ui/button";
import { currentAuthRedirectTarget } from "@/lib/auth/auth-utils";
import { useAuthStore } from "@/store/auth-store";

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(currentAuthRedirectTarget());
    }
  }, [isAuthenticated, router]);

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

    setIsSubmitting(true);
    try {
      const result = await register({ email, password, username });
      if (!result.success) {
        setFormError(result.message ?? "Unable to register right now.");
        return;
      }

      setFeedback(result.message ?? "Registration successful.");
      if (!(result.message ?? "").toLowerCase().includes("check your email")) {
        router.push(currentAuthRedirectTarget());
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Account"
      title="Create your trainer account"
      description="Save teams, sync edits, and keep your competitive builds organized. Guest builder tools stay available either way."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="username" className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Username (optional)</span>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-xl border border-border/60 bg-background/55 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Pokémon trainer name"
          />
        </label>

        <label htmlFor="email" className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Email</span>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-border/60 bg-background/55 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="you@example.com"
          />
        </label>

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          helperText="Use at least 8 characters. Avoid reusing passwords from other sites."
        />

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

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
          <Button type="submit" className="h-10 rounded-xl px-5" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-10 rounded-xl">
            <Link href="/login">Already have an account? Sign in</Link>
          </Button>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Accounts add cloud saving and sync. Guest mode remains available for building,
          browsing, analysis, recommendations, and exports.
        </p>
      </form>
    </AuthLayout>
  );
}
