"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { AuthLayout, PasswordInput } from "@/components/auth/auth-layout";
import { AuthPendingNotice } from "@/components/auth/auth-pending-notice";
import { ErrorMessage } from "@/components/error/error-message";
import { Button } from "@/components/ui/button";
import { prefetchUserTeams } from "@/hooks/queries/use-user-teams";
import { useAuthFormAvailability } from "@/hooks/use-auth-form-availability";
import { selectIsSessionReady } from "@/lib/auth/session-ready";
import {
  appendAuthRedirectQuery,
  authErrorTitle,
  currentAuthRedirectTarget,
} from "@/lib/auth/auth-utils";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const { isFormDisabled, isLogoutInFlight, statusMessage } = useAuthFormAvailability();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectParam = searchParams.get("redirect");
  const forgotPasswordHref = appendAuthRedirectQuery("/forgot-password", redirectParam);
  const successMessage = searchParams.get("message");

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    setIsSubmitting(false);
    router.replace(currentAuthRedirectTarget());
  }, [isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setFormError(null);

    if (isFormDisabled) {
      return;
    }

    if (!email.trim() || !password) {
      setFormError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login({ email, password });
      if (!result.success) {
        setFormError(result.message ?? "Unable to sign in. Please try again.");
        return;
      }

      const authState = useAuthStore.getState();
      if (selectIsSessionReady(authState) && authState.user?.id) {
        void prefetchUserTeams(queryClient, authState.user.id);
      }

      router.replace(currentAuthRedirectTarget());
    } finally {
      setIsSubmitting(false);
    }
  }

  const errorMessage = formError ?? authError;
  const submitDisabled = isFormDisabled || isSubmitting;
  const submitLabel = isLogoutInFlight
    ? "Finishing sign out..."
    : isSubmitting
      ? "Signing in..."
      : "Sign in";

  return (
    <AuthLayout
      eyebrow="Account"
      title="Welcome back"
      description="Sign in to sync saved teams, builder edits, recommendations, and Team Card exports. Guest mode remains available for core tools."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {statusMessage ? <AuthPendingNotice message={statusMessage} /> : null}

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

        <div className="space-y-1.5">
          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="Your password"
            disabled={submitDisabled}
          />
          <div className="flex justify-end">
            <Link
              href={forgotPasswordHref}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {successMessage ? (
          <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {successMessage}
          </p>
        ) : null}

        {errorMessage && (
          <ErrorMessage
            title={authErrorTitle(errorMessage, "Sign in failed")}
            message={errorMessage}
          />
        )}

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
          <Button type="submit" className="h-10 rounded-xl px-5" disabled={submitDisabled}>
            {submitLabel}
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-10 rounded-xl">
            <Link href="/register">Need an account? Create one</Link>
          </Button>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          You can keep using Builder, Pokédex, Abilities, and recommendations in guest mode.
          Signing in only adds cloud saving and sync.
        </p>
      </form>
    </AuthLayout>
  );
}
