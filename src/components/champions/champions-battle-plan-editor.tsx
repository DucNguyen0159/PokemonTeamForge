"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Trash2 } from "lucide-react";

import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { Button } from "@/components/ui/button";
import { evaluateBattlePlanQuality } from "@/lib/champions/battle-plan-quality";
import {
  formatLabel,
  getFormatLimits,
  togglePlanBackup,
  togglePlanLead,
  togglePlanSelection,
  type SlotOption,
} from "@/lib/champions/battle-plan-utils";
import { useChampionsTeamStore } from "@/store/champions-team-store";
import type { ChampionsBattlePlan } from "@/types/champions";
import type { PokemonDetail } from "@/types/pokemon";
import { cn } from "@/utils";

function PlanMemberCard({
  option,
  detail,
  isSelected,
  isLead,
  isBackup,
  onToggleSelected,
  onToggleLead,
  onToggleBackup,
  canLead,
  canBackup,
}: {
  option: SlotOption;
  detail: PokemonDetail | null;
  isSelected: boolean;
  isLead: boolean;
  isBackup: boolean;
  onToggleSelected: () => void;
  onToggleLead: () => void;
  onToggleBackup: () => void;
  canLead: boolean;
  canBackup: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border p-2.5 transition-colors",
        isSelected ? "border-primary/45 bg-primary/10" : "border-border/50 bg-background/30",
      )}
    >
      <button
        type="button"
        onClick={onToggleSelected}
        className="flex w-full items-center gap-2 text-left"
      >
        {detail ? (
          <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-border/50 bg-background/60">
            <PokemonSprite
              src={detail.spriteNormal}
              alt={detail.name}
              size={36}
              className="h-full w-full object-contain"
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">{option.slot.pokemonName}</p>
          <p className="text-[10px] text-muted-foreground">Slot {option.slot.slot}</p>
          {detail ? (
            <div className="mt-1 flex flex-wrap gap-1">
              <TypeBadge type={detail.primaryType} />
              {detail.secondaryType ? <TypeBadge type={detail.secondaryType} /> : null}
            </div>
          ) : null}
        </div>
      </button>
      {isSelected ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={!canLead}
            onClick={onToggleLead}
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
              isLead
                ? "bg-amber-500/20 text-amber-100"
                : "bg-background/60 text-muted-foreground hover:text-foreground",
            )}
          >
            Lead
          </button>
          <button
            type="button"
            disabled={!canBackup}
            onClick={onToggleBackup}
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
              isBackup
                ? "bg-sky-500/20 text-sky-100"
                : "bg-background/60 text-muted-foreground hover:text-foreground",
            )}
          >
            Backup
          </button>
        </div>
      ) : null}
    </article>
  );
}

const NOTE_TEXTAREA_CLASS =
  "w-full resize-none rounded-xl border bg-background/45 px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function PlanNoteTextarea({
  planId,
  value,
  onCommit,
  label,
  hint,
  placeholder,
  minHeightClass,
  highlightWhenEmpty = false,
}: {
  planId: string;
  value: string;
  onCommit: (next: string) => void;
  label: string;
  hint?: string;
  placeholder?: string;
  minHeightClass: string;
  highlightWhenEmpty?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [planId, value]);

  useEffect(
    () => () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    },
    [],
  );

  const commit = useCallback(
    (next: string) => {
      if (next !== value) {
        onCommit(next);
      }
    },
    [onCommit, value],
  );

  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {hint ? <span className="block text-[11px] text-muted-foreground">{hint}</span> : null}
      <textarea
        value={draft}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          if (debounceRef.current) {
            clearTimeout(debounceRef.current);
          }
          debounceRef.current = setTimeout(() => commit(next), 300);
        }}
        onBlur={() => {
          if (debounceRef.current) {
            clearTimeout(debounceRef.current);
          }
          commit(draft);
        }}
        placeholder={placeholder}
        className={cn(
          NOTE_TEXTAREA_CLASS,
          minHeightClass,
          "max-h-40 overflow-y-auto",
          highlightWhenEmpty && !draft.trim()
            ? "border-dashed border-amber-500/30"
            : "border-border/60",
        )}
      />
    </label>
  );
}

function PlanStrategyNotes({
  plan,
  onUpdate,
}: {
  plan: ChampionsBattlePlan;
  onUpdate: (patch: Partial<Pick<ChampionsBattlePlan, "winConditionNote" | "avoidNote" | "generalNote">>) => void;
}) {
  return (
    <section className="mt-3 rounded-xl border border-border/50 bg-background/30 p-3">
      <h3 className="text-xs font-semibold text-foreground">Strategy notes</h3>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        How this plan wins, what to avoid, and anything else for match day.
      </p>
      <div className="mt-3 space-y-3">
        <PlanNoteTextarea
          planId={plan.id}
          value={plan.winConditionNote ?? ""}
          onCommit={(winConditionNote) => onUpdate({ winConditionNote })}
          label="Win condition"
          hint="How this plan closes games"
          placeholder="How does this plan win?"
          minHeightClass="min-h-24"
          highlightWhenEmpty
        />
        <PlanNoteTextarea
          planId={plan.id}
          value={plan.avoidNote ?? ""}
          onCommit={(avoidNote) => onUpdate({ avoidNote })}
          label="Avoid"
          hint="Lines that lose or get punished"
          placeholder="What loses this matchup?"
          minHeightClass="min-h-16"
          highlightWhenEmpty
        />
        <PlanNoteTextarea
          planId={plan.id}
          value={plan.generalNote ?? ""}
          onCommit={(generalNote) => onUpdate({ generalNote })}
          label="General note (optional)"
          placeholder="Lead order, speed ties, item reminders…"
          minHeightClass="min-h-16"
        />
      </div>
    </section>
  );
}

