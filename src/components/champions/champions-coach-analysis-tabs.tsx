"use client";

import { cn } from "@/utils";

export type CoachAnalysisTab = "overview" | "defensive" | "offensive" | "speed" | "plans";

export const COACH_ANALYSIS_TABS: Array<{ id: CoachAnalysisTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "defensive", label: "Defensive" },
  { id: "offensive", label: "Offensive" },
  { id: "speed", label: "Speed" },
  { id: "plans", label: "Plans" },
];

export function ChampionsCoachAnalysisTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: CoachAnalysisTab;
  onTabChange: (tab: CoachAnalysisTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Coach analysis sections"
      className="flex gap-1 overflow-x-auto rounded-xl border border-border/60 bg-card/50 p-1"
    >
      {COACH_ANALYSIS_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={cn(
            "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
          )}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function coachTabNeedsFullDetails(tab: CoachAnalysisTab): boolean {
  return tab === "offensive" || tab === "plans" || tab === "speed" || tab === "defensive";
}
