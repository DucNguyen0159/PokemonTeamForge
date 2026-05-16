"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Swords,
  Target,
} from "lucide-react";

import { FORMAT_RULES } from "@/data/format-rules";
import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import type { PokemonDetail } from "@/types/pokemon";
import type {
  RecommendationFilters,
  RecommendationReason,
  RecommendationResult,
} from "@/types/recommendation";
import type { PokemonType, StatTier, TeamRole } from "@/types/shared";
import { cn } from "@/utils";
import { TypeBadge } from "@/components/shared/type-badge";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { ErrorMessage } from "@/components/error/error-message";
import { Button } from "@/components/ui/button";
import { useRecommendationStore } from "@/store/recommendation-store";
import { useTeamStore } from "@/store/team-store";

// ─── constants ────────────────────────────────────────────────────────────────

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const ROLE_LABELS: Partial<Record<TeamRole, string>> = {
  physical_attacker: "Phys. Attacker",
  special_attacker: "Sp. Attacker",
  mixed_attacker: "Mixed Attacker",
  physical_wall: "Phys. Wall",
  special_wall: "Sp. Wall",
  tank: "Tank",
  support: "Support",
  pivot: "Pivot",
  hazard_setter: "Hazard Setter",
  hazard_remover: "Hazard Remover",
  setup_sweeper: "Setup Sweeper",
  wallbreaker: "Wallbreaker",
  speed_control: "Speed Control",
  weather_setter: "Weather Setter",
  weather_abuser: "Weather Abuser",
  trick_room_setter: "Trick Room Setter",
  trick_room_abuser: "Trick Room Abuser",
  intimidate_support: "Intimidate",
  redirection_support: "Redirection",
  status_spreader: "Status Spreader",
  priority_user: "Priority",
  trap_user: "Trapper",
};

const REASON_META: Record<
  RecommendationReason["type"],
  { icon: React.ElementType; color: string }
> = {
  missing_role: { icon: Target, color: "text-primary" },
  defensive_synergy: { icon: Shield, color: "text-sky-400" },
  offensive_coverage: { icon: Swords, color: "text-orange-400" },
  ability_synergy: { icon: Sparkles, color: "text-violet-400" },
  format_bonus: { icon: Lightbulb, color: "text-yellow-400" },
  stat_tier_match: { icon: ChevronUp, color: "text-emerald-400" },
  penalty: { icon: AlertTriangle, color: "text-red-400/70" },
};

const STAT_TIERS: { value: StatTier; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Med" },
  { value: "high", label: "High" },
  { value: "very_high", label: "V.High" },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

async function fetchRecommendations(
  team: unknown,
  filters: RecommendationFilters,
  signal?: AbortSignal,
): Promise<RecommendationResult[]> {
  let response: Response;
  try {
    response = await fetch("/api/recommendation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team, filters }),
      signal,
    });
  } catch {
    throw new Error("You seem to be offline. Please check your connection and try again.");
  }

  let payload: {
    success: boolean;
    data?: { results: RecommendationResult[] };
    error?: { message?: string };
  } | null = null;

  try {
    payload = (await response.json()) as {
      success: boolean;
      data?: { results: RecommendationResult[] };
      error?: { message?: string };
    };
  } catch {
    throw new Error("Recommendations are temporarily unavailable. Please try again.");
  }

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error?.message ?? "Failed to load recommendations.");
  }

  return payload.data.results;
}

async function fetchPokemonDetail(slug: string): Promise<PokemonDetail> {
  const response = await fetch(`/api/pokemon/${encodeURIComponent(slug)}`);
  let payload: {
    success: boolean;
    data?: PokemonDetail;
    error?: { message?: string };
  } | null = null;

  try {
    payload = (await response.json()) as {
      success: boolean;
      data?: PokemonDetail;
      error?: { message?: string };
    };
  } catch {
    throw new Error("Could not load Pokemon right now.");
  }

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error?.message ?? "Could not load Pokemon.");
  }

  return payload.data;
}

// ─── sub-components ───────────────────────────────────────────────────────────

const ReasonPill = memo(function ReasonPill({ reason }: { reason: RecommendationReason }) {
  const meta = REASON_META[reason.type];
  const Icon = meta.icon;

  if (reason.type === "penalty") {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] leading-snug text-muted-foreground">
      <Icon className={cn("size-3 flex-shrink-0", meta.color)} aria-hidden />
      {reason.message}
    </span>
  );
});

type CardState = "idle" | "adding" | "added" | "error";

