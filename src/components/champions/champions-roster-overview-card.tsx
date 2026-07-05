"use client";

import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { ChampionsSpMiniRing } from "@/components/champions/shared/champions-sp-mini-ring";
import {
  getSlotCompletionStatus,
  SLOT_COMPLETION_LABEL,
} from "@/lib/champions/slot-completion";
import type { ChampionsPokemon } from "@/types/champions";
import type { PokemonDetail } from "@/types/pokemon";
import { cn } from "@/utils";

export function ChampionsRosterOverviewCard({
  slot,
  pokemonDetail,
  isActive,
  hasLegalityError,
  onSelect,
}: {
  slot: ChampionsPokemon;
  pokemonDetail: PokemonDetail | null;
  isActive?: boolean;
  hasLegalityError?: boolean;
  onSelect: () => void;
}) {
  const filledMoves = slot.moves.filter(Boolean);
  const hasPokemon = Boolean(slot.pokemonName.trim());
  const completion = getSlotCompletionStatus(slot);

  if (!hasPokemon) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "rounded-2xl border border-dashed border-border/60 bg-card/40 p-4 text-left transition-colors hover:border-primary/30 hover:bg-card/60",
          isActive && "ring-2 ring-primary/35",
        )}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Slot {slot.slot}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Empty — click to add</p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-2xl border border-border/60 bg-card/70 p-3 text-left transition-colors hover:border-primary/25",
        isActive && "border-primary/35 ring-2 ring-primary/25",
        hasLegalityError && "border-rose-500/40",
      )}
    >
      <div className="flex items-start gap-2">
        {pokemonDetail ? (
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-border/50 bg-background/60">
            <PokemonSprite
              src={pokemonDetail.spriteNormal}
              alt={pokemonDetail.name}
              size={40}
              className="h-full w-full object-contain p-0.5"
            />
            {hasLegalityError ? (
              <span
                className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-rose-500 ring-2 ring-card"
                aria-label="Has legality issue"
              />
            ) : null}
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 text-xs text-muted-foreground">
            ?
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-foreground">{slot.pokemonName}</p>
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                completion === "complete"
                  ? "bg-emerald-500/15 text-emerald-200"
                  : "bg-amber-500/15 text-amber-100",
              )}
            >
              {completion === "complete" ? SLOT_COMPLETION_LABEL.complete : SLOT_COMPLETION_LABEL.partial}
            </span>
          </div>
          {pokemonDetail ? (
            <div className="mt-0.5 flex flex-wrap gap-1">
              <TypeBadge type={pokemonDetail.primaryType} size="sm" />
              {pokemonDetail.secondaryType ? (
                <TypeBadge type={pokemonDetail.secondaryType} size="sm" />
              ) : null}
            </div>
          ) : null}
          {slot.item?.trim() ? (
            <p className="mt-1 truncate text-[10px] text-muted-foreground">{slot.item}</p>
          ) : null}
        </div>
        <ChampionsSpMiniRing sp={slot.sp} />
      </div>
      {filledMoves.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {filledMoves.map((move) => (
            <span
              key={move}
              className="rounded-full border border-border/50 bg-background/40 px-2 py-0.5 text-[10px] text-foreground"
            >
              {move}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[10px] text-muted-foreground">No moves set</p>
      )}
    </button>
  );
}
