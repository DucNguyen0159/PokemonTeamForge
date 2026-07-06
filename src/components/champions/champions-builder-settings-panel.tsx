"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CHAMPIONS_CORE_RULES } from "@/data/champions";
import { CHAMPIONS_BUILDER_PLANS_HREF } from "@/data/champions";
import { useChampionsTeamStore } from "@/store/champions-team-store";

export function ChampionsBuilderSettingsPanel() {
  const team = useChampionsTeamStore((state) => state.team);
  const clearTeam = useChampionsTeamStore((state) => state.clearTeam);
  const setTeamName = useChampionsTeamStore((state) => state.setTeamName);
  const setTeamNotes = useChampionsTeamStore((state) => state.setTeamNotes);
  const setFormatSupport = useChampionsTeamStore((state) => state.setFormatSupport);
  const setFormat = useChampionsTeamStore((state) => state.setFormat);
  const setRulesetId = useChampionsTeamStore((state) => state.setRulesetId);

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/70 p-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Team settings</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Name, format, and notes for your Champions cloud save.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Team name</span>
          <input
            value={team.name}
            onChange={(event) => setTeamName(event.target.value)}
            className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Format support</span>
          <select
            value={team.formatSupport}
            onChange={(event) => setFormatSupport(event.target.value as "single" | "double" | "both")}
            className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
          >
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="both">Both</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Default battle format</span>
          <select
            value={team.format}
            onChange={(event) => setFormat(event.target.value as "singles" | "doubles")}
            className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
          >
            <option value="singles">Singles</option>
            <option value="doubles">Doubles</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Ruleset</span>
          <input
            value={team.rulesetId}
            onChange={(event) => setRulesetId(event.target.value)}
            className="w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Team notes</span>
        <textarea
          value={team.teamNotes ?? ""}
          onChange={(event) => setTeamNotes(event.target.value)}
          className="min-h-24 w-full rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-sm"
          placeholder="General team notes, matchup reminders, and plan guidance..."
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={clearTeam}>
          Clear team
        </Button>
        <Button asChild variant="ghost">
          <Link href={CHAMPIONS_BUILDER_PLANS_HREF}>Open Battle Plans</Link>
        </Button>
      </div>

      <details className="rounded-xl border border-border/50 bg-background/30 p-3">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
          Champions rules reminder
        </summary>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {CHAMPIONS_CORE_RULES.map((rule) => (
            <li key={rule}>- {rule}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
