"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { AuthLayout, PasswordInput } from "@/components/auth/auth-layout";
import { AuthPendingNotice } from "@/components/auth/auth-pending-notice";
import { ErrorMessage } from "@/components/error/error-message";
import { Button } from "@/components/ui/button";
import { prefetchUserTeams } from "@/hooks/queries/use-user-teams";
import { useAuthFormAvailability } from "@/hooks/use-auth-form-availability";
import { selectIsSessionReady } from "@/lib/auth/session-ready";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/auth-constants";
import { authErrorTitle, currentAuthRedirectTarget } from "@/lib/auth/auth-utils";
import { useAuthStore } from "@/store/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const register = useAuthStore((state) => state.register);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const { isFormDisabled, isLogoutInFlight, statusMessage } = useAuthFormAvailability();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

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

    if (isFormDisabled) {
      return;
    }

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
        const authState = useAuthStore.getState();
        if (selectIsSessionReady(authState) && authState.user?.id) {
          void prefetchUserTeams(queryClient, authState.user.id);
        }

        router.replace(currentAuthRedirectTarget());
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const errorMessage = formError ?? authError;
  const submitDisabled = isFormDisabled || isSubmitting;
  const submitLabel = isLogoutInFlight
    ? "Finishing sign out..."
    : isSubmitting
      ? "Creating account..."
      : "Create account";

  return (
    <AuthLayout
      eyebrow="Account"
      title="Create your trainer account"
      description="Save teams, sync edits, and keep your competitive builds organized. Guest builder tools stay available either way."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {statusMessage ? <AuthPendingNotice message={statusMessage} /> : null}

        <label htmlFor="username" className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Username (optional)</span>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={submitDisabled}
            className="w-full rounded-xl border border-border/60 bg-background/55 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
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
            disabled={submitDisabled}
            className="w-full rounded-xl border border-border/60 bg-background/55 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
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
          disabled={submitDisabled}
        />

        {errorMessage && (
          <ErrorMessage
            title={authErrorTitle(errorMessage, "Registration failed")}
            message={errorMessage}
          />
        )}

        {feedback && (
          <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {feedback}
          </p>
        )}

        <p className="text-xs leading-relaxed text-muted-foreground">
          By creating an account, you agree to the{" "}
          <Link href="/terms" className="font-medium text-foreground underline underline-offset-2">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-foreground underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
          <Button type="submit" className="h-10 rounded-xl px-5" disabled={submitDisabled}>
            {submitLabel}
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
