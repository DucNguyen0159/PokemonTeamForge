"use client";

import { useState } from "react";

import { hasMeaningfulChampionsTeam } from "@/lib/champions/active-team-snapshot";
import { useChampionsTeamStore } from "@/store/champions-team-store";

export function useConfirmReplaceDraft() {
  const team = useChampionsTeamStore((state) => state.team);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  function requestReplace(action: () => void) {
    if (hasMeaningfulChampionsTeam(team)) {
      setPendingAction(() => action);
      return;
    }
    action();
  }

  function confirmReplace() {
    pendingAction?.();
    setPendingAction(null);
  }

  function cancelReplace() {
    setPendingAction(null);
  }

  return {
    needsConfirm: pendingAction !== null,
    requestReplace,
    confirmReplace,
    cancelReplace,
  };
}

export function ChampionsReplaceDraftDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-background/70" aria-label="Close" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/60 bg-card p-5 shadow-xl">
        <h3 className="text-base font-semibold text-foreground">Replace active team?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your current draft has roster or plan changes. Loading will replace the active team.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-background/50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            onClick={onConfirm}
          >
            Replace team
          </button>
        </div>
      </div>
    </div>
  );
}
