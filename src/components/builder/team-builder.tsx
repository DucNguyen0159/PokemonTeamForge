"use client";

import { useEffect } from "react";
import { TeamHeader } from "./team-header";
import { TeamSlots } from "./team-slots";
import { BuilderControls } from "./builder-controls";
import { CoveragePanel } from "@/components/coverage/coverage-panel";
import { ChecklistPanel } from "@/components/checklist/checklist-panel";
import { RecommendationPanel } from "@/components/recommendation/recommendation-panel";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { consumePendingLoadedTeam } from "@/lib/team/pending-team";
import { useTeamStore } from "@/store/team-store";

export function TeamBuilder() {
  const loadTeam = useTeamStore((state) => state.loadTeam);

  useEffect(() => {
    const pendingTeam = consumePendingLoadedTeam();
    if (pendingTeam) {
      loadTeam(pendingTeam);
    }
  }, [loadTeam]);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6">
      <div className="mb-5">
        <TeamHeader />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <ErrorBoundary
            title="Team builder is recovering"
            message="Your current team is still safe. Please try this section again."
          >
            <TeamSlots />
            <BuilderControls />
          </ErrorBoundary>
        </div>

        <aside className="flex min-w-0 w-full flex-col gap-4 overflow-x-hidden lg:w-[360px] lg:flex-shrink-0 lg:overflow-y-auto">
          <ErrorBoundary title="Coverage unavailable">
            <CoveragePanel />
          </ErrorBoundary>
          <ErrorBoundary title="Checklist unavailable">
            <ChecklistPanel />
          </ErrorBoundary>
          <ErrorBoundary title="Recommendations unavailable">
            <RecommendationPanel />
          </ErrorBoundary>
        </aside>
      </div>
    </div>
  );
}
