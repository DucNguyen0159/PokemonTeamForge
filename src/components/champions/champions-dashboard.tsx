"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calculator,
  ClipboardList,
  Sparkles,
  Swords,
} from "lucide-react";

import { ChampionsCommunityTeamCard } from "@/components/champions/champions-community-team-card";
import { ChampionsShell } from "@/components/champions/champions-shell";
import { ChampionsTeamIdentityBar } from "@/components/champions/champions-team-identity-bar";
import { ChampionsCommunityPreviewDrawer } from "@/components/champions/shared/champions-community-preview-drawer";
import { ChampionsCommunitySkeletonGrid } from "@/components/champions/shared/champions-community-skeleton-grid";
import {
  ChampionsReplaceDraftDialog,
  useConfirmReplaceDraft,
} from "@/components/champions/shared/champions-replace-draft-dialog";
import { ChampionsEmptyState } from "@/components/champions/shared/champions-empty-state";
import { ChampionsRulesStrip } from "@/components/champions/shared/champions-rules-strip";
import { PageIntroChip } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { CHAMPIONS_BUILDER_PLANS_HREF } from "@/data/champions";
import { ROUTES } from "@/constants/routes";
import { useChampionsCommunityList, useForkCommunityTeamMutation } from "@/hooks/queries/use-champions-community";
import { useLoadChampionsTeamMutation } from "@/hooks/queries/use-champions-teams";
import { useUserTeams } from "@/hooks/queries/use-user-teams";
import { useActiveTeamSnapshot, useActiveTeamSummaries } from "@/hooks/use-active-team-snapshot";
import { readChampionsLastRoute } from "@/lib/champions/last-route";
import { savePendingLoadedChampionsTeam } from "@/lib/team/pending-champions-team";
import { useAuthStore } from "@/store/auth-store";
import { useChampionsTeamStore } from "@/store/champions-team-store";
import type { ChampionsCommunityTeamSummary } from "@/types/champions-community";

const WORKFLOW_CARDS = [
  {
    label: "Damage Lab",
    href: ROUTES.championsDamage,
    description: "Exact damage calculations",
    icon: Calculator,
  },
  {
    label: "Matchup Coach",
    href: ROUTES.championsCoach,
    description: "Coverage and threat checks",
    icon: Swords,
  },
  {
    label: "Battle Plans",
    href: CHAMPIONS_BUILDER_PLANS_HREF,
    description: "3v3 / 4v4 bring lists",
    icon: ClipboardList,
  },
  {
    label: "Strategy Presets",
    href: ROUTES.championsPresets,
    description: "Curated starter teams",
    icon: Sparkles,
  },
] as const;

