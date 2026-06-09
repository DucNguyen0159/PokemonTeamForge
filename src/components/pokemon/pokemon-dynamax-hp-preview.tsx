import { buildDynamaxHpPreview, getDynamaxHpMultipliers } from "@/lib/pokemon/dynamax-hp";

type PokemonDynamaxHpPreviewProps = {
  baseHp: number;
};

export function PokemonDynamaxHpPreview({ baseHp }: PokemonDynamaxHpPreviewProps) {
  const multipliers = getDynamaxHpMultipliers();
  const preview = buildDynamaxHpPreview(baseHp);

  return (
    <section className="rounded-2xl border border-border/55 bg-background/30 p-3 sm:p-4">
      <h3 className="text-sm font-semibold text-foreground">Battle Modifiers (Dynamax/Gigantamax)</h3>
      <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
        <div className="rounded-xl border border-border/45 bg-card/45 px-3 py-2">
          <p className="text-muted-foreground">HP multiplier</p>
          <p className="mt-0.5 font-medium text-foreground">
            x{multipliers.min.toFixed(1)} (Lv 0) - x{multipliers.max.toFixed(1)} (Lv 10)
          </p>
        </div>
        <div className="rounded-xl border border-border/45 bg-card/45 px-3 py-2">
          <p className="text-muted-foreground">Max HP preview (Lv 100 assumptions)</p>
          <p className="mt-0.5 font-medium text-foreground tabular-nums">
            {preview.boostedMinLevel100} - {preview.boostedMaxLevel100}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground/80">
        Battle-only modifier. Base stats remain unchanged and sorting still uses canonical base HP.
      </p>
    </section>
  );
}
