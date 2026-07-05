"use client";

import { Suspense } from "react";

import { ChampionsCommunityExplorer } from "@/components/champions/champions-community-explorer";

function CommunityFallback() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 px-4 py-10 text-sm text-muted-foreground">
      Loading community teams...
    </div>
  );
}

export default function ChampionsCommunityPage() {
  return (
    <Suspense fallback={<CommunityFallback />}>
      <ChampionsCommunityExplorer />
    </Suspense>
  );
}
