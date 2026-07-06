"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquare, Star } from "lucide-react";

import { ChampionsRosterSummary } from "@/components/champions/champions-roster-summary";
import { ChampionsShell } from "@/components/champions/champions-shell";
import {
  ChampionsReplaceDraftDialog,
  useConfirmReplaceDraft,
} from "@/components/champions/shared/champions-replace-draft-dialog";
import { Button } from "@/components/ui/button";
import { formatLabel } from "@/lib/champions/battle-plan-utils";
import { communityFormatSupportLabel } from "@/lib/champions/community-ui";
import {
  useAddCommunityTeamCommentMutation,
  useChampionsCommunityDetail,
  useDeleteCommunityTeamCommentMutation,
  useForkCommunityTeamMutation,
  useToggleChampionsTeamStarMutation,
} from "@/hooks/queries/use-champions-community";
import { COMMUNITY_TEAM_NOT_FOUND_MESSAGE } from "@/lib/supabase/champions-community-service";
import { savePendingLoadedChampionsTeam } from "@/lib/team/pending-champions-team";
import { useAuthStore } from "@/store/auth-store";
import type { ChampionsCommunityPokemonPreview } from "@/types/champions-community";
import type { ChampionsPokemon } from "@/types/champions";
import { cn } from "@/utils";

type DetailTab = "roster" | "plans" | "comments";

