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
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/auth-constants";
import { selectIsSessionReady } from "@/lib/auth/session-ready";
import {
  appendAuthRedirectQuery,
  authErrorTitle,
  currentAuthRedirectTarget,
} from "@/lib/auth/auth-utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toFriendlySupabaseMessage } from "@/lib/supabase/errors";
import { useAuthStore } from "@/store/auth-store";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const session = useAuthStore((state) => state.session);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const { isFormDisabled, isLogoutInFlight, statusMessage } = useAuthFormAvailability();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExchangingCode, setIsExchangingCode] = useState(
    () => searchParams.has("code"),
  );

  const forgotHref = appendAuthRedirectQuery("/forgot-password", searchParams.get("redirect"));
  const hasRecoverySession = Boolean(session);
  const showInvalidLink =
    isInitialized && !isLoading && !hasRecoverySession && !isExchangingCode;

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      return;
    }

    let cancelled = false;

    async function exchangeRecoveryCode(recoveryCode: string) {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.exchangeCodeForSession(recoveryCode);

      if (cancelled) {
        return;
      }

      setIsExchangingCode(false);

      if (error) {
        setFormError(
          toFriendlySupabaseMessage(
            error,
            "Unable to confirm this reset link. Request a new password reset.",
          ),
        );
        return;
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      const nextPath = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState({}, "", nextPath);
    }

    void exchangeRecoveryCode(code);

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    if (!isInitialized || isLoading || isExchangingCode) {
      return;
    }

    if (isAuthenticated && !hasRecoverySession) {
      router.replace(currentAuthRedirectTarget());
    }
  }, [
    hasRecoverySession,
    isAuthenticated,
    isExchangingCode,
    isInitialized,
    isLoading,
    router,
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setFormError(null);

    if (isFormDisabled || showInvalidLink) {
      return;
    }

    if (!password || !confirmPassword) {
      setFormError("Enter and confirm your new password.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updatePassword(password);
      if (!result.success) {
        setFormError(result.message ?? "Unable to update your password right now.");
        return;
      }

      const authState = useAuthStore.getState();
      if (selectIsSessionReady(authState) && authState.user?.id) {
        void prefetchUserTeams(queryClient, authState.user.id);
      }

      if (selectIsSessionReady(authState)) {
        router.replace(currentAuthRedirectTarget());
        return;
      }

      const message = result.message ?? "Password updated. Sign in with your new password.";
      router.replace(`/login?message=${encodeURIComponent(message)}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  const errorMessage = formError ?? authError;
  const submitDisabled = isFormDisabled || isSubmitting || showInvalidLink;
  const submitLabel = isLogoutInFlight
    ? "Finishing sign out..."
    : isSubmitting
      ? "Updating password..."
      : "Update password";

  if (!isInitialized || isLoading || isExchangingCode) {
    return (
      <AuthLayout
        eyebrow="Account"
        title="Choose a new password"
        description="Confirming your reset link..."
      >
        <p className="text-sm text-muted-foreground">Loading...</p>
      </AuthLayout>
    );
  }

  if (showInvalidLink) {
    return (
      <AuthLayout
        eyebrow="Account"
        title="Reset link expired"
        description="This password reset link is invalid or has expired. Request a new one to continue."
      >
        <div className="space-y-4">
          <ErrorMessage
            title="Link not valid"
            message="Open the reset link from your email, or request a new password reset."
          />
          <Button asChild className="h-10 rounded-xl px-5">
            <Link href={forgotHref}>Request a new reset link</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-10 rounded-xl">
            <Link href={appendAuthRedirectQuery("/login", searchParams.get("redirect"))}>
              Back to sign in
            </Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Account"
      title="Choose a new password"
      description="Your reset link confirms it is you. After you save a new password, you stay signed in—no need to sign in again on this device."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {statusMessage ? <AuthPendingNotice message={statusMessage} /> : null}

        <PasswordInput
          id="password"
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          helperText="Use at least 8 characters. Avoid reusing passwords from other sites."
          disabled={submitDisabled}
        />

        <PasswordInput
          id="confirm-password"
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          disabled={submitDisabled}
        />

        {errorMessage && (
          <ErrorMessage
            title={authErrorTitle(errorMessage, "Password update failed")}
            message={errorMessage}
          />
        )}

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
          <Button type="submit" className="h-10 rounded-xl px-5" disabled={submitDisabled}>
            {submitLabel}
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-10 rounded-xl">
            <Link href={forgotHref}>Request a new link</Link>
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
