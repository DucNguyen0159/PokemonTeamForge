"use client";

import { FormEvent, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { ErrorMessage } from "@/components/error/error-message";
import { Button } from "@/components/ui/button";
import { DELETE_ACCOUNT_CONFIRMATION_PHRASE } from "@/lib/auth/auth-constants";
import { USER_TEAMS_QUERY_KEY } from "@/hooks/queries/user-teams-query";
import { useAuthStore } from "@/store/auth-store";

type ProfileDeleteAccountPanelProps = {
  disabled?: boolean;
  onCancel: () => void;
};

export function ProfileDeleteAccountPanel({
  disabled = false,
  onCancel,
}: ProfileDeleteAccountPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const deleteAccount = useAuthStore((state) => state.deleteAccount);

  const [confirmation, setConfirmation] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmationMatches =
    confirmation.trim() === DELETE_ACCOUNT_CONFIRMATION_PHRASE;

  function handleCancel() {
    setConfirmation("");
    setFormError(null);
    onCancel();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!confirmationMatches) {
      setFormError(`Type ${DELETE_ACCOUNT_CONFIRMATION_PHRASE} to confirm account deletion.`);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await queryClient.cancelQueries({ queryKey: USER_TEAMS_QUERY_KEY });
      const result = await deleteAccount();

      if (!result.success) {
        setFormError(result.message ?? "Unable to delete your account right now.");
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: USER_TEAMS_QUERY_KEY,
        refetchType: "none",
      });
      router.replace("/");
    } catch {
      setFormError("Unable to delete your account right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isBusy = disabled || isSubmitting;

  return (
    <form
      className="rounded-2xl border border-destructive/35 bg-destructive/10 p-4"
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <TriangleAlert className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-destructive-foreground">Delete account permanently</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            This removes your Supabase account, profile, and saved cloud teams. Local guest Builder data on
            this device is not uploaded and will stay until you clear browser storage.
          </p>
        </div>
      </div>

      <label className="mt-4 block text-xs font-medium text-foreground" htmlFor="delete-account-confirm">
        Type {DELETE_ACCOUNT_CONFIRMATION_PHRASE} to confirm
      </label>
      <input
        id="delete-account-confirm"
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        disabled={isBusy}
        className="mt-2 w-full rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm text-foreground outline-none ring-primary/40 transition focus-visible:ring-2"
        placeholder={DELETE_ACCOUNT_CONFIRMATION_PHRASE}
      />

      {formError ? (
        <div className="mt-3">
          <ErrorMessage title="Account deletion failed" message={formError} />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          className="rounded-xl"
          disabled={isBusy || !confirmationMatches}
        >
          {isBusy ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Deleting account...
            </>
          ) : (
            "Delete my account"
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-xl"
          onClick={handleCancel}
          disabled={isBusy}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