export function ChampionsDashboard() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadTeam = useChampionsTeamStore((state) => state.loadTeam);
  const setSourcePreset = useChampionsTeamStore((state) => state.setSourcePreset);
  const { team, snapshot, nextStep } = useActiveTeamSnapshot();
  const { summariesBySlot, isLoading: isSummariesLoading } = useActiveTeamSummaries();
  const communityQuery = useChampionsCommunityList("highest", "all");
  const teamsQuery = useUserTeams();
  const loadMutation = useLoadChampionsTeamMutation();
  const forkMutation = useForkCommunityTeamMutation();
  const { needsConfirm, requestReplace, confirmReplace, cancelReplace } = useConfirmReplaceDraft();
  const [lastRoute, setLastRoute] = useState<{ href: string; label: string } | null>(null);
  const [previewTeam, setPreviewTeam] = useState<ChampionsCommunityTeamSummary | null>(null);
  const [previewFocus, setPreviewFocus] = useState<"roster" | "comments">("roster");
  const [forkingTeamId, setForkingTeamId] = useState<string | null>(null);

  useEffect(() => {
    setLastRoute(readChampionsLastRoute());
  }, []);

  const savedChampionsTeams = (teamsQuery.data ?? [])
    .filter((entry) => entry.mode === "champions")
    .slice(0, 4);
  const trendingTeams = (communityQuery.data ?? []).slice(0, 3);

  async function handleLoadSavedTeam(teamId: string) {
    const loaded = await loadMutation.mutateAsync(teamId);
    loadTeam(loaded);
    setSourcePreset(null);
    void router.push(ROUTES.championsBuilder);
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
      eyebrow="Pokemon Champions"
      title="Champions Dashboard"
      description="Your active team, next step, and community discovery — all in one place."
      chips={
        <>
          <PageIntroChip>{snapshot.rosterFilled}/6 roster</PageIntroChip>
          <PageIntroChip>{snapshot.battlePlanCount} plans</PageIntroChip>
        </>
      }
    >
      <ChampionsTeamIdentityBar
        team={team}
        summariesBySlot={summariesBySlot}
        snapshot={snapshot}
        variant="expanded"
        isSummariesLoading={isSummariesLoading}
        nextStep={nextStep}
        legalityIssues={snapshot.issues}
      />

      {snapshot.rosterFilled === 0 ? (
        <ChampionsEmptyState
          icon={Sparkles}
          title="Start your Champions team"
          description="Load a curated preset or build a 6-Pokémon roster from scratch."
          primaryHref={ROUTES.championsPresets}
          primaryLabel="Browse Strategy Presets"
          secondaryHref={ROUTES.championsBuilder}
          secondaryLabel="Build from scratch"
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="lg" className="rounded-xl">
            <Link href={nextStep.href}>
              {nextStep.label}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          {nextStep.secondary ? (
            <Button asChild size="lg" variant="secondary" className="rounded-xl">
              <Link href={nextStep.secondary.href}>{nextStep.secondary.label}</Link>
            </Button>
          ) : null}
          {lastRoute && lastRoute.href !== ROUTES.champions ? (
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link href={lastRoute.href}>Continue in {lastRoute.label}</Link>
            </Button>
          ) : null}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {WORKFLOW_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:bg-card/80"
          >
            <card.icon className="size-5 text-primary" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-foreground">{card.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
          </Link>
        ))}
      </section>

      {isAuthenticated && savedChampionsTeams.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground">Continue your teams</h2>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary"
            >
              All saved teams
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {savedChampionsTeams.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="rounded-2xl border border-border/60 bg-card/60 p-4 text-left transition-colors hover:bg-card/80"
                onClick={() => void handleLoadSavedTeam(entry.id)}
                disabled={loadMutation.isPending}
              >
                <p className="text-sm font-semibold text-foreground">{entry.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.filledSlotCount}/6 slots · {entry.formatSupport ?? entry.format}
                </p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">Trending community teams</h2>
          <Link
            href={ROUTES.championsCommunity}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary"
          >
            Browse all
            <ArrowRight className="size-3" aria-hidden />
          </Link>
        </div>
        {communityQuery.isPending ? (
          <ChampionsCommunitySkeletonGrid count={3} />
        ) : trendingTeams.length === 0 ? (
          <ChampionsEmptyState
            title="No public teams yet"
            description="Be the first to publish from Team Builder."
            primaryHref={ROUTES.championsBuilder}
            primaryLabel="Open Team Builder"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trendingTeams.map((entry) => (
              <ChampionsCommunityTeamCard
                key={entry.id}
                team={entry}
                isAuthenticated={isAuthenticated}
                compact
                isForking={forkingTeamId === entry.id}
                onPreview={() => {
                  setPreviewFocus("roster");
                  setPreviewTeam(entry);
                }}
                onComments={() => {
                  setPreviewFocus("comments");
                  setPreviewTeam(entry);
                }}
                onFork={() => handleUseInBuilder(entry.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/60 p-4">
        <h2 className="text-sm font-semibold text-foreground">Champions rules</h2>
        <div className="mt-3">
          <ChampionsRulesStrip />
        </div>
      </section>
    </ChampionsShell>
    </>
  );
}
