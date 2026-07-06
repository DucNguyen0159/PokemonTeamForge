import { TypeBadge } from "@/components/shared/type-badge";
import {
  classifySpeedTier,
  speedTierLabel,
  type TeamMemberInsight,
} from "@/lib/champions/matchup-coach-analysis";
import { cn } from "@/utils";

const TIER_STYLES = {
  fast: "text-emerald-400",
  mid: "text-amber-400",
  slow: "text-slate-400",
  tr: "text-violet-400",
} as const;

const TIER_BAR_STYLES = {
  fast: "bg-emerald-500",
  mid: "bg-amber-500",
  slow: "bg-slate-500",
  tr: "bg-violet-500",
} as const;

export function MatchupCoachSpeedLadder({ members }: { members: TeamMemberInsight[] }) {
  const maxSpeed = Math.max(...members.map((member) => member.speedScore), 1);

  return (
    <article className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <h2 className="text-base font-semibold text-foreground">Speed tier ladder</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Estimated speed at level 50 with current SP and nature.
      </p>

      <div className="mt-4 space-y-3">
        {members.map((member) => {
          const tier = classifySpeedTier(member.speedScore, member.hasTrickRoom);
          const widthPct = Math.max(8, (member.speedScore / maxSpeed) * 100);
          return (
            <div key={member.slot} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium text-foreground">{member.name}</span>
                  <div className="hidden gap-1 sm:flex">
                    {member.types.map((type) => (
                      <TypeBadge key={`${member.slot}-${type}`} type={type} className="px-1.5 text-[9px]" />
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 tabular-nums">
                  <span className={cn("text-[10px] font-semibold uppercase", TIER_STYLES[tier])}>
                    {speedTierLabel(tier)}
                  </span>
                  <span className="font-semibold text-foreground">{member.speedScore}</span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/50">
                <div
                  className={cn("h-full rounded-full transition-all", TIER_BAR_STYLES[tier])}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
