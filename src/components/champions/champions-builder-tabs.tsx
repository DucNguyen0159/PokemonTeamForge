"use client";

import { BUILDER_TABS, type BuilderTab } from "@/lib/champions/builder-tabs";
import { cn } from "@/utils";

export function ChampionsBuilderTabs({
  activeTab,
  planCount,
  onTabChange,
}: {
  activeTab: BuilderTab;
  planCount: number;
  onTabChange: (tab: BuilderTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Builder sections"
      className="flex gap-1 overflow-x-auto rounded-xl border border-border/60 bg-card/50 p-1"
    >
      {BUILDER_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const badge = tab.id === "plans" && planCount > 0 ? planCount : null;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {badge ? (
              <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
