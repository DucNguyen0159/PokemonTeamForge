import { CHAMPIONS_CORE_RULES } from "@/data/champions";

export function ChampionsRulesStrip({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-muted-foreground">
        {CHAMPIONS_CORE_RULES.slice(0, 3).join(" · ")}
      </p>
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {CHAMPIONS_CORE_RULES.map((rule) => (
        <li
          key={rule}
          className="rounded-xl border border-border/45 bg-background/35 px-3 py-2 text-xs text-muted-foreground"
        >
          {rule}
        </li>
      ))}
    </ul>
  );
}
