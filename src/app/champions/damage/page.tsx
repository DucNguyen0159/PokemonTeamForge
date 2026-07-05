import { Suspense } from "react";

import { ChampionsDamageLab } from "@/components/champions/champions-damage-lab";

function DamageLabFallback() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 px-4 py-10 text-sm text-muted-foreground">
      Loading Damage Lab...
    </div>
  );
}

export default function ChampionsDamagePage() {
  return (
    <Suspense fallback={<DamageLabFallback />}>
      <ChampionsDamageLab />
    </Suspense>
  );
}
