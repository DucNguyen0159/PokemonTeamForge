"use client";

import Link from "next/link";
import { ClipboardList, Loader2, MessageSquare, Star } from "lucide-react";

import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { getPresetSpeciesDisplay } from "@/data/champions-preset-display";
import {
  communityCardPokemonLabel,
  communityCommentLabel,
  communityFormatSupportLabel,
} from "@/lib/champions/community-ui";
import { useToggleChampionsTeamStarMutation } from "@/hooks/queries/use-champions-community";
import type { ChampionsCommunityTeamSummary } from "@/types/champions-community";
import { cn } from "@/utils";

function formatWhen(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function TeamStarButton({
  teamId,
  hasStarred,
  disabled,
}: {
  teamId: string;
  hasStarred: boolean;
  disabled: boolean;
}) {
  const mutation = useToggleChampionsTeamStarMutation(teamId);

  return (
    <Button
      size="sm"
      variant={hasStarred ? "secondary" : "outline"}
      disabled={disabled || mutation.isPending}
      onClick={() => {
        void mutation.mutateAsync();
      }}
      className="rounded-xl"
      title={disabled ? "Log in to star teams" : undefined}
    >
      {mutation.isPending ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      ) : (
        <Star className="size-3.5" aria-hidden />
      )}
      {hasStarred ? "Starred" : "Star"}
    </Button>
  );
}

function RosterPreviewTile({
  name,
  spriteUrl,
}: {
  name: string;
  spriteUrl: string | null;
}) {
  if (!name.trim()) {
    return null;
  }

  const display = getPresetSpeciesDisplay(name);
  const label = communityCardPokemonLabel(name);

  return (
    <div className="flex min-w-0 flex-col items-center gap-1 rounded-lg border border-border/40 bg-background/35 p-1.5">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted/40">
        {spriteUrl || display?.spriteNormal ? (
          <PokemonSprite
            src={spriteUrl ?? display?.spriteNormal ?? ""}
            alt={label}
            size={36}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground">
            ?
          </div>
        )}
      </div>
      <p className="w-full truncate text-center text-[10px] font-medium leading-tight text-foreground">
        {label}
      </p>
    </div>
  );
}

const statChipClassName =
  "inline-flex min-w-0 max-w-full items-center gap-1 rounded-lg border border-border/50 bg-background/30 px-2 py-1 text-[11px] text-muted-foreground";

const statChipInteractiveClassName =
  "inline-flex min-w-0 max-w-full items-center gap-1 rounded-lg border border-border/50 bg-background/30 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary";

export function ChampionsCommunityTeamCard({
  team,
  isAuthenticated,
  compact = false,
  isForking = false,
  onPreview,
  onComments,
  onFork,
}: {
  team: ChampionsCommunityTeamSummary;
  isAuthenticated: boolean;
  compact?: boolean;
  isForking?: boolean;
  onPreview?: () => void;
  onComments?: () => void;
  onFork?: () => void;
}) {
  const filledMembers = team.pokemon.filter((member) => member.pokemonName.trim());
  const commentsHref = `${ROUTES.championsCommunity}/${team.id}?tab=comments`;
  const plansHref = `${ROUTES.championsCommunity}/${team.id}?tab=plans`;

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm transition-shadow hover:shadow-md",
        compact && "p-3",
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">{team.name}</h2>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            Updated {formatWhen(team.updatedAt)}
            {team.publisherUsername ? ` · ${team.publisherUsername}` : null}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border/50 bg-background/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {communityFormatSupportLabel(team.formatSupport)}
        </span>
      </div>

      <div className="grid min-w-0 grid-cols-3 gap-1.5">
        {filledMembers.map((member) => {
          const display = getPresetSpeciesDisplay(member.pokemonName);
          return (
            <RosterPreviewTile
              key={`${team.id}-${member.slot}`}
              name={member.pokemonName}
              spriteUrl={member.spriteNormal ?? display?.spriteNormal ?? null}
            />
          );
        })}
      </div>

      <div className="flex min-w-0 flex-wrap gap-1.5">
        <span className={statChipClassName} title="Community star count">
          <Star className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{team.starCount}</span>
        </span>
        {team.commentCount > 0 ? (
          onComments ? (
            <button
              type="button"
              className={statChipInteractiveClassName}
              onClick={onComments}
              title="Read community comments"
            >
              <MessageSquare className="size-3 shrink-0" aria-hidden />
              <span className="truncate">Read {communityCommentLabel(team.commentCount)}</span>
            </button>
          ) : (
            <Link
              href={commentsHref}
              className={statChipInteractiveClassName}
              title="Read community comments"
            >
              <MessageSquare className="size-3 shrink-0" aria-hidden />
              <span className="truncate">Read {communityCommentLabel(team.commentCount)}</span>
            </Link>
          )
        ) : (
          <span className={statChipClassName} title="No comments yet">
            <MessageSquare className="size-3 shrink-0" aria-hidden />
            <span className="truncate">0 comments</span>
          </span>
        )}
        {team.battlePlanCount > 0 ? (
          <Link
            href={plansHref}
            className={statChipInteractiveClassName}
            title="View battle plans"
          >
            <ClipboardList className="size-3 shrink-0" aria-hidden />
            <span className="truncate">
              {team.battlePlanCount} {team.battlePlanCount === 1 ? "plan" : "plans"}
            </span>
          </Link>
        ) : (
          <span className={statChipClassName} title="No battle plans published">
            <ClipboardList className="size-3 shrink-0" aria-hidden />
            <span className="truncate">0 plans</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {onPreview ? (
          <Button size="sm" variant="secondary" className="rounded-xl" onClick={onPreview}>
            Preview
          </Button>
        ) : (
          <Button asChild size="sm" variant="secondary" className="rounded-xl">
            <Link href={`${ROUTES.championsCommunity}/${team.id}`}>View team</Link>
          </Button>
        )}
        <TeamStarButton teamId={team.id} hasStarred={team.hasStarred} disabled={!isAuthenticated} />
        {onFork ? (
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={isForking}
            onClick={onFork}
          >
            {isForking ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
            Use in Builder
          </Button>
        ) : null}
      </div>
    </article>
  );
}
