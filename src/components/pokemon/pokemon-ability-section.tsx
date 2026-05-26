"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

import { HIDDEN_ABILITY_LABEL, type Ability } from "@/types/ability";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

type PokemonAbilitySectionProps = {
  abilities: Ability[];
};

export function PokemonAbilitySection({ abilities }: PokemonAbilitySectionProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (abilities.length === 0) {
    return (
      <section className="rounded-2xl border border-border/60 bg-card/50 p-5">
        <h2 className="text-lg font-semibold text-foreground">Abilities</h2>
        <p className="mt-2 text-sm text-muted-foreground">No ability data is available for this Pokémon.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Battle Data
        </p>
        <h2 className="text-lg font-semibold text-foreground">Abilities</h2>
        <p className="hidden max-w-2xl text-sm leading-relaxed text-muted-foreground sm:block">
          Review this Pokémon&apos;s ability effects, open the ability browser for more context, or
          filter the Pokédex to compare Pokémon that share the same ability.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {abilities.map((ability) => {
          const isExpanded = Boolean(expanded[ability.slug]);
          const fullEffect = ability.fullEffect?.trim();
          const canExpand = Boolean(fullEffect && fullEffect !== ability.description);

          return (
            <article
              key={ability.slug}
              className="rounded-2xl border border-border/50 bg-background/35 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-foreground">
                    {ability.name}{" "}
                    {ability.isHidden ? (
                      <span className="text-sm font-medium text-muted-foreground">
                        {HIDDEN_ABILITY_LABEL}
                      </span>
                    ) : null}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {ability.description}
                  </p>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                  <Button asChild variant="outline" size="sm" className="min-h-10 flex-1 rounded-xl sm:flex-none">
                    <Link href={`/abilities?ability=${encodeURIComponent(ability.slug)}`}>
                      Ability Detail
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="min-h-10 flex-1 rounded-xl sm:flex-none">
                    <Link href={`/pokedex?ability=${encodeURIComponent(ability.slug)}`}>
                      Pokémon With Ability
                    </Link>
                  </Button>
                </div>
              </div>

              {canExpand ? (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((current) => ({
                        ...current,
                        [ability.slug]: !isExpanded,
                      }))
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? (
                      <>
                        Hide full effect
                        <ChevronUp className="size-3.5" aria-hidden />
                      </>
                    ) : (
                      <>
                        Show full effect
                        <ChevronDown className="size-3.5" aria-hidden />
                      </>
                    )}
                  </button>
                  <p
                    className={cn(
                      "mt-2 rounded-xl border border-border/45 bg-card/45 px-3 py-2 text-sm leading-relaxed text-muted-foreground",
                      !isExpanded && "hidden",
                    )}
                  >
                    {fullEffect}
                  </p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
