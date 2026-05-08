"use client";

import { TeamHeader } from "./team-header";
import { TeamSlots } from "./team-slots";
import { BuilderControls } from "./builder-controls";
import { CoveragePanel } from "@/components/coverage/coverage-panel";
import { ChecklistPanel } from "@/components/checklist/checklist-panel";
import { RecommendationPanel } from "@/components/recommendation/recommendation-panel";

export function TeamBuilder() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6">
      <div className="mb-5">
        <TeamHeader />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <TeamSlots />
          <BuilderControls />
        </div>

        <aside className="flex w-full flex-col gap-4 lg:w-[360px] lg:flex-shrink-0 lg:overflow-y-auto">
          <CoveragePanel />
          <ChecklistPanel />
          <RecommendationPanel />
        </aside>
      </div>
    </div>
  );
}
