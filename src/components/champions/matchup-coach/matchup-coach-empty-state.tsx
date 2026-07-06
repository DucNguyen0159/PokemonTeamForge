import Link from "next/link";
import { ArrowRight, Layers, Swords } from "lucide-react";

import { Button } from "@/components/ui/button";

export function MatchupCoachEmptyState() {
  return (
    <section className="rounded-2xl border border-dashed border-border/70 bg-card/50 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-foreground">No team loaded yet</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Load a preset or build a roster in the Team Builder to unlock matchup analysis, weakness
        heatmaps, and speed tier breakdowns.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="default">
          <Link href="/champions/presets">
            <Layers className="mr-2 h-4 w-4" />
            Browse presets
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/champions/builder">
            <Swords className="mr-2 h-4 w-4" />
            Open builder
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