const RecommendationCard = memo(function RecommendationCard({
  result,
}: {
  result: RecommendationResult;
}) {
  const [state, setState] = useState<CardState>("idle");
  const addPokemon = useTeamStore((s) => s.addPokemon);
  const { pokemon, reasons, score, matchedRoles } = result;

  const positiveReasons = useMemo(
    () => reasons.filter((r) => r.type !== "penalty" && r.scoreImpact > 0).slice(0, 2),
    [reasons],
  );

  async function handleAdd() {
    const slot =
      useTeamStore.getState().team.pokemon.find((entry) => !entry.pokemon)?.slot ?? null;

    if (!slot) {
      setState("error");
      return;
    }

    setState("adding");
    try {
      const detail = await fetchPokemonDetail(pokemon.slug);
      addPokemon(slot, detail);
      setState("added");
    } catch {
      setState("error");
    }
  }

  return (
    <div
      className={cn(
        "group flex flex-col gap-2 rounded-xl border bg-background/30 p-3 transition-colors",
        state === "added"
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-border/40 hover:border-border/60 hover:bg-background/50",
      )}
    >
      {/* header row */}
      <div className="flex items-start gap-2.5">
        {/* sprite */}
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted/50">
          <PokemonSprite
            src={pokemon.spriteNormal}
            alt={pokemon.name}
            size={48}
            className="h-full w-full object-contain p-0.5"
          />
        </div>

        {/* name + badges + meta */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate text-xs font-semibold text-foreground">{pokemon.name}</p>
            <span className="flex-shrink-0 text-[10px] font-medium tabular-nums text-muted-foreground/60">
              {score}pt
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <TypeBadge type={pokemon.primaryType} />
            {pokemon.secondaryType ? <TypeBadge type={pokemon.secondaryType} /> : null}
          </div>
          {matchedRoles.length > 0 ? (
            <p className="text-[10px] text-primary/80">
              {matchedRoles
                .slice(0, 2)
                .map((r) => ROLE_LABELS[r] ?? r.replaceAll("_", " "))
                .join(" · ")}
              {matchedRoles.length > 2 ? ` +${matchedRoles.length - 2}` : ""}
            </p>
          ) : null}
        </div>
      </div>

      {/* reasons */}
      {positiveReasons.length > 0 ? (
        <div className="flex flex-col gap-0.5 pl-0.5">
          {positiveReasons.map((reason, idx) => (
            <ReasonPill key={idx} reason={reason} />
          ))}
        </div>
      ) : null}

      {/* action */}
      <Button
        type="button"
        variant={state === "added" ? "outline" : "secondary"}
        size="sm"
        className={cn(
          "h-8 w-full gap-1.5 text-xs",
          state === "added" && "border-emerald-500/40 text-emerald-400",
          state === "error" && "border-destructive/40 text-destructive",
        )}
        disabled={state === "adding" || state === "added"}
        onClick={handleAdd}
      >
        {state === "adding" ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : state === "added" ? (
          <>Added to team</>
        ) : state === "error" ? (
          <>Team full</>
        ) : (
          <>
            <Plus className="size-3.5" aria-hidden />
            Add to Team
          </>
        )}
      </Button>
    </div>
  );
});

// ─── filters row ──────────────────────────────────────────────────────────────

const FiltersRow = memo(function FiltersRow({
  filters,
  setFilters,
}: {
  filters: RecommendationFilters;
  setFilters: (f: Partial<RecommendationFilters>) => void;
}) {
  const selectCls = cn(
    "h-7 min-w-0 flex-1 rounded-lg border border-border/50 bg-background/60 px-2 text-xs text-foreground",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  );

  return (
    <div className="flex flex-col gap-2">
      {/* row 1 – type / generation / role */}
      <div className="flex flex-wrap gap-1.5">
        <select
          aria-label="Filter by type"
          value={filters.type}
          onChange={(e) => setFilters({ type: (e.target.value || "all") as PokemonType | "all" })}
          className={selectCls}
        >
          <option value="all">All types</option>
          {ALL_POKEMON_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by generation"
          value={filters.generation === "all" ? "all" : String(filters.generation)}
          onChange={(e) =>
            setFilters({ generation: e.target.value === "all" ? "all" : Number(e.target.value) })
          }
          className={selectCls}
        >
          <option value="all">All gens</option>
          {GENERATIONS.map((g) => (
            <option key={g} value={g}>
              Gen {g}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by role"
          value={filters.role}
          onChange={(e) => setFilters({ role: (e.target.value || "all") as TeamRole | "all" })}
          className={selectCls}
        >
          <option value="all">All roles</option>
          {(Object.keys(ROLE_LABELS) as TeamRole[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      {/* row 2 – legendary toggle */}
      <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <input
          type="checkbox"
          checked={filters.excludeLegendaryOrMythical}
          onChange={(e) => setFilters({ excludeLegendaryOrMythical: e.target.checked })}
          className="h-3.5 w-3.5 rounded border-border accent-primary"
        />
        Exclude legendary / mythical
      </label>

      {/* row 3 – speed tier quick filter */}
      <div className="flex items-center gap-1.5">
        <span className="flex-shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
          Speed
        </span>
        <div className="flex flex-wrap gap-1">
          {STAT_TIERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilters({ speedTier: value })}
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                filters.speedTier === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

// ─── main panel ───────────────────────────────────────────────────────────────

export function RecommendationPanel() {
  const team = useTeamStore((s) => s.team);
  const filters = useRecommendationStore((state) => state.filters);
  const results = useRecommendationStore((state) => state.results);
  const isLoading = useRecommendationStore((state) => state.isLoading);
  const error = useRecommendationStore((state) => state.error);
  const setFilters = useRecommendationStore((state) => state.setFilters);
  const setResults = useRecommendationStore((state) => state.setResults);
  const setIsLoading = useRecommendationStore((state) => state.setIsLoading);
  const setError = useRecommendationStore((state) => state.setError);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const formatRules = FORMAT_RULES[team.format];

  const activePokemonCount = useMemo(
    () => team.pokemon.filter((slot) => slot.pokemon !== null).length,
    [team.pokemon],
  );

  const effectiveFilters = useMemo(
    () => ({ ...filters, format: team.format }),
    [filters, team.format],
  );

  const executeFetch = useCallback(
    async (currentFilters: RecommendationFilters, signal?: AbortSignal) => {
      if (activePokemonCount === 0) {
        setResults([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fetched = await fetchRecommendations(team, currentFilters, signal);
        setResults(fetched);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [activePokemonCount, setError, setIsLoading, setResults, team],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void executeFetch(effectiveFilters, controller.signal);
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [effectiveFilters, executeFetch]);

  const handleSetFilters = useCallback(
    (partial: Partial<RecommendationFilters>) => {
      setFilters(partial);
    },
    [setFilters],
  );

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-md">
      {/* panel header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <Lightbulb className="size-4 text-yellow-400/80" aria-hidden />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Recommendations</h2>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Tuned for {formatRules.label}: {formatRules.recommendationSummary}
            </p>
          </div>
          {activePokemonCount > 0 ? (
            <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {results.length}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFiltersOpen((prev) => !prev)}
            aria-expanded={filtersOpen}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              filtersOpen
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Filters
            {filtersOpen ? (
              <ChevronUp className="size-3" aria-hidden />
            ) : (
              <ChevronDown className="size-3" aria-hidden />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              void executeFetch(effectiveFilters);
            }}
            disabled={isLoading || activePokemonCount === 0}
            aria-label="Refresh recommendations"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
              "text-muted-foreground hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} aria-hidden />
          </button>
        </div>
      </div>

      {/* filters drawer */}
      {filtersOpen ? (
        <div className="rounded-xl border border-border/40 bg-background/25 p-3">
          <FiltersRow filters={filters} setFilters={handleSetFilters} />
        </div>
      ) : null}

      {/* body */}
      {activePokemonCount === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground/60">
          Add Pokémon to your team to see suggestions.
        </p>
      ) : isLoading && results.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Analyzing team…
        </div>
      ) : error ? (
        <ErrorMessage
          title="Recommendations unavailable"
          message={error}
          onRetry={() => {
            void executeFetch(effectiveFilters);
          }}
          isRetrying={isLoading}
        />
      ) : results.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground/60">
          No candidates match the current filters.
        </p>
      ) : (
        <div
          className={cn(
            "flex flex-col gap-2 overflow-y-auto",
            results.length > 4 && "max-h-[520px] pr-0.5",
          )}
        >
          {results.map((result) => (
            <RecommendationCard key={result.pokemon.slug} result={result} />
          ))}
        </div>
      )}

      {/* footer hint */}
      {!isLoading && results.length > 0 ? (
        <p className="text-center text-[10px] text-muted-foreground/40">
          Ranked by {formatRules.label.toLowerCase()} fit · updating as your team changes
        </p>
      ) : null}
    </section>
  );
}
