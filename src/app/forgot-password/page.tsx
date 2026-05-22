"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthPendingNotice } from "@/components/auth/auth-pending-notice";
import { ErrorMessage } from "@/components/error/error-message";
import { Button } from "@/components/ui/button";
import { useAuthFormAvailability } from "@/hooks/use-auth-form-availability";
import { authErrorTitle, appendAuthRedirectQuery, currentAuthRedirectTarget } from "@/lib/auth/auth-utils";
import { useAuthStore } from "@/store/auth-store";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const { isFormDisabled, isLogoutInFlight, statusMessage } = useAuthFormAvailability();

  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginHref = appendAuthRedirectQuery("/login", searchParams.get("redirect"));

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

    if (!email.trim()) {
      setFormError("Email is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(email);
      if (!result.success) {
        setFormError(result.message ?? "Unable to send a reset link right now.");
        return;
      }

      setFeedback(result.message ?? null);
    } finally {
      setIsSubmitting(false);
    }
  }

  const errorMessage = formError ?? authError;
  const submitDisabled = isFormDisabled || isSubmitting;
  const submitLabel = isLogoutInFlight
    ? "Finishing sign out..."
    : isSubmitting
      ? "Sending reset link..."
      : "Send reset link";

  return (
    <AuthLayout
      eyebrow="Account"
      title="Reset your password"
      description="Enter your account email and we will send a link to choose a new password. Guest mode stays available without signing in."
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

        {errorMessage && (
          <ErrorMessage
            title={authErrorTitle(errorMessage, "Reset link failed")}
            message={errorMessage}
          />
        )}

        {feedback ? (
          <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {feedback}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
          <Button type="submit" className="h-10 rounded-xl px-5" disabled={submitDisabled}>
            {submitLabel}
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-10 rounded-xl">
            <Link href={loginHref}>Back to sign in</Link>
          </Button>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          If an account exists for that email, the reset message should arrive shortly. Check spam
          if you do not see it.
        </p>
      </form>
    </AuthLayout>
  );
}
