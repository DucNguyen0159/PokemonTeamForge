"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Cloud, Loader2, LogOut, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";

import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { ErrorMessage } from "@/components/error/error-message";
import { Button } from "@/components/ui/button";
import {
  useDeleteTeamMutation,
  useLoadTeamMutation,
  useRenameTeamMutation,
  useUserTeams,
} from "@/hooks/queries/use-user-teams";
import { savePendingLoadedTeam } from "@/lib/team/pending-team";
import { useAuthStore } from "@/store/auth-store";

function formatUpdatedAt(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "recently";
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [confirmingLoadTeamId, setConfirmingLoadTeamId] = useState<string | null>(null);
  const [confirmingDeleteTeamId, setConfirmingDeleteTeamId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const teamsQuery = useUserTeams();
  const loadTeamMutation = useLoadTeamMutation();
  const deleteTeamMutation = useDeleteTeamMutation();
  const renameTeamMutation = useRenameTeamMutation();

  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);

  async function handleLogout() {
    setFeedback(null);
    setError(null);

    const result = await logout();
    if (!result.success) {
      setError(result.message ?? "Unable to log out right now. Please try again.");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  async function handleLoadTeam(teamId: string) {
    setFeedback(null);
    setError(null);
    setConfirmingLoadTeamId(null);

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
    setConfirmingDeleteTeamId(null);

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
      setConfirmingLoadTeamId(null);
      setConfirmingDeleteTeamId(null);
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
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Profile
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Account Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Manage your account, cloud sync status, and Supabase saved teams.
              Guest tools remain available after logout.
            </p>
          </div>
          <Button asChild variant="secondary" className="w-fit rounded-xl">
            <Link href="/builder">Open Builder</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <aside className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/55 shadow-sm">
            <div className="border-b border-border/50 bg-background/25 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Signed In
                  </p>
                  <h2 className="mt-2 break-words text-xl font-semibold text-foreground">
                    {profile?.username || user?.email || "Trainer"}
                  </h2>
                  <p className="mt-1 break-all text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Active
                </span>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Cloud className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Cloud sync enabled</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Saved teams are tied to this Supabase account. Your local guest builder
                      data stays editable separately.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl"
                onClick={() => {
                  void handleLogout();
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="size-3.5" aria-hidden />
                    Log out
                  </>
                )}
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card/45 p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-400/10 text-sky-300">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Guest and local teams</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  If you build as a guest, PokemonTeamForge keeps that team locally. After
                  signing in, you can save local work as a new cloud team without overwriting
                  existing saved teams.
                </p>
              </div>
            </div>
          </section>
        </aside>

        <section className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Cloud Teams
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">Saved teams</h2>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="w-fit rounded-xl"
              onClick={() => {
                void teamsQuery.refetch();
              }}
              disabled={teamsQuery.isRefetching}
            >
              <RefreshCw className={teamsQuery.isRefetching ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden />
              Refresh
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {feedback ? (
              <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                {feedback}
              </p>
            ) : null}
            {error ? <ErrorMessage title="Action unavailable" message={error} /> : null}

            {teamsQuery.isLoading ? (
              <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-background/35 px-4 py-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Loading your saved teams...
              </div>
            ) : teamsQuery.isError ? (
              <ErrorMessage
                title="We couldn't load saved teams"
                message={
                  teamsQuery.error instanceof Error
                    ? teamsQuery.error.message
                    : "Check your connection or try again."
                }
                onRetry={() => {
                  void teamsQuery.refetch();
                }}
                isRetrying={teamsQuery.isRefetching}
                className="rounded-2xl"
              />
            ) : teams.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-background/25 px-4 py-10 text-center">
                <p className="text-sm font-semibold text-foreground">No saved teams yet.</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Build a team, then click Save Team in the Builder to store it in your account.
                </p>
                <Button asChild className="mt-4 rounded-xl">
                  <Link href="/builder">Build a Team</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {teams.map((team) => {
                  const isEditing = editingTeamId === team.id;
                  const isConfirmingLoad = confirmingLoadTeamId === team.id;
                  const isConfirmingDelete = confirmingDeleteTeamId === team.id;
                  return (
                    <article
                      key={team.id}
                      className="rounded-2xl border border-border/55 bg-background/35 p-4"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-muted-foreground">
                              Team name
                            </span>
                            <input
                              value={draftName}
                              onChange={(event) => setDraftName(event.target.value)}
                              className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              placeholder="Team name"
                            />
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="rounded-xl"
                              onClick={() => {
                                void handleRenameTeam(team.id);
                              }}
                              disabled={renameTeamMutation.isPending}
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
                        <div className="space-y-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="truncate text-base font-semibold text-foreground">
                                {team.name}
                              </p>
                              <p className="mt-1 text-xs capitalize text-muted-foreground">
                                {team.format} format · Updated {formatUpdatedAt(team.updatedAt)}
                              </p>
                              <span className="mt-2 inline-flex rounded-full border border-border/45 bg-card/45 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {team.isPublic ? "Public" : "Private"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:justify-end">
                              <Button
                                size="sm"
                                className="rounded-xl"
                                onClick={() => {
                                  setConfirmingLoadTeamId(team.id);
                                  setConfirmingDeleteTeamId(null);
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
                                  setConfirmingLoadTeamId(null);
                                  setConfirmingDeleteTeamId(null);
                                }}
                              >
                                Rename
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-xl"
                                onClick={() => {
                                  setConfirmingDeleteTeamId(team.id);
                                  setConfirmingLoadTeamId(null);
                                }}
                                disabled={deleteTeamMutation.isPending}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>

                          {isConfirmingLoad ? (
                            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3">
                              <p className="text-xs leading-relaxed text-amber-100">
                                Loading this team will replace the current Builder team. If your
                                current Builder team is unsaved, save it first or continue only if
                                you are ready to switch.
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
                                  {loadTeamMutation.isPending ? "Loading..." : "Confirm Load"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="rounded-xl"
                                  onClick={() => setConfirmingLoadTeamId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : null}

                          {isConfirmingDelete ? (
                            <div className="rounded-xl border border-destructive/35 bg-destructive/10 p-3">
                              <p className="text-xs leading-relaxed text-destructive-foreground">
                                Delete this saved team from your account? This does not clear your
                                current local Builder team, but the cloud copy cannot be restored.
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="rounded-xl"
                                  onClick={() => {
                                    void handleDeleteTeam(team.id);
                                  }}
                                  disabled={deleteTeamMutation.isPending}
                                >
                                  {deleteTeamMutation.isPending ? "Deleting..." : "Confirm Delete"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="rounded-xl"
                                  onClick={() => setConfirmingDeleteTeamId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
