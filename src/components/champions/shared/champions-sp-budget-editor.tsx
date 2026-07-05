"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/utils";
import {
  CHAMPIONS_SP_BUDGET,
  CHAMPIONS_SP_STAT_CAP,
  clampSpValue,
  slotSpTotal,
  spBudgetStatus,
} from "@/lib/champions/sp-budget";
import type { ChampionsSpSpread } from "@/types/champions";

const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"] as const;

const STAT_LABELS: Record<(typeof STAT_KEYS)[number], string> = {
  hp: "HP",
  atk: "ATK",
  def: "DEF",
  spa: "SPA",
  spd: "SPD",
  spe: "SPE",
};

const ROLE_PRESETS: Array<{ label: string; sp: ChampionsSpSpread }> = [
  { label: "Physical", sp: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 } },
  { label: "Special", sp: { hp: 0, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 } },
  { label: "Bulky", sp: { hp: 32, atk: 0, def: 32, spa: 0, spd: 2, spe: 0 } },
  { label: "TR slow", sp: { hp: 32, atk: 32, def: 0, spa: 32, spd: 0, spe: 0 } },
];

function StatStepper({
  label,
  value,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
  onInput,
}: {
  label: string;
  value: number;
  canDecrease: boolean;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onInput: (next: number) => number;
}) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDraft(String(value));
    }
  }, [focused, value]);

  function commitDraft(raw: string): number {
    const parsed = raw.trim() === "" ? 0 : Number.parseInt(raw, 10) || 0;
    const applied = onInput(parsed);
    setDraft(String(applied));
    return applied;
  }

  return (
    <div className="space-y-1">
      <span className="block text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center overflow-hidden rounded-lg border border-border/50 bg-background/35">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={!canDecrease}
          onClick={onDecrease}
          className="flex h-9 w-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-background/60 disabled:opacity-25"
        >
          <Minus className="size-3.5" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label={`${label} SP`}
          value={draft}
          onFocus={() => {
            setFocused(true);
            setDraft(String(value));
          }}
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, "").slice(0, 2);
            setDraft(next);
            if (next !== "") {
              commitDraft(next);
            }
          }}
          onBlur={() => {
            commitDraft(draft);
            setFocused(false);
          }}
          className="h-9 min-w-0 w-full border-0 bg-transparent text-center text-sm font-semibold tabular-nums leading-none text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={!canIncrease}
          onClick={onIncrease}
          className="flex h-9 w-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-background/60 disabled:opacity-25"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function ChampionsSpBudgetEditor({
  sp,
  onChange,
  onApplySpread,
  onReset,
  layout = "default",
  showRoleChips = true,
}: {
  sp: ChampionsSpSpread;
  onChange: (stat: keyof ChampionsSpSpread, value: number) => void;
  onApplySpread?: (spread: ChampionsSpSpread) => void;
  onReset?: () => void;
  layout?: "default" | "slot";
  showRoleChips?: boolean;
}) {
  const total = slotSpTotal(sp);
  const remaining = CHAMPIONS_SP_BUDGET - total;
  const status = spBudgetStatus(total);
  const isSlot = layout === "slot";

  function stepStat(stat: keyof ChampionsSpSpread, delta: number) {
    const applied = clampSpValue(sp, stat, sp[stat] + delta)[stat];
    onChange(stat, applied);
  }

  function applyStatInput(stat: keyof ChampionsSpSpread, next: number) {
    const applied = clampSpValue(sp, stat, next)[stat];
    onChange(stat, applied);
    return applied;
  }

  const statGrid = (
    <div className={cn("grid gap-2", isSlot ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-6")}>
      {STAT_KEYS.map((stat) => {
        const otherTotal = total - sp[stat];
        const canDecrease = sp[stat] > 0;
        const canIncrease = sp[stat] < CHAMPIONS_SP_STAT_CAP && otherTotal < CHAMPIONS_SP_BUDGET;

        return (
          <StatStepper
            key={stat}
            label={STAT_LABELS[stat]}
            value={sp[stat]}
            canDecrease={canDecrease}
            canIncrease={canIncrease}
            onDecrease={() => stepStat(stat, -1)}
            onIncrease={() => stepStat(stat, 1)}
            onInput={(next) => applyStatInput(stat, next)}
          />
        );
      })}
    </div>
  );

  if (isSlot) {
    return (
      <div className="space-y-2.5">
        {statGrid}
        {(showRoleChips && onApplySpread) || onReset ? (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border/30 pt-2">
            {showRoleChips && onApplySpread
              ? ROLE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onApplySpread(preset.sp)}
                    className="rounded-md border border-border/40 bg-background/30 px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-border/70 hover:text-foreground"
                  >
                    {preset.label}
                  </button>
                ))
              : null}
            {onReset ? (
              <button
                type="button"
                onClick={onReset}
                className="rounded-md px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Reset
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  const barPercent = Math.min(100, Math.round((total / CHAMPIONS_SP_BUDGET) * 100));
  const barColor =
    status === "error"
      ? "bg-rose-500"
      : status === "warning"
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Spread
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums",
            status === "error" && "bg-rose-500/15 text-rose-200",
            status === "warning" && "bg-amber-500/15 text-amber-100",
            status === "ok" && "bg-emerald-500/15 text-emerald-100",
          )}
        >
          {remaining === 0 ? "Budget full" : `${remaining} SP left`} · {total}/{CHAMPIONS_SP_BUDGET}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted/60"
        role="progressbar"
        aria-valuenow={total}
        aria-valuemin={0}
        aria-valuemax={CHAMPIONS_SP_BUDGET}
        aria-label="SP budget"
      >
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${barPercent}%` }} />
      </div>
      {statGrid}
    </div>
  );
}

export function applyClampedSpread(
  current: ChampionsSpSpread,
  next: ChampionsSpSpread,
): ChampionsSpSpread {
  let result = { ...current };
  for (const stat of STAT_KEYS) {
    result = clampSpValue(result, stat, next[stat]);
  }
  return result;
}
