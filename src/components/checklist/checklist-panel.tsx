"use client";

import { CheckCircle2, Circle } from "lucide-react";

import { FORMAT_RULES } from "@/data/format-rules";
import { calculateTeamChecklist } from "@/lib/calculations";
import { useTeamStore } from "@/store/team-store";
import type { ChecklistItem, ChecklistSection } from "@/types/checklist";
import { cn } from "@/utils";

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const icon = item.isCompleted ? (
    <CheckCircle2 className="size-4 text-green-400" aria-hidden />
  ) : (
    <Circle className="size-4 text-muted-foreground/30" aria-hidden />
  );

  return (
    <div className="flex items-start gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.03]">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-medium leading-snug",
            item.isCompleted ? "text-foreground" : "text-foreground/70",
          )}
        >
          {item.label}
        </p>
        <p className="text-xs text-muted-foreground/60">{item.description}</p>
        {item.matchedPokemon.length > 0 ? (
          <p className="mt-1 text-[10px] text-green-400/75">
            {item.matchedPokemon
              .slice(0, 2)
              .map((match) => `${match.pokemonName} (${match.reason})`)
              .join(" · ")}
            {item.matchedPokemon.length > 2 ? ` +${item.matchedPokemon.length - 2}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ChecklistSectionBlock({ section }: { section: ChecklistSection }) {
  const completed = section.items.filter((item) => item.isCompleted).length;

  return (
    <div className="rounded-xl border border-border/40 bg-background/20 p-2">
      <div className="mb-1 flex items-center justify-between px-1">
        <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {section.title}
        </h3>
        <span className="text-[10px] tabular-nums text-muted-foreground/60">
          {completed}/{section.items.length}
        </span>
      </div>
      <div className="-mx-1 flex flex-col">
        {section.items.map((item) => (
          <ChecklistRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export function ChecklistPanel() {
  const team = useTeamStore((state) => state.team);
  const checklist = calculateTeamChecklist(team, team.format);
  const formatRules = FORMAT_RULES[team.format];

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {formatRules.label} Checklist
          </h2>
          <p className="mt-1 text-xs text-muted-foreground/70">{formatRules.checklistSummary}</p>
        </div>
        <span className="rounded-full border border-border/50 bg-background/40 px-2 py-1 text-xs font-medium tabular-nums text-muted-foreground">
          {checklist.completionPercentage}%
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {checklist.sections.map((section) => (
          <ChecklistSectionBlock key={section.id} section={section} />
        ))}
      </div>

      <p className="mt-1 text-center text-xs text-muted-foreground/50">
        Updates from selected moves, Pokemon roles, and the current format.
      </p>
    </section>
  );
}
