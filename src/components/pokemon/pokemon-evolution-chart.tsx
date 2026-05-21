import Link from "next/link";

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

function EvolutionConnector() {
  return (
    <div className="flex shrink-0 items-center px-1 sm:px-2" aria-hidden>
      <div className="h-px w-6 bg-muted-foreground/40 sm:w-10" />
      <div className="size-1.5 rotate-45 border-r border-t border-muted-foreground/50" />
    </div>
  );
}

function EvolutionStageCard({ stage, currentSlug, detailQuery }: EvolutionStageCardProps) {
  const current = isCurrentStage(stage, currentSlug);
  const href = buildPokemonDetailHref(stage.slug, detailQuery);

  return (
    <Link
      href={href}
      className={cn(
        "flex w-[7.5rem] shrink-0 flex-col items-center gap-2 rounded-2xl border px-3 py-3 transition-colors sm:w-[8.5rem]",
        "hover:border-primary/40 hover:bg-background/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        current
          ? "border-primary/60 bg-primary/10 shadow-md shadow-primary/10 ring-1 ring-primary/30"
          : "border-border/50 bg-background/35",
      )}
    >
      <div className="flex min-h-[1.35rem] items-center justify-center">
        {current ? (
          <span className="rounded-full border border-primary/50 bg-primary/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
            Current
          </span>
        ) : null}
      </div>
      <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted/40 sm:h-24 sm:w-24">
        <PokemonSprite
          src={stage.spriteNormal}
          alt={stage.name}
          size={96}
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
      <div className="flex items-center">
        <EvolutionStageCard stage={stage} currentSlug={currentSlug} detailQuery={detailQuery} />
        <EvolutionConnector />
        <EvolutionBranch stage={children[0]!} currentSlug={currentSlug} detailQuery={detailQuery} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <EvolutionStageCard stage={stage} currentSlug={currentSlug} detailQuery={detailQuery} />
      <div className="h-6 w-px bg-border/70" aria-hidden />
      <div className="flex flex-wrap items-start justify-center gap-4">
        {children.map((child, index) => (
          <div key={child.slug} className="flex flex-col items-center">
            <div className="mb-2 flex w-full items-center justify-center gap-2" aria-hidden>
              <div className="h-px flex-1 bg-border/60" />
              {index === Math.floor((children.length - 1) / 2) ? (
                <div className="h-3 w-px bg-border/70" />
              ) : null}
              <div className="h-px flex-1 bg-border/60" />
            </div>
            <EvolutionBranch stage={child} currentSlug={currentSlug} detailQuery={detailQuery} />
          </div>
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

      <div className="mt-5 overflow-x-auto overflow-y-visible pb-2 [-ms-overflow-style:none] [scrollbar-width:thin]">
        <div className="flex min-w-max justify-center px-2 pt-3">
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