function formatTimestamp(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function communityPreviewToRosterPokemon(
  members: ChampionsCommunityPokemonPreview[],
): ChampionsPokemon[] {
  return members.map((member) => ({
    id: `slot-${member.slot}`,
    slot: member.slot,
    pokemonId: member.pokemonId,
    pokemonName: member.pokemonName,
    ability: member.ability ?? "",
    item: member.item ?? "",
    moves: member.moves ?? ["", "", "", ""],
    statAlignment: member.statAlignment ?? "Serious",
    sp: member.sp ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    megaStone: "",
    useMegaByDefault: member.useMegaByDefault ?? false,
  }));
}

function slotLabelForNumber(
  slotNameByNumber: Map<number, string>,
  slot: number,
): string {
  return slotNameByNumber.get(slot) ?? `Slot ${slot}`;
}

export default function ChampionsCommunityTeamDetailPage() {
  const params = useParams<{ teamId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = params?.teamId ?? "";
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const detailQuery = useChampionsCommunityDetail(teamId);
  const toggleStarMutation = useToggleChampionsTeamStarMutation(teamId);
  const addCommentMutation = useAddCommunityTeamCommentMutation(teamId);
  const deleteCommentMutation = useDeleteCommunityTeamCommentMutation(teamId);
  const forkMutation = useForkCommunityTeamMutation();
  const { needsConfirm, requestReplace, confirmReplace, cancelReplace } = useConfirmReplaceDraft();
  const [activeTab, setActiveTab] = useState<DetailTab>("roster");
  const [commentDraft, setCommentDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "roster" || tab === "plans" || tab === "comments") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const detail = detailQuery.data;
  const isOwnTeam = Boolean(userId && detail?.userId === userId);
  const rosterPokemon = useMemo(
    () => (detail ? communityPreviewToRosterPokemon(detail.pokemon) : []),
    [detail],
  );

  const slotNameByNumber = useMemo(() => {
    const map = new Map<number, string>();
    detail?.pokemon.forEach((entry) => {
      map.set(entry.slot, entry.pokemonName);
    });
    return map;
  }, [detail?.pokemon]);

  async function handleToggleStar() {
    if (!isAuthenticated) {
      setError("Please log in to star community teams.");
      return;
    }
    if (isOwnTeam) {
      setError("You can't star your own team.");
      return;
    }
    setError(null);
    setFeedback(null);
    try {
      const hasStar = await toggleStarMutation.mutateAsync();
      setFeedback(hasStar ? "Team starred." : "Star removed.");
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to update star.");
    }
  }

  async function handleAddComment() {
    if (!isAuthenticated) {
      setError("Please log in to comment.");
      return;
    }
    setError(null);
    setFeedback(null);
    try {
      await addCommentMutation.mutateAsync(commentDraft);
      setCommentDraft("");
      setFeedback("Comment added.");
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to add comment.");
    }
  }

  async function forkTeam() {
    try {
      const draft = await forkMutation.mutateAsync(teamId);
      savePendingLoadedChampionsTeam(draft);
      setFeedback("Team forked. Redirecting to Champions Builder...");
      void router.push("/champions/builder");
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to fork this team.");
    }
  }

  function handleForkToBuilder() {
    setError(null);
    setFeedback(null);
    requestReplace(() => {
      void forkTeam();
    });
  }

  if (detailQuery.isPending) {
    return (
      <ChampionsShell
        eyebrow="Community Teams"
        title="Loading team..."
        description="Fetching community team details."
      >
        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading team details...
        </div>
      </ChampionsShell>
    );
  }

  const loadError = detailQuery.error;
  const isNotFound =
    loadError instanceof Error && loadError.message === COMMUNITY_TEAM_NOT_FOUND_MESSAGE;

  if (loadError || !detail) {
    return (
      <ChampionsShell
        eyebrow="Community Teams"
        title="Team unavailable"
        description={
          isNotFound
            ? "This team was removed or is no longer public."
            : "This team is unavailable or no longer public."
        }
      >
        <p className="rounded-2xl border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {isNotFound
            ? "Head back to Community Teams and pick a team from the current list."
            : loadError instanceof Error
              ? loadError.message
              : "Unable to load team detail."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {!isNotFound ? (
            <Button
              className="rounded-xl"
              variant="secondary"
              disabled={detailQuery.isFetching}
              onClick={() => {
                void detailQuery.refetch();
              }}
            >
              {detailQuery.isFetching ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : null}
              Try again
            </Button>
          ) : null}
          <Button asChild className="rounded-xl" variant={isNotFound ? "default" : "outline"}>
            <Link href="/champions/community">Back to community</Link>
          </Button>
        </div>
      </ChampionsShell>
    );
  }

  return (
    <>
      <ChampionsReplaceDraftDialog
        open={needsConfirm}
        onConfirm={confirmReplace}
        onCancel={cancelReplace}
      />
    <ChampionsShell
      eyebrow="Community Teams"
      title={detail.name}
      description="Public Champions team detail, battle plans, and discussion."
      variant="compact"
      chips={
        <>
          <span className="inline-flex rounded-full border border-border/55 bg-background/45 px-3 py-1 text-xs font-medium text-muted-foreground">
            {communityFormatSupportLabel(detail.formatSupport)}
          </span>
          <span className="inline-flex rounded-full border border-border/55 bg-background/45 px-3 py-1 text-xs font-medium text-muted-foreground">
            {detail.starCount} stars
          </span>
          <span className="inline-flex rounded-full border border-border/55 bg-background/45 px-3 py-1 text-xs font-medium text-muted-foreground">
            {detail.commentCount} comments
          </span>
        </>
      }
    >
      <nav aria-label="Team detail sections" className="flex gap-1 border-b border-border/60 pb-1">
        {(
          [
            { id: "roster" as const, label: "Roster" },
            { id: "plans" as const, label: "Plans" },
            { id: "comments" as const, label: "Comments" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "roster" ? <ChampionsRosterSummary pokemon={rosterPokemon} /> : null}

      {activeTab === "plans" ? (
      <section className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-4">
        <h2 className="text-base font-semibold text-foreground">Battle Plans</h2>
        {detail.battlePlans.length === 0 ? (
          <p className="text-sm text-muted-foreground">No battle plans published with this team.</p>
        ) : (
          <div className="grid gap-3">
            {detail.battlePlans.map((plan) => (
              <article key={plan.id} className="rounded-xl border border-border/55 bg-background/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    {formatLabel(plan.format)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{plan.matchupLabel}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Selected:{" "}
                  {plan.selectedPokemonSlots
                    .map((slot) => slotLabelForNumber(slotNameByNumber, slot))
                    .join(", ") || "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Leads:{" "}
                  {plan.leadPokemonSlots
                    .map((slot) => slotLabelForNumber(slotNameByNumber, slot))
                    .join(", ") || "—"}
                </p>
                {plan.winConditionNote ? (
                  <p className="mt-2 text-xs text-foreground">Win: {plan.winConditionNote}</p>
                ) : null}
                {plan.avoidNote ? (
                  <p className="mt-1 text-xs text-muted-foreground">Avoid: {plan.avoidNote}</p>
                ) : null}
                {plan.generalNote ? (
                  <p className="mt-1 text-xs text-muted-foreground">Note: {plan.generalNote}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
      ) : null}

      {activeTab === "comments" ? (
      <section className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-4">
        <h2 className="inline-flex items-center gap-2 text-base font-semibold text-foreground">
          <MessageSquare className="size-4" aria-hidden />
          Comments
        </h2>
        {isAuthenticated ? (
          <div className="space-y-2">
            <textarea
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              className="min-h-20 w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
              placeholder="Share matchup notes, strengths, or concerns..."
            />
            <Button
              size="sm"
              className="rounded-xl"
              onClick={() => {
                void handleAddComment();
              }}
              disabled={addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
              Add comment
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>{" "}
            to comment.
          </p>
        )}
        {detail.comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet — be the first.</p>
        ) : (
          <div className="space-y-2">
            {detail.comments.map((comment) => (
              <article key={comment.id} className="rounded-xl border border-border/55 bg-background/40 p-3">
                <p className="text-xs text-muted-foreground">
                  {comment.authorUsername ?? "Trainer"} · {formatTimestamp(comment.createdAt)}
                </p>
                <p className="mt-1 text-sm text-foreground">{comment.body}</p>
                {userId === comment.userId ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 rounded-lg text-xs text-muted-foreground"
                    onClick={() => {
                      void deleteCommentMutation.mutateAsync(comment.id);
                    }}
                    disabled={deleteCommentMutation.isPending}
                  >
                    Delete
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
      ) : null}

      <div className="sticky bottom-0 z-20 -mx-1 rounded-2xl border border-border/60 bg-card/95 p-3 backdrop-blur">
        <p className="mb-2 text-xs text-muted-foreground">
          Published by{" "}
          <span className="font-medium text-foreground">
            {detail.publisherUsername ?? "Trainer"}
          </span>
          {" · "}Updated {formatTimestamp(detail.updatedAt)}
        </p>
        <div className="flex flex-wrap gap-2">
          {isOwnTeam ? (
            <span className="inline-flex items-center rounded-xl border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground">
              Your team
            </span>
          ) : (
            <Button
              size="sm"
              variant={detail.hasStarred ? "secondary" : "outline"}
              className="rounded-xl"
              onClick={() => void handleToggleStar()}
              disabled={!isAuthenticated || toggleStarMutation.isPending}
              title={!isAuthenticated ? "Log in to star teams" : undefined}
            >
              {toggleStarMutation.isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Star className="size-3.5" aria-hidden />}
              {detail.hasStarred ? "Starred" : "Star"}
            </Button>
          )}
          <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => void handleForkToBuilder()}>
            {forkMutation.isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
            Use in Builder
          </Button>
          <Button asChild size="sm" variant="ghost" className="rounded-xl">
            <Link href="/champions/community">Back</Link>
          </Button>
        </div>
        {feedback ? (
          <p className="mt-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {feedback}
          </p>
        ) : null}
        {error ? (
          <p className="mt-2 rounded-xl border border-destructive/35 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </ChampionsShell>
    </>
  );
}
