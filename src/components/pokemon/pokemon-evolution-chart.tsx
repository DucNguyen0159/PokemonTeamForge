import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { countEvolutionStages } from "@/lib/pokemon/evolution-chain";
import { buildPokemonDetailHref } from "@/lib/pokemon/pokemon-detail-query";
import type { EvolutionStage } from "@/types/pokemon";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { cn } from "@/utils";

type PokemonEvolutionChartProps = {
  pokemonName: string;
  currentSlug: string;
  evolutionChain?: EvolutionStage[];
  detailQuery?: Record<string, string | string[] | null | undefined>;
};

function isCurrentStage(stage: EvolutionStage, currentSlug: string): boolean {
  const normalized = currentSlug.trim().toLowerCase();
  return stage.slug === normalized || stage.speciesSlug === normalized;
}

type EvolutionStageCardProps = {
  stage: EvolutionStage;
  currentSlug: string;
  detailQuery?: Record<string, string | string[] | null | undefined>;
};

function EvolutionStageCard({ stage, currentSlug, detailQuery }: EvolutionStageCardProps) {
  const current = isCurrentStage(stage, currentSlug);
  const href = buildPokemonDetailHref(stage.slug, detailQuery);

  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-[7.5rem] flex-col items-center gap-2 rounded-2xl border px-3 py-3 transition-colors",
        "hover:border-primary/35 hover:bg-background/55 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        current
          ? "border-primary/50 bg-primary/10 shadow-sm shadow-primary/10"
          : "border-border/50 bg-background/35",
      )}
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted/40">
        <PokemonSprite
          src={stage.spriteNormal}
          alt={stage.name}
          size={64}
          className="h-full w-full object-contain p-1"
        />
      </div>
      <div className="text-center">
        <p className="text-[11px] tabular-nums text-muted-foreground">
          #{String(stage.pokemonId).padStart(4, "0")}
        </p>
        <p className={cn("text-sm font-semibold", current ? "text-primary" : "text-foreground")}>
          {stage.name}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        <TypeBadge type={stage.primaryType} />
        {stage.secondaryType ? <TypeBadge type={stage.secondaryType} /> : null}
      </div>
    </Link>
  );
}

type EvolutionBranchProps = {
  stage: EvolutionStage;
  currentSlug: string;
  detailQuery?: Record<string, string | string[] | null | undefined>;
};

function EvolutionBranch({ stage, currentSlug, detailQuery }: EvolutionBranchProps) {
  const children = stage.evolvesTo ?? [];

  if (children.length === 0) {
    return <EvolutionStageCard stage={stage} currentSlug={currentSlug} detailQuery={detailQuery} />;
  }

  if (children.length === 1) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <EvolutionStageCard stage={stage} currentSlug={currentSlug} detailQuery={detailQuery} />
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <EvolutionBranch stage={children[0]!} currentSlug={currentSlug} detailQuery={detailQuery} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-3">
      <EvolutionStageCard stage={stage} currentSlug={currentSlug} detailQuery={detailQuery} />
      <ArrowRight className="mt-8 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="flex flex-col gap-4">
        {children.map((child) => (
          <EvolutionBranch key={child.slug} stage={child} currentSlug={currentSlug} detailQuery={detailQuery} />
        ))}
      </div>
    </div>
  );
}

function hasEvolutionTree(chain?: EvolutionStage[]): boolean {
  if (!chain || chain.length === 0) {
    return false;
  }

  return countEvolutionStages(chain) > 1;
}

export function PokemonEvolutionChart({
  pokemonName,
  currentSlug,
  evolutionChain,
  detailQuery,
}: PokemonEvolutionChartProps) {
  if (!hasEvolutionTree(evolutionChain)) {
    return (
      <section className="rounded-2xl border border-border/60 bg-card/50 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Evolution</h2>
        <p className="mt-2 text-sm text-muted-foreground">{pokemonName} does not evolve.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Evolution</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap any stage to open its Pokémon detail page.
      </p>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex min-w-max flex-col gap-6">
          {evolutionChain?.map((root) => (
            <EvolutionBranch
              key={root.slug}
              stage={root}
              currentSlug={currentSlug}
              detailQuery={detailQuery}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