export function ChampionsBattlePlanEditor({
  plan,
  slotOptions,
  pokemonDetailsBySlot,
  collapsed = false,
  onToggleCollapsed,
}: {
  plan: ChampionsBattlePlan;
  slotOptions: SlotOption[];
  pokemonDetailsBySlot: Record<number, PokemonDetail>;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const team = useChampionsTeamStore((state) => state.team);
  const updateBattlePlan = useChampionsTeamStore((state) => state.updateBattlePlan);
  const removeBattlePlan = useChampionsTeamStore((state) => state.removeBattlePlan);
  const duplicateBattlePlan = useChampionsTeamStore((state) => state.duplicateBattlePlan);
  const { selected: selectedLimit, leads: leadLimit } = getFormatLimits(plan.format);
  const qualityIssues = useMemo(
    () => evaluateBattlePlanQuality(plan, team, slotOptions),
    [plan, slotOptions, team],
  );
  const updatePlanNotes = useCallback(
    (patch: Partial<Pick<ChampionsBattlePlan, "winConditionNote" | "avoidNote" | "generalNote">>) => {
      updateBattlePlan(plan.id, patch);
    },
    [plan.id, updateBattlePlan],
  );

  if (collapsed) {
    return (
      <article className="rounded-2xl border border-border/60 bg-background/35 p-4">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onToggleCollapsed} className="min-w-0 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{plan.name || "Untitled Plan"}</h3>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                {formatLabel(plan.format)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{plan.matchupLabel || "No matchup label"}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Selected: {plan.selectedPokemonIds.length}/{selectedLimit} | Leads:{" "}
              {plan.leadPokemonIds.length}/{leadLimit}
            </p>
            {plan.winConditionNote ? (
              <p className="mt-2 line-clamp-2 text-xs text-foreground">
                Win: {plan.winConditionNote}
              </p>
            ) : null}
            {plan.avoidNote ? (
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                Avoid: {plan.avoidNote}
              </p>
            ) : null}
          </button>
          <div className="flex flex-shrink-0 gap-1">
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => duplicateBattlePlan(plan.id)}>
              <Copy className="size-3.5" aria-hidden />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => removeBattlePlan(plan.id)}>
              <Trash2 className="size-3.5" aria-hidden />
            </Button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-border/60 bg-background/35 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{plan.name || "Untitled Plan"}</p>
          <p className="text-xs text-muted-foreground">{formatLabel(plan.format)}</p>
        </div>
        <div className="flex gap-1">
          {onToggleCollapsed ? (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onToggleCollapsed}>
              Collapse
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => duplicateBattlePlan(plan.id)}>
            <Copy className="size-3.5" aria-hidden />
            Duplicate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={() => removeBattlePlan(plan.id)}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Remove
          </Button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Plan name</span>
          <input
            value={plan.name}
            onChange={(event) => updateBattlePlan(plan.id, { name: event.target.value })}
            className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Matchup label</span>
          <input
            value={plan.matchupLabel}
            onChange={(event) => updateBattlePlan(plan.id, { matchupLabel: event.target.value })}
            className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
            placeholder="vs Rain"
          />
        </label>
        <label className="block space-y-1 md:col-span-2">
          <span className="text-xs text-muted-foreground">Format</span>
          <select
            value={plan.format}
            onChange={(event) =>
              updateBattlePlan(plan.id, {
                format: event.target.value as "single" | "double",
                selectedPokemonIds: [],
                leadPokemonIds: [],
                backupPokemonIds: [],
              })
            }
            className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
          >
            <option value="single">Singles 3v3</option>
            <option value="double">Doubles 4v4</option>
          </select>
        </label>
      </div>

      <PlanStrategyNotes plan={plan} onUpdate={updatePlanNotes} />

      {slotOptions.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border/55 px-3 py-4 text-xs text-muted-foreground">
          Add Pokémon in Team Builder before selecting plan members.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-foreground">
              Selected ({plan.selectedPokemonIds.length}/{selectedLimit})
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Tap a roster member to include it, then mark leads and backups.
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {slotOptions.map((option) => (
                <PlanMemberCard
                  key={`${plan.id}-member-${option.token}`}
                  option={option}
                  detail={pokemonDetailsBySlot[option.slot.slot] ?? null}
                  isSelected={plan.selectedPokemonIds.includes(option.token)}
                  isLead={plan.leadPokemonIds.includes(option.token)}
                  isBackup={Boolean(plan.backupPokemonIds?.includes(option.token))}
                  onToggleSelected={() =>
                    updateBattlePlan(plan.id, togglePlanSelection(plan, option.token))
                  }
                  onToggleLead={() => updateBattlePlan(plan.id, togglePlanLead(plan, option.token))}
                  onToggleBackup={() => updateBattlePlan(plan.id, togglePlanBackup(plan, option.token))}
                  canLead={plan.leadPokemonIds.length < leadLimit || plan.leadPokemonIds.includes(option.token)}
                  canBackup={
                    (plan.backupPokemonIds?.length ?? 0) < selectedLimit ||
                    Boolean(plan.backupPokemonIds?.includes(option.token))
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {qualityIssues.length > 0 ? (
        <ul className="mt-3 space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
          {qualityIssues.map((issue) => (
            <li key={`${plan.id}-${issue.message}`}>- {issue.message}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
          Plan looks complete for current roster settings.
        </p>
      )}
    </article>
  );
}
