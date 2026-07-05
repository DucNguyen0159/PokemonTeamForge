"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertCircle, Users } from "lucide-react";

import { ChampionsCommunityTeamCard } from "@/components/champions/champions-community-team-card";
import { ChampionsShell } from "@/components/champions/champions-shell";
import { ChampionsCommunityPreviewDrawer } from "@/components/champions/shared/champions-community-preview-drawer";
import {
  ChampionsReplaceDraftDialog,
  useConfirmReplaceDraft,
} from "@/components/champions/shared/champions-replace-draft-dialog";
import { ChampionsCommunitySkeletonGrid } from "@/components/champions/shared/champions-community-skeleton-grid";
import { ChampionsEmptyState } from "@/components/champions/shared/champions-empty-state";
import { ChampionsFilterChips } from "@/components/champions/shared/champions-filter-chips";
import { PageIntroChip } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { communityFormatSupportLabel } from "@/lib/champions/community-ui";
import {
  useChampionsCommunityList,
  useForkCommunityTeamMutation,
} from "@/hooks/queries/use-champions-community";
import { savePendingLoadedChampionsTeam } from "@/lib/team/pending-champions-team";
import { useAuthStore } from "@/store/auth-store";
import type { ChampionsCommunityTeamSummary } from "@/types/champions-community";

type FormatFilter = "all" | "single" | "double" | "both";
type SortFilter = "highest" | "newest";

const SORT_OPTIONS: Array<{ value: SortFilter; label: string }> = [
  { value: "highest", label: "Highest rated" },
  { value: "newest", label: "Newest" },
];

const FORMAT_OPTIONS: Array<{ value: FormatFilter; label: string }> = [
  { value: "all", label: "All formats" },
  { value: "single", label: "Singles 3v3" },
  { value: "double", label: "Doubles 4v4" },
  { value: "both", label: "Both" },
];

const PAGE_SIZE = 24;

