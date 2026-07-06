"use client";

import Link from "next/link";

import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { isLikelyMegaStone } from "@/lib/champions/ruleset-legality";
import type { ChampionsPokemon } from "@/types/champions";
import type { PokemonSummary } from "@/types/pokemon";
import { cn } from "@/utils";

function formatTypeLabel(summary: PokemonSummary | null): string {
  if (!summary) {
    return "Empty slot";
  }
  const types = [summary.primaryType, summary.secondaryType].filter(Boolean).join("/");
  return types || summary.name;
}

export function ChampionsRosterSlotTile({
  slot,
  summary,
  spTotal,
  isSelected = false,
  isLoading = false,
  size = "md",
  href,
  onSelect,
  showMegaIndicator = false,
  showSpRing = false,
  hasLegalityError = false,
}: {
  slot: ChampionsPokemon;
  summary: PokemonSummary | null;
  spTotal?: number;
  isSelected?: boolean;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
  onSelect?: (slotNumber: number) => void;
  showMegaIndicator?: boolean;
  showSpRing?: boolean;
  hasLegalityError?: boolean;
}) {
  const filled = slot.pokemonName.trim().length > 0;
  const isMega = Boolean(slot.item?.trim() && isLikelyMegaStone(slot.item));
  const sp = spTotal ?? 0;
  const spPercent = filled ? Math.min(100, Math.round((sp / 66) * 100)) : 0;

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-14 w-14",
    lg: "h-16 w-16",
  };

  const ariaLabel = filled
    ? `Slot ${slot.slot}: ${slot.pokemonName}, ${formatTypeLabel(summary)}`
    : `Slot ${slot.slot}: empty`;

  const inner = (
    <div
      className={cn(
        "group relative flex flex-col items-center gap-1 rounded-xl border p-1 transition-colors",
        isSelected
          ? "border-foreground/80 bg-background/60 shadow-sm"
          : hasLegalityError
            ? "border-rose-500/50 bg-rose-500/5"
            : "border-border/50 bg-background/40 hover:border-border/80 hover:bg-background/60",
        !filled && "border-dashed",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-muted/40",
          sizeClasses[size],
        )}
      >
        {isLoading && filled && !summary ? (
          <div className="h-full w-full animate-pulse bg-muted/60" />
        ) : summary?.spriteNormal ? (
          <PokemonSprite
            src={summary.spriteNormal}
            alt={slot.pokemonName}
            size={size === "lg" ? 64 : size === "md" ? 56 : 48}
            className="h-full w-full object-contain p-0.5"
          />
        ) : filled ? (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            ?
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-muted-foreground">
            {slot.slot}
          </div>
        )}
        {showMegaIndicator && isMega ? (
          <span
            className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-amber-400 ring-1 ring-background"
            title="Mega Stone equipped"
            aria-hidden
          />
        ) : null}
        {showSpRing && filled && spPercent > 0 && spPercent < 100 ? (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 36 36"
            aria-hidden
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border/30"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${(spPercent / 100) * 100.53} 100.53`}
              className="text-muted-foreground/50"
            />
          </svg>
        ) : null}
      </div>
      {size !== "sm" && filled ? (
        <div className="max-w-[4.5rem] truncate text-center text-[9px] font-medium text-foreground">
          {slot.pokemonName}
        </div>
      ) : null}
      {size === "lg" && summary ? (
        <div className="flex gap-0.5">
          <TypeBadge type={summary.primaryType} className="scale-90" />
          {summary.secondaryType ? (
            <TypeBadge type={summary.secondaryType} className="scale-90" />
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className="block shrink-0">
        {inner}
      </Link>
    );
  }

  if (onSelect) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={isSelected}
        onClick={() => onSelect(slot.slot)}
        className="block shrink-0 text-left"
      >
        {inner}
      </button>
    );
  }

  return (
    <div aria-label={ariaLabel} className="shrink-0">
      {inner}
    </div>
  );
}
