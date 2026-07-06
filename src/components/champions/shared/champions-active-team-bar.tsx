"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { ChampionsTeamIdentityBar } from "@/components/champions/champions-team-identity-bar";
import { useActiveTeamSnapshot, useActiveTeamSummaries } from "@/hooks/use-active-team-snapshot";
import { cn } from "@/utils";

const COLLAPSE_KEY = "pokemon-team-forge-champions-identity-bar-collapsed";

export function ChampionsActiveTeamBar({
  variant = "mini",
  focusedSlot,
  onSlotSelect,
  onLegalityClick,
  headerActions,
  contextualAction,
  showWhenEmpty = false,
}: {
  variant?: "mini" | "compact";
  focusedSlot?: number;
  onSlotSelect?: (slot: number) => void;
  onLegalityClick?: () => void;
  headerActions?: React.ReactNode;
  contextualAction?: React.ReactNode;
  showWhenEmpty?: boolean;
}) {
  const { team, snapshot } = useActiveTeamSnapshot();
  const { summariesBySlot, isLoading } = useActiveTeamSummaries();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  if (!showWhenEmpty && snapshot.rosterFilled === 0 && snapshot.battlePlanCount === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end gap-2">
        {contextualAction}
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-2 py-1 text-[10px] text-muted-foreground hover:bg-background/50"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
        >
          {collapsed ? "Show roster" : "Hide roster"}
          {collapsed ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />}
        </button>
      </div>
      <div className={cn(collapsed && "hidden")}>
        <ChampionsTeamIdentityBar
          team={team}
          summariesBySlot={summariesBySlot}
          snapshot={snapshot}
          variant={variant}
          focusedSlot={focusedSlot}
          isSummariesLoading={isLoading}
          onSlotSelect={onSlotSelect}
          onLegalityClick={onLegalityClick}
          headerActions={headerActions}
        />
      </div>
    </div>
  );
}
