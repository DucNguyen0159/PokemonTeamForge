"use client";

import type { ReactNode } from "react";

import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import { isSuperEffectiveAgainst } from "@/lib/calculations/shared/type-effectiveness";
import type { PokemonType } from "@/types/shared";
import { TypeChartOpenButton } from "@/components/type-chart/type-chart-reference";
import { TypeBadge } from "@/components/shared/type-badge";

type PokemonStabOffenseSummaryProps = {
  primaryType: PokemonType;
  secondaryType?: PokemonType | null;
};

function uniqueStabTypes(primaryType: PokemonType, secondaryType?: PokemonType | null): PokemonType[] {
  const types = [primaryType];
  if (secondaryType && secondaryType !== primaryType) {
    types.push(secondaryType);
  }

  return types;
}

function superEffectiveTargets(stabType: PokemonType): PokemonType[] {
  return ALL_POKEMON_TYPES.filter((targetType) => isSuperEffectiveAgainst(stabType, targetType));
}

function StabRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-2 lg:flex-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function PokemonStabOffenseSummary({
  primaryType,
  secondaryType,
}: PokemonStabOffenseSummaryProps) {
  const stabTypes = uniqueStabTypes(primaryType, secondaryType);
  const mergedTargets = Array.from(
    new Set(stabTypes.flatMap((stabType) => superEffectiveTargets(stabType))),
  );

  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">STAB coverage (typing only)</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Types this Pokémon&apos;s typings hit super-effectively with STAB moves. Builder coverage
            uses your selected moves.
          </p>
        </div>
        <TypeChartOpenButton />
      </div>

      <div className="mt-4 rounded-xl border border-border/40 bg-background/25 p-2.5 sm:p-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          <StabRow label="Typing">
            {stabTypes.map((stabType) => (
              <TypeBadge key={stabType} type={stabType} size="sm" />
            ))}
          </StabRow>

          <StabRow label="STAB threatens">
            {mergedTargets.length > 0 ? (
              mergedTargets.map((targetType) => (
                <TypeBadge key={targetType} type={targetType} size="sm" />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No super-effective STAB matchups from this typing.
              </p>
            )}
          </StabRow>
        </div>
      </div>
    </section>
  );
}
