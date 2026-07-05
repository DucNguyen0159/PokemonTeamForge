import { Suspense } from "react";

import { ChampionsTeamBuilder } from "@/components/champions/champions-team-builder";

function BuilderFallback() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 px-4 py-10 text-sm text-muted-foreground">
      Loading Champions Builder...
    </div>
  );
}

export default function ChampionsBuilderPage() {
  return (
    <Suspense fallback={<BuilderFallback />}>
      <ChampionsTeamBuilder />
    </Suspense>
  );
}
