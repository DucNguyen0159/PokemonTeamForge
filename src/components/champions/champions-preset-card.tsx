"use client";

import { Loader2 } from "lucide-react";

import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { Button } from "@/components/ui/button";
import {
  formatSupportLabel,
  type ChampionsPreset,
} from "@/data/champions-presets";
import {
  getPresetSpeciesDisplay,
  type ChampionsPresetSpeciesDisplay,
} from "@/data/champions-preset-display";
import { difficultyLabel, presetAccentClasses } from "@/lib/champions/preset-ui";
import { cn } from "@/utils";

function RosterTile({
  name,
  item,
  display,
}: {
  name: string;
  item?: string;
  display: ChampionsPresetSpeciesDisplay | null;
}) {
  if (!name.trim()) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-background/35 p-2">
      <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-muted/40">
        {display?.spriteNormal ? (
          <PokemonSprite
            src={display.spriteNormal}
            alt={name}
            size={36}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            ?
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">{name}</p>
        {display ? (
          <div className="mt-0.5 flex gap-1">
            <TypeBadge type={display.primaryType} />
            {display.secondaryType ? <TypeBadge type={display.secondaryType} /> : null}
          </div>
        ) : null}
        {item?.trim() ? (
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{item}</p>
        ) : null}
      </div>
    </div>
  );
}

export function ChampionsPresetCard({
  preset,
  onLoad,
  onPreview,
  isLoading,
}: {
  preset: ChampionsPreset;
  onLoad: () => void;
  onPreview?: () => void;
  isLoading: boolean;
}) {
  const filledSlots = preset.team.pokemon.filter((slot) => slot.pokemonName.trim());
  const planCount = preset.team.battlePlans.length;
  const featuredMegaDisplay = preset.featuredMega
    ? getPresetSpeciesDisplay(preset.featuredMega.species)
    : null;

  return (
    <article
      className={cn(
        "space-y-3 rounded-2xl border border-border/60 border-t-4 bg-card/70 p-4 shadow-sm transition-shadow hover:shadow-md",
        presetAccentClasses(preset.accentTheme),
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">{preset.name}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{preset.shortDescription}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border/50 bg-background/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {formatSupportLabel(preset.formatSupport)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {preset.styleTags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary/90"
          >
            {tag}
          </span>
        ))}
        <span className="rounded-full border border-border/50 bg-background/35 px-2 py-0.5 text-[10px] text-muted-foreground">
          {planCount} plan{planCount === 1 ? "" : "s"}
        </span>
        {preset.difficulty ? (
          <span className="rounded-full border border-border/50 bg-background/35 px-2 py-0.5 text-[10px] text-muted-foreground">
            {difficultyLabel(preset.difficulty)}
          </span>
        ) : null}
      </div>

      {preset.bestFor ? (
        <p className="text-[11px] text-muted-foreground">
          Best for: <span className="text-foreground/90">{preset.bestFor}</span>
        </p>
      ) : null}

      {preset.featuredMega ? (
        <div className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2">
          {featuredMegaDisplay?.spriteNormal ? (
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-background/60">
              <PokemonSprite
                src={featuredMegaDisplay.spriteNormal}
                alt={preset.featuredMega.species}
                size={40}
                className="h-full w-full object-contain p-0.5"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40 text-[10px] text-muted-foreground">
              ?
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-primary/80">
              Featured Mega
            </p>
            <p className="truncate text-xs font-semibold text-foreground">
              {preset.featuredMega.species}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">{preset.featuredMega.item}</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        {filledSlots.map((slot) => (
          <RosterTile
            key={slot.id}
            name={slot.pokemonName}
            item={slot.item}
            display={getPresetSpeciesDisplay(slot.pokemonName)}
          />
        ))}
      </div>

      {planCount > 0 ? (
        <div className="rounded-xl border border-border/45 bg-background/30 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Included plans
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-foreground">
            {preset.team.battlePlans.slice(0, 3).map((plan) => (
              <li key={plan.id}>
                {plan.format === "single" ? "Singles" : "Doubles"} · {plan.name}
                {plan.matchupLabel && plan.matchupLabel !== plan.name
                  ? ` (${plan.matchupLabel})`
                  : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          size="sm"
          className="h-9 flex-1 rounded-xl text-xs"
          onClick={onLoad}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin" />
              Loading...
            </span>
          ) : (
            "Load into Champions Builder"
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-9 flex-1 rounded-xl text-xs"
          onClick={onPreview}
        >
          Preview
        </Button>
      </div>
    </article>
  );
}
