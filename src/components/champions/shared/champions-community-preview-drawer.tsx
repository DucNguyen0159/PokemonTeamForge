"use client";

import { useEffect, useRef } from "react";
import { Loader2, X } from "lucide-react";
import Link from "next/link";

import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { getPresetSpeciesDisplay } from "@/data/champions-preset-display";
import { communityCommentLabel, communityFormatSupportLabel } from "@/lib/champions/community-ui";
import { useChampionsCommunityDetail } from "@/hooks/queries/use-champions-community";
import type { ChampionsCommunityTeamSummary } from "@/types/champions-community";

function formatWhen(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatCommentWhen(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function ChampionsCommunityPreviewDrawer({
  team,
  open,
  focusSection = "roster",
  onClose,
  onUseInBuilder,
  isLoading,
}: {
  team: ChampionsCommunityTeamSummary | null;
  open: boolean;
  focusSection?: "roster" | "comments";
  onClose: () => void;
  onUseInBuilder: () => void;
  isLoading?: boolean;
}) {
  const commentsRef = useRef<HTMLElement>(null);
  const detailQuery = useChampionsCommunityDetail(team?.id ?? "");

  useEffect(() => {
    if (!open || focusSection !== "comments" || !detailQuery.data?.comments.length) {
      return;
    }
    commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [open, focusSection, detailQuery.data?.comments.length]);

  if (!open || !team) {
    return null;
  }

  const filledMembers = team.pokemon.filter((member) => member.pokemonName.trim());
  const hasSets = filledMembers.some(
    (member) => member.ability?.trim() || member.item?.trim() || member.moves?.some((move) => move.trim()),
  );
  const comments = detailQuery.data?.comments ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        aria-label="Close preview"
        onClick={onClose}
      />
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border/60 bg-card shadow-2xl"
        role="dialog"
        aria-labelledby="community-preview-title"
      >
        <div className="flex items-start justify-between gap-2 border-b border-border/60 p-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Community preview
            </p>
            <h2 id="community-preview-title" className="text-base font-semibold text-foreground">
              {team.name}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {communityFormatSupportLabel(team.formatSupport)} · Updated {formatWhen(team.updatedAt)}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={onClose}>
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4">
          <p className="text-xs text-muted-foreground">
            {team.starCount} stars · {communityCommentLabel(team.commentCount)} · {team.battlePlanCount} plans
          </p>
          <p className="text-[11px] text-muted-foreground">
            {hasSets
              ? "Fork imports roster, sets, spreads, and battle plans when the publisher saved them."
              : "Fork imports roster, SP spreads, and battle plans. Fill abilities, items, and moves in Builder if missing."}
          </p>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Roster</h3>
            <div className="mt-2 grid gap-2">
              {filledMembers.map((member) => {
                const display = getPresetSpeciesDisplay(member.pokemonName);
                return (
                  <div
                    key={`${team.id}-${member.slot}`}
                    className="flex min-w-0 items-center gap-2 rounded-xl border border-border/50 bg-background/35 p-2"
                  >
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted/40">
                      {member.spriteNormal || display?.spriteNormal ? (
                        <PokemonSprite
                          src={member.spriteNormal ?? display?.spriteNormal ?? ""}
                          alt={member.pokemonName}
                          size={36}
                          className="h-full w-full object-contain"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{member.pokemonName}</p>
                      {display ? (
                        <div className="mt-0.5 flex gap-1">
                          <TypeBadge type={display.primaryType} size="sm" />
                          {display.secondaryType ? (
                            <TypeBadge type={display.secondaryType} size="sm" />
                          ) : null}
                        </div>
                      ) : null}
                      {member.item?.trim() ? (
                        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">@ {member.item}</p>
                      ) : null}
                      {member.ability?.trim() ? (
                        <p className="truncate text-[10px] text-muted-foreground">{member.ability}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section ref={commentsRef} className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comments</h3>
              {team.commentCount > comments.length ? (
                <Link
                  href={`${ROUTES.championsCommunity}/${team.id}?tab=comments`}
                  className="text-[10px] font-medium text-primary hover:underline"
                >
                  View all
                </Link>
              ) : null}
            </div>
            {detailQuery.isPending ? (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">No comments yet.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {comments.slice(0, 5).map((comment) => (
                  <article
                    key={comment.id}
                    className="rounded-xl border border-border/50 bg-background/35 p-2.5"
                  >
                    <p className="text-[10px] text-muted-foreground">
                      {comment.authorUsername ?? "Trainer"} · {formatCommentWhen(comment.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-foreground">{comment.body}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-2 border-t border-border/60 p-4">
          <Button className="w-full rounded-xl" onClick={onUseInBuilder} disabled={isLoading}>
            {isLoading ? "Loading..." : "Use in Team Builder"}
          </Button>
          <Button asChild variant="outline" className="w-full rounded-xl">
            <Link href={`${ROUTES.championsCommunity}/${team.id}`}>View full page</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