export function ChampionsCommunityExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sort = (searchParams.get("sort") as SortFilter) || "highest";
  const format = (searchParams.get("format") as FormatFilter) || "all";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTeam, setPreviewTeam] = useState<ChampionsCommunityTeamSummary | null>(null);
  const [previewFocus, setPreviewFocus] = useState<"roster" | "comments">("roster");
  const [forkingTeamId, setForkingTeamId] = useState<string | null>(null);
  const { needsConfirm, requestReplace, confirmReplace, cancelReplace } = useConfirmReplaceDraft();
  const forkMutation = useForkCommunityTeamMutation();
  const communityQuery = useChampionsCommunityList(sort, format);

  const filteredTeams = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    const all = communityQuery.data ?? [];
    if (!normalized) {
      return all;
    }
    return all.filter(
      (team) =>
        team.name.toLowerCase().includes(normalized) ||
        team.pokemon.some((member) => member.pokemonName.toLowerCase().includes(normalized)),
    );
  }, [communityQuery.data, searchQuery]);

  const paginatedTeams = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTeams.slice(start, start + PAGE_SIZE);
  }, [filteredTeams, page]);

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / PAGE_SIZE));

  function updateFilter(key: "sort" | "format" | "page", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "highest" && key === "sort") {
      params.delete("sort");
    } else if (value === "all" && key === "format") {
      params.delete("format");
    } else if (value === "1" && key === "page") {
      params.delete("page");
    } else {
      params.set(key, value);
    }
    if (key !== "page") {
      params.delete("page");
    }
    const query = params.toString();
    router.replace(query ? `${ROUTES.championsCommunity}?${query}` : ROUTES.championsCommunity, {
      scroll: false,
    });
  }

  async function forkTeam(teamId: string) {
    setForkingTeamId(teamId);
    try {
      const draft = await forkMutation.mutateAsync(teamId);
      savePendingLoadedChampionsTeam(draft);
      setPreviewTeam(null);
      void router.push(ROUTES.championsBuilder);
    } finally {
      setForkingTeamId(null);
    }
  }

  function handleUseInBuilder(teamId: string) {
    requestReplace(() => {
      void forkTeam(teamId);
    });
  }

  const sortLabel = sort === "highest" ? "Highest rated" : "Newest";
  const formatLabel = format === "all" ? "All formats" : communityFormatSupportLabel(format);

  return (
    <>
      <ChampionsReplaceDraftDialog
        open={needsConfirm}
        onConfirm={confirmReplace}
        onCancel={cancelReplace}
      />
      <ChampionsCommunityPreviewDrawer
        team={previewTeam}
        open={previewTeam !== null}
        focusSection={previewFocus}
        onClose={() => {
          setPreviewTeam(null);
          setPreviewFocus("roster");
        }}
        onUseInBuilder={() => {
          if (previewTeam) {
            handleUseInBuilder(previewTeam.id);
          }
        }}
        isLoading={forkingTeamId === previewTeam?.id}
      />
      <ChampionsShell
        eyebrow="Community Teams"
        title="Community Teams"
        description="Discover shared Champions teams. Publish your saved team from Team Builder."
        variant="compact"
        chips={
          <>
            <PageIntroChip>
              {communityQuery.isPending ? "Loading…" : `${filteredTeams.length} teams`}
            </PageIntroChip>
            <PageIntroChip>
              {sortLabel} · {formatLabel}
            </PageIntroChip>
            {!isAuthenticated ? <PageIntroChip>Log in to star</PageIntroChip> : null}
          </>
        }
      >
        <section className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-4">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Search teams or Pokémon</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="e.g. Hawlucha or Rain core"
              className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
            />
          </label>
          <ChampionsFilterChips
            label="Sort"
            options={SORT_OPTIONS}
            value={sort}
            onChange={(value) => updateFilter("sort", value)}
          />
          <ChampionsFilterChips
            label="Format"
            options={FORMAT_OPTIONS}
            value={format}
            onChange={(value) => updateFilter("format", value)}
          />
          <p className="text-[11px] text-muted-foreground">
            Preview a team, then use it in Builder. Star teams you want to revisit when logged in.
          </p>
        </section>

        {communityQuery.isPending ? (
          <ChampionsCommunitySkeletonGrid />
        ) : communityQuery.isError ? (
          <div className="rounded-2xl border border-destructive/35 bg-destructive/10 px-4 py-6 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" aria-hidden />
            <p className="mt-3 text-sm text-destructive">
              {communityQuery.error instanceof Error
                ? communityQuery.error.message
                : "Unable to load community teams."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => void communityQuery.refetch()}>
                Retry
              </Button>
              {!isAuthenticated ? (
                <Button asChild size="sm" variant="outline" className="rounded-xl">
                  <Link href="/login">Sign in</Link>
                </Button>
              ) : null}
            </div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <ChampionsEmptyState
            icon={Users}
            title={communityQuery.data?.length ? "No teams match your search" : "No public community teams yet"}
            description={
              communityQuery.data?.length
                ? "Try a different Pokémon name or clear your search."
                : "Publish a saved team from Team Builder or browse Strategy Presets to get started."
            }
            primaryHref={communityQuery.data?.length ? ROUTES.championsCommunity : ROUTES.championsPresets}
            primaryLabel={communityQuery.data?.length ? "Clear filters" : "Browse presets"}
            secondaryHref={ROUTES.championsBuilder}
            secondaryLabel="Open Team Builder"
            onPrimaryClick={
              communityQuery.data?.length
                ? () => {
                    setSearchQuery("");
                    updateFilter("format", "all");
                    updateFilter("sort", "highest");
                  }
                : undefined
            }
          />
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedTeams.map((team) => (
              <ChampionsCommunityTeamCard
                key={team.id}
                team={team}
                isAuthenticated={isAuthenticated}
                isForking={forkingTeamId === team.id}
                onPreview={() => {
                  setPreviewFocus("roster");
                  setPreviewTeam(team);
                }}
                onComments={() => {
                  setPreviewFocus("comments");
                  setPreviewTeam(team);
                }}
                onFork={() => handleUseInBuilder(team.id)}
              />
            ))}
          </section>
        )}

        {filteredTeams.length > PAGE_SIZE ? (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              disabled={page <= 1}
              onClick={() => updateFilter("page", String(page - 1))}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              disabled={page >= totalPages}
              onClick={() => updateFilter("page", String(page + 1))}
            >
              Next
            </Button>
          </div>
        ) : null}
      </ChampionsShell>
    </>
  );
}
