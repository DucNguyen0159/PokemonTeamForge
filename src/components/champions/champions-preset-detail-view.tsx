"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChampionsShell } from "@/components/champions/champions-shell";
import { PageIntroChip } from "@/components/layout/page-intro";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { Button } from "@/components/ui/button";
import {
  formatSupportLabel,
  type ChampionsPreset,
} from "@/data/champions-presets";
import { getPresetSpeciesDisplay } from "@/data/champions-preset-display";
import { formatLabel } from "@/lib/champions/battle-plan-utils";
import { isLikelyMegaStone } from "@/lib/champions/ruleset-legality";
import { difficultyLabel, presetAccentClasses } from "@/lib/champions/preset-ui";
import { savePendingLoadedChampionsTeam } from "@/lib/team/pending-champions-team";
import { cn } from "@/utils";

function slotLabelForToken(preset: ChampionsPreset, token: string): string {
  const slotNumber = Number(token.replace("slot-", ""));
  const slot = preset.team.pokemon.find((entry) => entry.slot === slotNumber);
  return slot?.pokemonName ?? token;
}

export function ChampionsPresetDetailView({ preset }: { preset: ChampionsPreset }) {
  const router = useRouter();
  const filledCount = preset.team.pokemon.filter((slot) => slot.pokemonName.trim()).length;

  function handleLoad() {
    savePendingLoadedChampionsTeam(
      {
        ...preset.team,
        id: undefined,
        userId: undefined,
        isPublic: false,
        createdAt: undefined,
        updatedAt: undefined,
      },
      { sourcePresetId: preset.id, sourcePresetName: preset.name },
    );
    void router.push("/champions/builder");
  }

  return (
    <ChampionsShell
      eyebrow="Strategy Presets"
      title={preset.name}
      description={preset.shortDescription}
      chips={
        <>
          <PageIntroChip>{formatSupportLabel(preset.formatSupport)}</PageIntroChip>
          {preset.difficulty ? (
            <PageIntroChip>{difficultyLabel(preset.difficulty)}</PageIntroChip>
          ) : null}
          <PageIntroChip>{preset.team.battlePlans.length} battle plans</PageIntroChip>
        </>
      }
    >
      <section
        className={cn(
          "rounded-2xl border border-border/60 border-t-4 bg-card/70 p-4",
          presetAccentClasses(preset.accentTheme),
        )}
      >
        <div className="flex flex-wrap gap-2">
          {preset.styleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
        {preset.bestFor ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Best for: <span className="text-foreground">{preset.bestFor}</span>
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{filledCount}</span> Pokémon
          </span>
          <span>
            <span className="font-medium text-foreground">66</span> SP each
          </span>
          <span>
            <span className="font-medium text-foreground">{preset.team.battlePlans.length}</span>{" "}
            battle plans
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={handleLoad}>Load into Champions Builder</Button>
          <Button asChild variant="secondary">
            <Link href="/champions/presets">Back to presets</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Roster</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {preset.team.pokemon
            .filter((slot) => slot.pokemonName.trim())
            .map((slot) => {
              const display = getPresetSpeciesDisplay(slot.pokemonName);
              const isMega = Boolean(slot.item?.trim() && isLikelyMegaStone(slot.item));
              const spTotal =
                slot.sp.hp + slot.sp.atk + slot.sp.def + slot.sp.spa + slot.sp.spd + slot.sp.spe;
              return (
                <article
                  key={slot.id}
                  className="rounded-2xl border border-border/60 bg-background/35 p-4"
                >
                  <div className="flex items-start gap-3">
                    {display?.spriteNormal ? (
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-border/50 bg-background/60">
                        <PokemonSprite
                          src={display.spriteNormal}
                          alt={slot.pokemonName}
                          size={48}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/30 text-xs text-muted-foreground">
                        ?
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        Slot {slot.slot}: {slot.pokemonName}
                      </p>
                      {display ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          <TypeBadge type={display.primaryType} />
                          {display.secondaryType ? (
                            <TypeBadge type={display.secondaryType} />
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between gap-2">
                      <dt>Ability</dt>
                      <dd className="text-right text-foreground">{slot.ability || "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Item</dt>
                      <dd className="text-right text-foreground">
                        {slot.item || "—"}
                        {isMega ? (
                          <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0 text-[9px] font-medium text-primary">
                            Mega
                          </span>
                        ) : null}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Nature</dt>
                      <dd className="text-right text-foreground">{slot.statAlignment || "Serious"}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>SP total</dt>
                      <dd className="text-right text-foreground">{spTotal} / 66</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">Moves</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-foreground">
                    {slot.moves.map((move, idx) => (
                      <li key={`${slot.id}-move-${idx}`}>{move || "—"}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Battle Plans</h2>
        {preset.team.battlePlans.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/55 px-4 py-6 text-sm text-muted-foreground">
            No battle plans included with this preset.
          </p>
        ) : (
          <div className="grid gap-4">
            {preset.team.battlePlans.map((plan) => (
              <article
                key={plan.id}
                className="rounded-2xl border border-border/60 bg-background/35 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    {formatLabel(plan.format)}
                  </span>
                  {plan.matchupLabel ? (
                    <span className="text-xs text-muted-foreground">{plan.matchupLabel}</span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Selected:{" "}
                  {plan.selectedPokemonIds
                    .map((token) => slotLabelForToken(preset, token))
                    .join(", ") || "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Leads:{" "}
                  {plan.leadPokemonIds
                    .map((token) => slotLabelForToken(preset, token))
                    .join(", ") || "—"}
                </p>
                {plan.winConditionNote ? (
                  <p className="mt-2 text-xs text-foreground">
                    <span className="font-medium text-muted-foreground">Win: </span>
                    {plan.winConditionNote}
                  </p>
                ) : null}
                {plan.avoidNote ? (
                  <p className="mt-1 text-xs text-foreground">
                    <span className="font-medium text-muted-foreground">Avoid: </span>
                    {plan.avoidNote}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </ChampionsShell>
  );
}
