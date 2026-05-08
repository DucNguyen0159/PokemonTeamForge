import { Lightbulb, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type MockRecommendation = {
  id: string;
  role: string;
  reason: string;
};

const MOCK_RECOMMENDATIONS: MockRecommendation[] = [
  {
    id: "hazard_setter",
    role: "Entry Hazard Setter",
    reason: "Your team lacks Stealth Rock support.",
  },
  {
    id: "hazard_remover",
    role: "Hazard Remover",
    reason: "No Defog or Rapid Spin user detected.",
  },
  {
    id: "pivot",
    role: "Pivot",
    reason: "A U-turn or Volt Switch user would improve momentum.",
  },
];

function RecommendationCard({ rec }: { rec: MockRecommendation }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border/40 bg-background/30 p-3">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 flex-shrink-0 rounded-lg bg-muted/60" />
          <p className="text-xs font-semibold text-foreground/80">{rec.role}</p>
        </div>
        <p className="text-[11px] leading-snug text-muted-foreground">{rec.reason}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled
        className="flex-shrink-0 gap-1 rounded-lg px-2 py-1 text-xs"
        aria-label={`Add a ${rec.role} to team`}
      >
        <Plus className="size-3" aria-hidden />
        Add
      </Button>
    </div>
  );
}

export function RecommendationPanel() {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-md">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4 text-yellow-400/80" aria-hidden />
        <h2 className="text-sm font-semibold text-foreground">Recommendations</h2>
      </div>

      <div className="flex flex-col gap-2">
        {MOCK_RECOMMENDATIONS.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>

      <p className="mt-1 text-center text-xs text-muted-foreground/50">
        Suggestions update as your team changes
      </p>
    </section>
  );
}
