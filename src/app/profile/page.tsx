"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Cloud, KeyRound, Loader2, LogOut, RefreshCw, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";

import { ProfileChangePasswordPanel } from "@/components/profile/profile-change-password-panel";
import { ProfileDeleteAccountPanel } from "@/components/profile/profile-delete-account-panel";
import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { ErrorMessage } from "@/components/error/error-message";
import { PageIntro, PageIntroChip } from "@/components/layout/page-intro";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { Button } from "@/components/ui/button";
import { getSavedTeamsLoadingState } from "@/hooks/queries/user-teams-query";
import {
  useDeleteTeamMutation,
  useLoadTeamMutation,
  useRenameTeamMutation,
  useUserTeams,
} from "@/hooks/queries/use-user-teams";
import { useResilientLogout } from "@/hooks/use-resilient-logout";
import { savePendingLoadedTeam } from "@/lib/team/pending-team";
import {
  getLocalTeamSafetySummary,
  shouldWarnBeforeCloudLoad,
} from "@/lib/team/local-team-safety";
import {
  filterAndSortSavedTeams,
  type SavedTeamFormatFilter,
  type SavedTeamSortOption,
} from "@/lib/team/saved-team-filters";
import { selectIsSessionReady, useAuthStore } from "@/store/auth-store";
import { useTeamStore } from "@/store/team-store";
import { cn } from "@/utils";

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

function formatTeamCount(count: number): string {
  return `${count} saved ${count === 1 ? "team" : "teams"}`;
}

function formatFilledSlots(count: number): string {
  return `${count}/6 ${count === 1 ? "slot" : "slots"} filled`;
}

