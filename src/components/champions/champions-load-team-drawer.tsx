"use client";

import { useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLoadChampionsTeamMutation } from "@/hooks/queries/use-champions-teams";
import { useUserTeams } from "@/hooks/queries/use-user-teams";
import { hasMeaningfulChampionsTeam } from "@/lib/champions/active-team-snapshot";
import { useChampionsTeamStore } from "@/store/champions-team-store";
import { cn } from "@/utils";

type LoadTab = "your-teams" | "by-id";

export function ChampionsLoadTeamDrawer({
  open,
  onClose,
  onLoaded,
}: {
  open: boolean;
  onClose: () => void;
  onLoaded?: () => void;
}) {
  const team = useChampionsTeamStore((state) => state.team);
  const loadTeam = useChampionsTeamStore((state) => state.loadTeam);
  const setSourcePreset = useChampionsTeamStore((state) => state.setSourcePreset);
  const loadMutation = useLoadChampionsTeamMutation();
  const teamsQuery = useUserTeams();
  const [tab, setTab] = useState<LoadTab>("your-teams");
  const [teamIdInput, setTeamIdInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmOverwrite, setConfirmOverwrite] = useState<string | null>(null);

  const championsTeams = useMemo(
    () => (teamsQuery.data ?? []).filter((entry) => entry.mode === "champions"),
    [teamsQuery.data],
  );

  async function loadById(teamId: string) {
    setError(null);
    try {
      const loaded = await loadMutation.mutateAsync(teamId.trim());
      loadTeam(loaded);
      setSourcePreset(null);
      setConfirmOverwrite(null);
      onLoaded?.();
      onClose();
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Champions team.");
    }
  }

  function requestLoad(teamId: string) {
    if (hasMeaningfulChampionsTeam(team) && team.id !== teamId) {
      setConfirmOverwrite(teamId);
      return;
    }
    void loadById(teamId);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        aria-label="Close load team drawer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="load-team-title"
        className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border/60 bg-card p-4 shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 id="load-team-title" className="text-base font-semibold text-foreground">
              Load Champions Team
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Replace your current local draft with a saved cloud team.
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="mt-4 flex gap-2">
          {(["your-teams", "by-id"] as LoadTab[]).map((entry) => (
            <button
              key={entry}
              type="button"
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                tab === entry
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground",
              )}
              onClick={() => setTab(entry)}
            >
              {entry === "your-teams" ? "Your teams" : "By ID"}
            </button>
          ))}
        </div>

        {confirmOverwrite ? (
          <div className="mt-4 rounded-xl border border-amber-500/35 bg-amber-500/10 p-3">
            <p className="text-sm text-amber-100">
              Loading will replace your current Champions draft. Continue?
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                onClick={() => void loadById(confirmOverwrite)}
                disabled={loadMutation.isPending}
              >
                {loadMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : null}
                Replace draft
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmOverwrite(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-xl border border-destructive/35 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        {tab === "your-teams" ? (
          <div className="mt-4 space-y-2">
            {teamsQuery.isPending ? (
              <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Loading your teams...
              </div>
            ) : championsTeams.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/60 px-3 py-6 text-center text-sm text-muted-foreground">
                No saved Champions teams yet. Save from Team Builder first.
              </p>
            ) : (
              championsTeams.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/55 bg-background/40 px-3 py-2 text-left hover:bg-background/60"
                  onClick={() => requestLoad(entry.id)}
                  disabled={loadMutation.isPending}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{entry.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {entry.filledSlotCount}/6 slots · {entry.formatSupport ?? entry.format}
                    </p>
                  </div>
                  <span className="text-xs text-primary">Load</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">Cloud team ID</span>
              <input
                value={teamIdInput}
                onChange={(event) => setTeamIdInput(event.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
                placeholder="Paste team UUID..."
              />
            </label>
            <Button
              size="sm"
              disabled={!teamIdInput.trim() || loadMutation.isPending}
              onClick={() => requestLoad(teamIdInput.trim())}
            >
              {loadMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : null}
              Load team
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
