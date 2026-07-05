import { AlertTriangle, Sparkles } from "lucide-react";

import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import type { MegaDependencyInsight } from "@/lib/champions/matchup-coach-analysis";
import type { PokemonDetail } from "@/types/pokemon";
import { cn } from "@/utils";

export function MatchupCoachMegaWarning({
  insight,
  pokemonBySlot,
}: {
  insight: MegaDependencyInsight;
  pokemonBySlot: Map<number, PokemonDetail>;
}) {
  if (insight.megaUsers.length === 0) {
    return null;
  }

  return (
    <article
      className={cn(
        "rounded-2xl border p-4",
        insight.warnings.length > 0
          ? "border-violet-500/35 bg-violet-500/8"
          : "border-border/60 bg-card/70",
      )}
    >
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-foreground">Mega dependency</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Champions allows one Mega Evolution per battle — check your bring list aligns.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {insight.megaUsers.map((user) => {
          const detail = pokemonBySlot.get(user.slot);
          return (
            <div
              key={user.slot}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-2.5 py-2",
                user.inSelectedPlan
                  ? "border-violet-400/40 bg-background/50"
                  : "border-border/50 bg-background/30 opacity-80",
              )}
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-muted/40">
                {detail ? (
                  <PokemonSprite
                    src={detail.spriteNormal}
                    alt={user.name}
                    size={32}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                    ?
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user.megaItem}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                  user.inSelectedPlan
                    ? "bg-violet-500/20 text-violet-200"
                    : "bg-muted/50 text-muted-foreground",
                )}
              >
                {user.inSelectedPlan ? "In plan" : "Bench"}
              </span>
            </div>
          );
        })}
      </div>

      {insight.warnings.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {insight.warnings.map((warning) => (
            <li
              key={warning}
              className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2 text-xs text-foreground"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Mega lineup looks consistent with the current analysis scope.
        </p>
      )}
    </article>
  );
}
