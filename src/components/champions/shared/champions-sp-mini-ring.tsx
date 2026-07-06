import { cn } from "@/utils";
import { CHAMPIONS_SP_BUDGET, slotSpTotal, spBudgetStatus } from "@/lib/champions/sp-budget";
import type { ChampionsSpSpread } from "@/types/champions";

export function ChampionsSpMiniRing({
  sp,
  className,
}: {
  sp: ChampionsSpSpread;
  className?: string;
}) {
  const total = slotSpTotal(sp);
  const percent = Math.min(100, Math.round((total / CHAMPIONS_SP_BUDGET) * 100));
  const status = spBudgetStatus(total);

  const strokeColor =
    status === "error"
      ? "stroke-rose-400"
      : status === "warning"
        ? "stroke-amber-400"
        : "stroke-emerald-400";

  return (
    <div
      className={cn("relative size-8 flex-shrink-0", className)}
      title={`${total}/${CHAMPIONS_SP_BUDGET} SP`}
      aria-label={`${total} of ${CHAMPIONS_SP_BUDGET} SP allocated`}
    >
      <svg viewBox="0 0 36 36" className="size-full -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          className="stroke-muted/50"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          className={cn(strokeColor, "transition-all")}
          strokeWidth="3"
          strokeDasharray={`${percent} 100`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold tabular-nums text-foreground">
        {total}
      </span>
    </div>
  );
}
