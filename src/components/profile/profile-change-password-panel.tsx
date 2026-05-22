"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

import { PasswordInput } from "@/components/auth/auth-layout";
import { ErrorMessage } from "@/components/error/error-message";
import { Button } from "@/components/ui/button";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/auth-constants";
import { authErrorTitle } from "@/lib/auth/auth-utils";
import { useAuthStore } from "@/store/auth-store";

type ProfileChangePasswordPanelProps = {
  disabled?: boolean;
  onCancel: () => void;
  onSuccess: (message: string) => void;
};

export function ProfileChangePasswordPanel({
  disabled = false,
  onCancel,
  onSuccess,
}: ProfileChangePasswordPanelProps) {
  const changePassword = useAuthStore((state) => state.changePassword);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleCancel() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setFormError(null);
    onCancel();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (disabled || isSubmitting) {
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormError("Enter your current password and a new password twice.");
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setFormError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setFormError("Choose a new password that is different from your current one.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (!result.success) {
        setFormError(result.message ?? "Unable to change your password right now.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess(result.message ?? "Password updated.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitDisabled = disabled || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-border/60 bg-background/25 p-4"
      aria-label="Change password"
    >
      <p className="text-xs leading-relaxed text-muted-foreground">
        Confirm your current password, then choose a new one. You will stay signed in on this
        device.
      </p>

      <PasswordInput
        id="profile-current-password"
        label="Current password"
        value={currentPassword}
        onChange={setCurrentPassword}
        autoComplete="current-password"
        placeholder="Your current password"
        disabled={submitDisabled}
      />

      <PasswordInput
        id="profile-new-password"
        label="New password"
        value={newPassword}
        onChange={setNewPassword}
        autoComplete="new-password"
        placeholder="At least 8 characters"
        helperText={`Use at least ${MIN_PASSWORD_LENGTH} characters.`}
        disabled={submitDisabled}
      />

      <PasswordInput
        id="profile-confirm-password"
        label="Confirm new password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        placeholder="Re-enter your new password"
        disabled={submitDisabled}
      />

      {formError ? (
        <ErrorMessage
          title={authErrorTitle(formError, "Password change failed")}
          message={formError}
        />
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" size="sm" className="rounded-xl" disabled={submitDisabled}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Updating password...
            </>
          ) : (
            "Update password"
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-xl"
          onClick={handleCancel}
          disabled={submitDisabled}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
