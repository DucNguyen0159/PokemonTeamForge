import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import { isSuperEffectiveAgainst } from "@/lib/calculations/shared/type-effectiveness";
import type { PokemonType } from "@/types/shared";
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

export function PokemonStabOffenseSummary({
  primaryType,
  secondaryType,
}: PokemonStabOffenseSummaryProps) {
  const stabTypes = uniqueStabTypes(primaryType, secondaryType);

  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">STAB offensive profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Types this Pokémon&apos;s typings hit super-effectively with STAB moves. Team Builder
        coverage includes your selected moves; this is typing-only.
      </p>

      <div className="mt-4 space-y-4">
        {stabTypes.map((stabType) => {
          const targets = superEffectiveTargets(stabType);

          return (
            <article
              key={stabType}
              className="rounded-xl border border-border/45 bg-background/30 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={stabType} size="md" />
                <h3 className="text-sm font-semibold capitalize text-foreground">{stabType} STAB</h3>
              </div>
              {targets.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {targets.map((targetType) => (
                    <TypeBadge key={`${stabType}-${targetType}`} type={targetType} />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No super-effective STAB matchups against single typings.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