const PROFILE_FEEDBACK_DISMISS_MS = 5000;

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSessionReady = useAuthStore(selectIsSessionReady);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const { isLoggingOut, logoutButtonLabel, logoutMessage, runLogout } = useResilientLogout();
  const currentTeam = useTeamStore((state) => state.team);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [confirmingLoadTeamId, setConfirmingLoadTeamId] = useState<string | null>(null);
  const [confirmingDeleteTeamId, setConfirmingDeleteTeamId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState<SavedTeamFormatFilter>("all");
  const [sortOption, setSortOption] = useState<SavedTeamSortOption>("recent");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const teamsQuery = useUserTeams();
  const loadTeamMutation = useLoadTeamMutation();
  const deleteTeamMutation = useDeleteTeamMutation();
  const renameTeamMutation = useRenameTeamMutation();

  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);
  const savedTeamsLoading = useMemo(
    () =>
      getSavedTeamsLoadingState({
        isAuthenticated,
        isSessionReady,
        isPending: teamsQuery.isPending,
        isFetching: teamsQuery.isFetching,
        hasCachedTeams: teamsQuery.data !== undefined,
      }),
    [
      isAuthenticated,
      isSessionReady,
      teamsQuery.data,
      teamsQuery.isFetching,
      teamsQuery.isPending,
    ],
  );
  const visibleTeams = useMemo(
    () =>
      filterAndSortSavedTeams(teams, {
        search: teamSearch,
        format: formatFilter,
        sort: sortOption,
      }),
    [formatFilter, sortOption, teamSearch, teams],
  );
  const hasTeamFilters = Boolean(teamSearch.trim() || formatFilter !== "all");
  const localTeamSummary = useMemo(
    () => getLocalTeamSafetySummary(currentTeam),
    [currentTeam],
  );

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, PROFILE_FEEDBACK_DISMISS_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  async function handleLogout() {
    setFeedback(null);
    setError(null);
    setIsChangingPassword(false);
    await runLogout();
  }

  function handlePasswordChangeSuccess(message: string) {
    setError(null);
    setFeedback(message);
    setIsChangingPassword(false);
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
      <PageIntro
        eyebrow="Profile"
        title="Account Dashboard"
        description="Manage your account, cloud sync status, and Supabase saved teams. Guest tools remain available after logout."
        actions={
          <Button asChild variant="secondary" className="w-fit rounded-xl">
            <Link href="/builder">Open Builder</Link>
          </Button>
        }
        chips={
          <>
            <PageIntroChip>{teamsQuery.isSuccess ? formatTeamCount(teams.length) : "Cloud teams"}</PageIntroChip>
            <PageIntroChip>{localTeamSummary.pokemonCount}/6 Builder Pokémon</PageIntroChip>
            <PageIntroChip>{profile?.username || user?.email || "Signed in"}</PageIntroChip>
          </>
        }
      />

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
                  setIsChangingPassword((current) => !current);
                }}
                disabled={isLoggingOut}
                aria-expanded={isChangingPassword}
                aria-controls="profile-change-password-panel"
              >
                <KeyRound className="size-3.5" aria-hidden />
                Change password
              </Button>

              {isChangingPassword ? (
                <div id="profile-change-password-panel">
                  <ProfileChangePasswordPanel
                    disabled={isLoggingOut}
                    onCancel={() => setIsChangingPassword(false)}
                    onSuccess={handlePasswordChangeSuccess}
                  />
                </div>
              ) : null}

              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl"
                onClick={() => {
                  void handleLogout();
                }}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    {logoutButtonLabel}
                  </>
                ) : (
                  <>
                    <LogOut className="size-3.5" aria-hidden />
                    Log out
                  </>
                )}
              </Button>
              {logoutMessage ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {logoutMessage}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-destructive/30 bg-card/45 p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <TriangleAlert className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-foreground">Danger zone</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Permanently delete your account and all saved cloud teams. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-4">
              {isDeletingAccount ? (
                <ProfileDeleteAccountPanel
                  disabled={isLoggingOut}
                  onCancel={() => setIsDeletingAccount(false)}
                />
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full rounded-xl"
                  onClick={() => {
                    setIsDeletingAccount(true);
                    setIsChangingPassword(false);
                  }}
                  disabled={isLoggingOut}
                >
                  Delete account
                </Button>
              )}
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
                  Your Builder currently has {localTeamSummary.pokemonCount}/6 Pokémon
                  {localTeamSummary.moveCount > 0 ? ` and ${localTeamSummary.moveCount} moves` : ""}.
                  Loading a different cloud team will ask for confirmation before replacing it.
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground/75">
                  {localTeamSummary.isCloudTeam
                    ? "Current Builder team is linked to a cloud copy."
                    : "Current Builder work is local until you save it as a cloud team."}
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
              <p className="mt-1 text-xs text-muted-foreground">
                {savedTeamsLoading.isPreparingCloudSync
                  ? "Preparing cloud sync..."
                  : savedTeamsLoading.showInitialSkeleton
                    ? "Loading saved team summaries..."
                    : savedTeamsLoading.isRefreshingTeams
                      ? "Updating saved teams..."
                      : teamsQuery.isSuccess
                        ? hasTeamFilters
                          ? `${visibleTeams.length} of ${formatTeamCount(teams.length)} shown`
                          : formatTeamCount(teams.length)
                        : "Cloud copies available after saved-team sync loads"}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="w-fit rounded-xl"
              onClick={() => {
                void teamsQuery.refetch();
              }}
              disabled={teamsQuery.isRefetching || savedTeamsLoading.isPreparingCloudSync}
            >
              <RefreshCw
                className={
                  teamsQuery.isRefetching || savedTeamsLoading.isRefreshingTeams
                    ? "size-3.5 animate-spin"
                    : "size-3.5"
                }
                aria-hidden
              />
              Refresh
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {feedback ? (
              <p
                role="status"
                aria-live="polite"
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200"
              >
                {feedback}
              </p>
            ) : null}
            {error ? <ErrorMessage title="Action unavailable" message={error} /> : null}

            {savedTeamsLoading.showInitialSkeleton || savedTeamsLoading.isPreparingCloudSync ? (
              <div className="space-y-3">
                {[0, 1].map((index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-border/50 bg-background/35 p-4"
                  >
                    <div className="flex animate-pulse flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-44 rounded-full bg-muted/60" />
                        <div className="h-3 w-64 max-w-full rounded-full bg-muted/40" />
                        <div className="flex gap-1.5">
                          {Array.from({ length: 6 }).map((_, slot) => (
                            <div key={slot} className="size-8 rounded-xl bg-muted/35" />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 w-24 rounded-xl bg-muted/45" />
                        <div className="h-8 w-16 rounded-xl bg-muted/35" />
                      </div>
                    </div>
                  </div>
                ))}
                <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  {savedTeamsLoading.isPreparingCloudSync
                    ? "Preparing cloud sync..."
                    : "Loading saved team summaries..."}
                </p>
              </div>
            ) : teamsQuery.isError ? (
              <ErrorMessage
                title="Saved teams couldn't load"
                message={
                  teamsQuery.error instanceof Error
                    ? teamsQuery.error.message
                    : "Check your Supabase connection, auth session, or saved-team database setup."
                }
                onRetry={() => {
                  void teamsQuery.refetch();
                }}
                isRetrying={teamsQuery.isRefetching}
                className="rounded-2xl"
              />
            ) : teams.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-background/25 px-4 py-10 text-center">
                <p className="text-sm font-semibold text-foreground">No cloud teams yet.</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Build a team, then use Save Team in the Builder to create your first Supabase
                  cloud copy. Local guest work stays separate until you save it.
                </p>
                <Button asChild className="mt-4 rounded-xl">
                  <Link href="/builder">Build a Team</Link>
                </Button>
              </div>
            ) : (
              <>
                {savedTeamsLoading.isRefreshingTeams ? (
                  <p className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-background/35 px-3 py-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    Updating saved teams...
                  </p>
                ) : null}
                <div className="grid gap-2 rounded-2xl border border-border/45 bg-background/25 p-3 md:grid-cols-[minmax(0,1fr)_10rem_10rem]">
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Search
                    </span>
                    <input
                      value={teamSearch}
                      onChange={(event) => setTeamSearch(event.target.value)}
                      placeholder="Team or Pokémon name..."
                      className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Format
                    </span>
                    <select
                      value={formatFilter}
                      onChange={(event) =>
                        setFormatFilter(event.target.value as SavedTeamFormatFilter)
                      }
                      className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="all">All formats</option>
                      <option value="singles">Singles</option>
                      <option value="doubles">Doubles</option>
                      <option value="triples">Triples</option>
                    </select>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Sort
                    </span>
                    <select
                      value={sortOption}
                      onChange={(event) =>
                        setSortOption(event.target.value as SavedTeamSortOption)
                      }
                      className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="recent">Recently updated</option>
                      <option value="oldest">Oldest updated</option>
                      <option value="name">Name A-Z</option>
                      <option value="filled">Most complete</option>
                    </select>
                  </label>
                  {hasTeamFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTeamSearch("");
                        setFormatFilter("all");
                      }}
                      className="text-left text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:col-span-3"
                    >
                      Clear saved-team filters
                    </button>
                  ) : null}
                </div>

                {visibleTeams.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-background/25 px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-foreground">
                      No saved teams match these filters.
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                      Try a different team name, Pokémon name, or format.
                    </p>
                  </div>
                ) : (
                  <div
                    className={cn("grid gap-3", savedTeamsLoading.isRefreshingTeams && "opacity-80")}
                  >
                    {visibleTeams.map((team) => {
                      const isEditing = editingTeamId === team.id;
                      const isConfirmingLoad = confirmingLoadTeamId === team.id;
                      const isConfirmingDelete = confirmingDeleteTeamId === team.id;
                      const warnsBeforeLoad = shouldWarnBeforeCloudLoad(currentTeam, team.id);
                      return (
                        <article
                          key={team.id}
                          className="overflow-hidden rounded-2xl border border-border/55 bg-background/35 shadow-sm"
                        >
                          {isEditing ? (
                            <div className="space-y-3 p-4">
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
                            <div className="space-y-3 p-4">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate text-base font-semibold text-foreground">
                                      {team.name}
                                    </p>
                                    <span className="inline-flex rounded-full border border-border/45 bg-card/45 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                      {team.isPublic ? "Public" : "Private"}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs capitalize text-muted-foreground">
                                    <span>{team.format} format</span>
                                    <span>{formatFilledSlots(team.filledSlotCount)}</span>
                                    <span>Updated {formatUpdatedAt(team.updatedAt)}</span>
                                  </div>
                                  <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
                                    {Array.from({ length: 6 }).map((_, index) => {
                                      const slot = index + 1;
                                      const pokemon = team.pokemonPreviews.find(
                                        (preview) => preview.slot === slot,
                                      );

                                      return (
                                        <span
                                          key={slot}
                                          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/45 bg-card/45"
                                          title={pokemon?.name ?? `Empty slot ${slot}`}
                                        >
                                          {pokemon ? (
                                            <PokemonSprite
                                              src={pokemon.spriteNormal}
                                              alt={pokemon.name}
                                              size={32}
                                              className="h-full w-full object-contain p-1"
                                            />
                                          ) : (
                                            <span className="text-[10px] font-medium text-muted-foreground/60">
                                              {slot}
                                            </span>
                                          )}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                                  <Button
                                    size="sm"
                                    className="col-span-2 rounded-xl sm:col-auto"
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
                                    className="rounded-xl sm:ml-auto"
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
                                    {warnsBeforeLoad
                                      ? `Your current Builder team has ${localTeamSummary.pokemonCount}/6 Pokémon${localTeamSummary.moveCount > 0 ? ` and ${localTeamSummary.moveCount} selected moves` : ""}. Loading this cloud team will replace the Builder workspace. Save the current team first if you want to keep it.`
                                      : "This cloud team will be opened in Builder. Your current Builder workspace does not have separate unsaved team content at risk."}
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
                                      {loadTeamMutation.isPending
                                        ? "Loading..."
                                        : warnsBeforeLoad
                                          ? "Replace Builder Team"
                                          : "Open in Builder"}
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
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
