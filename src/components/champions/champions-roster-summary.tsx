"use client";

import Link from "next/link";

import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { usePokemonSummariesBySlot } from "@/hooks/queries/use-pokemon-catalog";
import { isLikelyMegaStone } from "@/lib/champions/ruleset-legality";
import { summarizeSpFocus } from "@/lib/champions/battle-plan-utils";
import { resolvePokemonSlug } from "@/lib/pokemon/pokemon-slug-aliases";
import type { ChampionsPokemon } from "@/types/champions";
import type { PokemonSummary } from "@/types/pokemon";
import { cn } from "@/utils";

function RosterSlotSkeleton() {
  return (
    <article className="animate-pulse rounded-2xl border border-border/60 bg-background/35 p-3">
      <div className="h-3 w-12 rounded bg-muted/50" />
      <div className="mt-3 flex items-start gap-2">
        <div className="h-10 w-10 rounded-lg bg-muted/50" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded bg-muted/50" />
          <div className="h-4 w-16 rounded bg-muted/40" />
        </div>
      </div>
    </article>
  );
}

function RosterSlotCard({
  slot,
  summary,
  isLoading,
  hasError,
}: {
  slot: ChampionsPokemon;
  summary: PokemonSummary | null;
  isLoading: boolean;
  hasError: boolean;
}) {
  const filled = slot.pokemonName.trim().length > 0;
  const isMega = Boolean(slot.item?.trim() && isLikelyMegaStone(slot.item));

  if (!filled) {
    return (
      <article className="rounded-2xl border border-dashed border-border/45 bg-card/20 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Slot {slot.slot}
        </p>
        <p className="mt-6 text-center text-xs text-muted-foreground">Empty</p>
      </article>
    );
  }

  if (isLoading && !summary) {
    return <RosterSlotSkeleton />;
  }

  return (
    <article className="rounded-2xl border border-border/60 bg-background/35 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Slot {slot.slot}
      </p>
      <div className="mt-2 flex items-start gap-2">
        {summary ? (
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border/50 bg-background/60">
            <PokemonSprite
              src={summary.spriteNormal}
              alt={summary.name}
              size={40}
              className="h-full w-full object-contain p-0.5"
            />
          </div>
        ) : (
          <div
            className={cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border text-xs",
              hasError
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-border/50 bg-muted/30 text-muted-foreground",
            )}
          >
            {hasError ? "!" : "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{slot.pokemonName}</p>
          {summary ? (
            <div className="mt-1 flex flex-wrap gap-1">
              <TypeBadge type={summary.primaryType} />
              {summary.secondaryType ? <TypeBadge type={summary.secondaryType} /> : null}
            </div>
          ) : hasError ? (
            <p className="mt-1 text-[10px] text-destructive">Could not load sprite</p>
          ) : null}
        </div>
      </div>
      <dl className="mt-2 space-y-1 text-[11px] text-muted-foreground">
        <div className="flex justify-between gap-2">
          <dt>Ability</dt>
          <dd className="truncate text-right text-foreground">{slot.ability || "—"}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Item</dt>
          <dd className="truncate text-right text-foreground">
            {slot.item || "—"}
            {isMega ? (
              <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0 text-[9px] font-medium text-primary">
                Mega
              </span>
            ) : null}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Nature</dt>
          <dd className="truncate text-right text-foreground">{slot.statAlignment || "Serious"}</dd>
        </div>
        <div>
          <dt>SP focus</dt>
          <dd className="mt-0.5 text-foreground">{summarizeSpFocus(slot.sp)}</dd>
        </div>
      </dl>
    </article>
  );
}

export function ChampionsRosterSummary({
  pokemon,
}: {
  pokemon: ChampionsPokemon[];
}) {
  const { summariesBySlot, isLoading, missingSlugs } = usePokemonSummariesBySlot(pokemon);
  const filledCount = pokemon.filter((slot) => slot.pokemonName.trim()).length;
  const missingSlugSet = new Set(missingSlugs);

  return (
    <section className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Current Roster</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {filledCount}/6 slots filled. Plans are built from this Champions team.
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={ROUTES.championsBuilder}>Open Team Builder</Link>
        </Button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pokemon.map((slot) => {
          const summary = summariesBySlot[slot.slot] ?? null;
          const slug = resolvePokemonSlug(slot.pokemonName);
          const hasError = Boolean(slot.pokemonName.trim() && !summary && missingSlugSet.has(slug));
          return (
            <RosterSlotCard
              key={slot.id}
              slot={slot}
              summary={summary}
              isLoading={isLoading}
              hasError={hasError}
            />
          );
        })}
      </div>
    </section>
  );
}
