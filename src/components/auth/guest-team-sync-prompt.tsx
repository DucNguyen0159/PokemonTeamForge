"use client";

import { useMemo, useState } from "react";
import { CloudUpload, Loader2, X } from "lucide-react";

import { useSaveTeamMutation } from "@/hooks/queries/use-user-teams";
import {
  getGuestTeamSyncSummary,
  guestTeamSyncDismissKey,
  hasMeaningfulGuestTeam,
} from "@/lib/team/guest-team-sync";
import { useAuthStore } from "@/store/auth-store";
import { useTeamStore } from "@/store/team-store";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/error/error-message";

export function GuestTeamSyncPrompt() {
  const team = useTeamStore((state) => state.team);
  const loadTeam = useTeamStore((state) => state.loadTeam);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const saveTeamMutation = useSaveTeamMutation();
  const userId = user?.id ?? null;

  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const dismissKey = useMemo(
    () => (userId ? guestTeamSyncDismissKey(userId, team) : null),
    [team, userId],
  );
  const summary = useMemo(() => getGuestTeamSyncSummary(team), [team]);
  const isDismissed =
    Boolean(dismissKey && dismissedKeys.has(dismissKey)) ||
    Boolean(
      dismissKey &&
        typeof window !== "undefined" &&
        window.localStorage.getItem(dismissKey) === "true",
    );
  const shouldOfferSync =
    isInitialized &&
    isAuthenticated &&
    Boolean(userId) &&
    hasMeaningfulGuestTeam(team) &&
    !isDismissed &&
    !feedback;

  if (!shouldOfferSync) {
    return null;
  }

  function dismiss() {
    if (dismissKey && typeof window !== "undefined") {
      window.localStorage.setItem(dismissKey, "true");
      setDismissedKeys((current) => new Set(current).add(dismissKey));
    }
    setError(null);
  }

  async function saveGuestTeam() {
    setError(null);
    try {
      const saved = await saveTeamMutation.mutateAsync({
        ...team,
        id: undefined,
        userId: undefined,
      });
      loadTeam({
        ...team,
        id: saved.id,
        userId,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
        isPublic: saved.isPublic,
      });
      setFeedback("Guest team saved to your account.");
      dismiss();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save this guest team right now.",
      );
    }
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-primary/25 bg-card/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-sm sm:bottom-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CloudUpload className="size-4" aria-hidden />
        </span>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Save your guest team to this account?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                We found a local guest team with {summary.pokemonCount} Pokémon
                {summary.moveCount > 0 ? ` and ${summary.moveCount} selected moves` : ""}.
                Saving creates a new cloud team and will not overwrite existing saved teams.
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Dismiss guest team sync prompt"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          {error ? <ErrorMessage title="Could not save guest team" message={error} /> : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              size="sm"
              className="rounded-xl"
              onClick={saveGuestTeam}
              disabled={saveTeamMutation.isPending}
            >
              {saveTeamMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Saving...
                </>
              ) : (
                "Save as New Team"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl text-muted-foreground"
              onClick={dismiss}
              disabled={saveTeamMutation.isPending}
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
