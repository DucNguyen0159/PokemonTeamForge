"use client";

import { X } from "lucide-react";

import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { Button } from "@/components/ui/button";
import {
  formatSupportLabel,
  type ChampionsPreset,
} from "@/data/champions-presets";
import { getPresetSpeciesDisplay } from "@/data/champions-preset-display";
import { formatLabel } from "@/lib/champions/battle-plan-utils";

export function ChampionsPresetPreviewDrawer({
  preset,
  open,
  onClose,
  onLoad,
  isLoading,
}: {
  preset: ChampionsPreset | null;
  open: boolean;
  onClose: () => void;
  onLoad: () => void;
  isLoading?: boolean;
}) {
  if (!open || !preset) {
    return null;
  }

  const filledSlots = preset.team.pokemon.filter((slot) => slot.pokemonName.trim());

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        aria-label="Close preview"
        onClick={onClose}
      />
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border/60 bg-card shadow-2xl"
        role="dialog"
        aria-labelledby="preset-preview-title"
      >
        <div className="flex items-start justify-between gap-2 border-b border-border/60 p-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Preset preview
            </p>
            <h2 id="preset-preview-title" className="text-base font-semibold text-foreground">
              {preset.name}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{preset.shortDescription}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={onClose}>
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            {formatSupportLabel(preset.formatSupport)} · {preset.team.battlePlans.length} plan
            {preset.team.battlePlans.length === 1 ? "" : "s"}
          </p>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Roster
            </h3>
            <div className="mt-2 grid gap-2">
              {filledSlots.map((slot) => {
                const display = getPresetSpeciesDisplay(slot.pokemonName);
                return (
                  <div
                    key={slot.id}
                    className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/35 p-2"
                  >
                    <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-muted/40">
                      {display?.spriteNormal ? (
                        <PokemonSprite
                          src={display.spriteNormal}
                          alt={slot.pokemonName}
                          size={36}
                          className="h-full w-full object-contain"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{slot.pokemonName}</p>
                      {display ? (
                        <div className="mt-0.5 flex gap-1">
                          <TypeBadge type={display.primaryType} size="sm" />
                          {display.secondaryType ? (
                            <TypeBadge type={display.secondaryType} size="sm" />
                          ) : null}
                        </div>
                      ) : null}
                      {slot.item?.trim() ? (
                        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                          {slot.item}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {preset.team.battlePlans.length > 0 ? (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Battle plans
              </h3>
              <ul className="mt-2 space-y-2">
                {preset.team.battlePlans.map((plan) => (
                  <li
                    key={plan.id}
                    className="rounded-xl border border-border/50 bg-background/35 px-3 py-2 text-xs"
                  >
                    <p className="font-medium text-foreground">{plan.name}</p>
                    <p className="text-muted-foreground">
                      {formatLabel(plan.format)} · {plan.matchupLabel}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="border-t border-border/60 p-4">
          <Button className="w-full rounded-xl" onClick={onLoad} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load into Team Builder"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
