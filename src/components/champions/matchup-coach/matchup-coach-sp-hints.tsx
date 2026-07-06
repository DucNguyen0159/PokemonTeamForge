"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  applySpHintAction,
  type LeadSuggestion,
  type SpHint,
} from "@/lib/champions/matchup-coach-analysis";
import { useChampionsTeamStore } from "@/store/champions-team-store";

export function MatchupCoachSpHints({ hints }: { hints: SpHint[] }) {
  const router = useRouter();
  const team = useChampionsTeamStore((state) => state.team);
  const setSpBySlot = useChampionsTeamStore((state) => state.setSpBySlot);

  if (hints.length === 0) {
    return null;
  }

  function handleApply(hint: SpHint) {
    const slot = team.pokemon.find((entry) => entry.slot === hint.slot);
    if (!slot) {
      return;
    }
    const result = applySpHintAction(slot, hint.action, setSpBySlot);
    if (result === "open_builder") {
      void router.push(`/champions/builder?slot=${hint.slot}&focus=sp`);
      return;
    }
  }

  return (
    <article className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <h2 className="text-base font-semibold text-foreground">SP tuning hints</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Actionable suggestions only — apply in place or jump to Builder.
      </p>
      <ul className="mt-3 space-y-2">
        {hints.map((hint) => (
          <li
            key={`${hint.slot}-${hint.pokemonName}`}
            className="flex flex-col gap-2 rounded-xl border border-border/55 bg-background/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="text-sm">
              <span className="font-medium text-foreground">{hint.pokemonName}</span>
              <span className="text-muted-foreground"> — {hint.hint}</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="shrink-0"
              onClick={() => handleApply(hint)}
            >
              {hint.action.kind === "allocate_remaining" ? (
                <>
                  Open in Builder
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                  Apply
                </>
              )}
            </Button>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function MatchupCoachLeadSuggestions({ suggestions }: { suggestions: LeadSuggestion[] }) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <article className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <h2 className="text-base font-semibold text-foreground">Lead pair suggestions</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Saved plan leads when available, otherwise heuristic openings.
      </p>
      <div className="mt-3 space-y-2">
        {suggestions.map((pair) => (
          <div
            key={pair.pair}
            className="rounded-xl border border-border/55 bg-background/40 px-3 py-2"
          >
            <p className="text-sm font-medium text-foreground">{pair.pair}</p>
            <p className="text-xs text-muted-foreground">{pair.rationale}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
