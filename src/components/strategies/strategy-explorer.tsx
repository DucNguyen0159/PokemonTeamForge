"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { strategyTeamToBuilderTeam } from "@/lib/strategies/strategy-to-team";
import { useTeamStore } from "@/store/team-store";
import type { StrategyListResponse } from "@/types/api";
import type { StrategyTeam } from "@/types/strategy";
import { TypeBadge } from "@/components/shared/type-badge";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { ErrorMessage } from "@/components/error/error-message";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

const STRATEGY_TYPE_OPTIONS = [
  { value: "all", label: "All styles" },
  { value: "rain", label: "Rain" },
  { value: "sun", label: "Sun" },
  { value: "trick_room", label: "Trick Room" },
  { value: "tailwind", label: "Tailwind" },
  { value: "balance", label: "Balance" },
  { value: "hyper_offense", label: "Hyper Offense" },
  { value: "stall", label: "Stall" },
  { value: "monotype", label: "Monotype" },
] as const;

const FORMAT_OPTIONS = [
  { value: "all", label: "All formats" },
  { value: "singles", label: "Singles" },
  { value: "doubles", label: "Doubles" },
  { value: "triples", label: "Triples" },
] as const;

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "Any difficulty" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

type FilterState = {
  strategyType: (typeof STRATEGY_TYPE_OPTIONS)[number]["value"];
  format: (typeof FORMAT_OPTIONS)[number]["value"];
  difficulty: (typeof DIFFICULTY_OPTIONS)[number]["value"];
};

function StrategyCard({
  strategy,
  onLoad,
  isLoading,
}: {
  strategy: StrategyTeam;
  onLoad: (team: StrategyTeam) => void;
  isLoading: boolean;
}) {
  return (
    <article className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{strategy.name}</p>
          <p className="text-xs text-muted-foreground">{strategy.shortDescription}</p>
        </div>
        <span className="rounded-full border border-border/50 bg-background/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {strategy.format}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {strategy.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary/90"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {strategy.pokemon.slice(0, 6).map((member) => (
          <div
            key={`${strategy.id}-${member.slot}`}
            className="flex items-center gap-2 rounded-xl border border-border/40 bg-background/35 p-2"
          >
            <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-muted/40">
              <PokemonSprite
                src={member.pokemon.spriteNormal}
                alt={member.pokemon.name}
                size={36}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{member.pokemon.name}</p>
              <div className="mt-0.5 flex gap-1">
                <TypeBadge type={member.pokemon.primaryType} />
                {member.pokemon.secondaryType ? <TypeBadge type={member.pokemon.secondaryType} /> : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        size="sm"
        className="h-8 w-full text-xs"
        onClick={() => onLoad(strategy)}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="size-3.5 animate-spin" />
            Loading...
          </span>
        ) : (
          "Load into Builder"
        )}
      </Button>
    </article>
  );
}

export function StrategyExplorer() {
  const router = useRouter();
  const loadTeam = useTeamStore((state) => state.loadTeam);

  const [filters, setFilters] = useState<FilterState>({
    strategyType: "all",
    format: "all",
    difficulty: "all",
  });
  const [strategies, setStrategies] = useState<StrategyTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTeamId, setLoadingTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.strategyType !== "all") params.set("strategyType", filters.strategyType);
    if (filters.format !== "all") params.set("format", filters.format);
    if (filters.difficulty !== "all") params.set("difficulty", filters.difficulty);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/strategies${queryString ? `?${queryString}` : ""}`,
        );
        let payload: StrategyListResponse | null = null;
        try {
          payload = (await response.json()) as StrategyListResponse;
        } catch {
          throw new Error("Strategy teams are temporarily unavailable. Please try again.");
        }

        if (!response.ok || !payload?.success || !payload.data) {
          throw new Error(payload?.error?.message ?? "Unable to load strategy teams.");
        }

        if (!cancelled) {
          setStrategies(payload.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load strategy teams.");
          setStrategies([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [queryString, retryNonce]);

  function handleLoadStrategy(strategy: StrategyTeam) {
    setLoadingTeamId(strategy.id);
    const builderTeam = strategyTeamToBuilderTeam(strategy);
    loadTeam(builderTeam);
    router.push(ROUTES.builder);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Strategy Teams</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Preset Archetypes
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Pick a strategy preset and load it into Team Builder instantly. Every preset is fully editable after loading.
        </p>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card/60 p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select
            aria-label="Filter strategy type"
            value={filters.strategyType}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                strategyType: event.target.value as FilterState["strategyType"],
              }))
            }
            className="h-10 rounded-xl border border-border/50 bg-background/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {STRATEGY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter format"
            value={filters.format}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                format: event.target.value as FilterState["format"],
              }))
            }
            className="h-10 rounded-xl border border-border/50 bg-background/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {FORMAT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter difficulty"
            value={filters.difficulty}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                difficulty: event.target.value as FilterState["difficulty"],
              }))
            }
            className="h-10 rounded-xl border border-border/50 bg-background/50 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading strategy teams...
        </div>
      ) : error ? (
        <ErrorMessage
          title="Strategy teams unavailable"
          message={error}
          onRetry={() => {
            setRetryNonce((value) => value + 1);
          }}
          isRetrying={isLoading}
        />
      ) : strategies.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
          No strategy teams match the selected filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {strategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              onLoad={handleLoadStrategy}
              isLoading={loadingTeamId === strategy.id}
            />
          ))}
        </div>
      )}

      <p
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground/80",
          "rounded-xl border border-border/40 bg-background/30 px-3 py-2",
        )}
      >
        <Sparkles className="size-3.5 text-primary/80" />
        Presets are starting points, not locked templates. You can edit Pokémon, moves, items, and abilities after loading.
      </p>
    </div>
  );
}

