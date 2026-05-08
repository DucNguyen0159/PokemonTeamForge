"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { Button } from "@/components/ui/button";
import {
  useDeleteTeamMutation,
  useLoadTeamMutation,
  useRenameTeamMutation,
  useUserTeams,
} from "@/hooks/queries/use-user-teams";
import { savePendingLoadedTeam } from "@/lib/team/pending-team";
import { useAuthStore } from "@/store/auth-store";

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const teamsQuery = useUserTeams();
  const loadTeamMutation = useLoadTeamMutation();
  const deleteTeamMutation = useDeleteTeamMutation();
  const renameTeamMutation = useRenameTeamMutation();

  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);

  async function handleLoadTeam(teamId: string) {
    setFeedback(null);
    setError(null);

    try {
      const loadedTeam = await loadTeamMutation.mutateAsync(teamId);
      savePendingLoadedTeam(loadedTeam);
      setFeedback("Team loaded. Redirecting to builder...");
      router.push("/builder");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load this team right now.",
      );
    }
  }

  async function handleDeleteTeam(teamId: string) {
    setFeedback(null);
    setError(null);

    try {
      await deleteTeamMutation.mutateAsync(teamId);
      setFeedback("Saved team deleted.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete this team right now.",
      );
    }
  }

  async function handleRenameTeam(teamId: string) {
    setFeedback(null);
    setError(null);

    if (!draftName.trim()) {
      setError("Team name cannot be empty.");
      return;
    }

    try {
      await renameTeamMutation.mutateAsync({ teamId, name: draftName });
      setEditingTeamId(null);
      setDraftName("");
      setFeedback("Team name updated.");
    } catch (renameError) {
      setError(
        renameError instanceof Error
          ? renameError.message
          : "Unable to rename this team right now.",
      );
    }
  }

  if (!isAuthenticated) {
    return (
      <PlaceholderPage
        eyebrow="Profile"
        title="Saved teams & account"
        description="Sign in to manage Supabase saved teams. Guest mode still includes Team Builder, recommendations, coverage analysis, import/export, and local autosave."
      >
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-xl">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-xl">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </PlaceholderPage>
    );
  }

  return (
    <PlaceholderPage
      eyebrow="Profile"
      title="Saved teams & account"
      description="Manage your account and Supabase saved teams."
    >
      <div className="w-full max-w-3xl space-y-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4">
          <p className="text-sm font-medium text-foreground">
            {profile?.username || user?.email || "Trainer"}
          </p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 rounded-xl"
            onClick={() => {
              void logout();
            }}
          >
            Log out
          </Button>
        </div>

        {(feedback || error) && (
          <p
            className={
              feedback
                ? "rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200"
                : "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground"
            }
          >
            {feedback ?? error}
          </p>
        )}

        <div className="rounded-xl border border-border/60 bg-card/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Saved teams</h2>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl"
              onClick={() => {
                void teamsQuery.refetch();
              }}
            >
              Refresh
            </Button>
          </div>

          {teamsQuery.isLoading ? (
            <p className="text-xs text-muted-foreground">Loading your saved teams...</p>
          ) : teamsQuery.isError ? (
            <p className="text-xs text-destructive-foreground">
              {teamsQuery.error instanceof Error
                ? teamsQuery.error.message
                : "Unable to load your saved teams."}
            </p>
          ) : teams.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No saved teams yet. Build a team and click Save in the Team Builder.
            </p>
          ) : (
            <div className="space-y-2">
              {teams.map((team) => {
                const isEditing = editingTeamId === team.id;
                return (
                  <div
                    key={team.id}
                    className="rounded-xl border border-border/60 bg-background/40 p-3"
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          value={draftName}
                          onChange={(event) => setDraftName(event.target.value)}
                          className="w-full rounded-lg border border-border/60 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Team name"
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="rounded-xl"
                            onClick={() => {
                              void handleRenameTeam(team.id);
                            }}
                          >
                            Save name
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-xl"
                            onClick={() => {
                              setEditingTeamId(null);
                              setDraftName("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-foreground">{team.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {team.format} - Updated {new Date(team.updatedAt).toLocaleString()}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="rounded-xl"
                            onClick={() => {
                              void handleLoadTeam(team.id);
                            }}
                            disabled={loadTeamMutation.isPending}
                          >
                            Load in Builder
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => {
                              setEditingTeamId(team.id);
                              setDraftName(team.name);
                            }}
                          >
                            Rename
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-xl"
                            onClick={() => {
                              void handleDeleteTeam(team.id);
                            }}
                            disabled={deleteTeamMutation.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PlaceholderPage>
  );
}
