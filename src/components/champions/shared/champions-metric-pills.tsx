import { Cloud } from "lucide-react";

import { cloudStateLabel, type ActiveTeamCloudState } from "@/lib/champions/active-team-snapshot";

export function ChampionsMetricPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/45 px-2.5 py-1 text-[10px] text-muted-foreground">
      <span className="font-medium text-foreground">{value}</span>
      <span>{label}</span>
    </span>
  );
}

export function ChampionsCloudStatePill({ state }: { state: ActiveTeamCloudState }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/45 px-2.5 py-1 text-[10px] text-muted-foreground">
      <Cloud className="size-3" aria-hidden />
      {cloudStateLabel(state)}
    </span>
  );
}

export function ChampionsMetricPills({
  rosterFilled,
  rosterTotal,
  spAllocated,
  spBudget,
  planCount,
  cloudState,
}: {
  rosterFilled: number;
  rosterTotal: number;
  spAllocated: number;
  spBudget: number;
  planCount: number;
  cloudState: ActiveTeamCloudState;
}) {
  return (
    <>
      <ChampionsMetricPill label="roster" value={`${rosterFilled}/${rosterTotal}`} />
      <ChampionsMetricPill label="SP" value={`${spAllocated}/${spBudget || 0}`} />
      <ChampionsMetricPill label="plans" value={String(planCount)} />
      <ChampionsCloudStatePill state={cloudState} />
    </>
  );
}
