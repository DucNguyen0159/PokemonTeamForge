import type { PokemonFormKind } from "@/lib/pokemon/pokemon-forms";
import { getFormKindPillLabel } from "@/lib/pokemon/pokemon-forms";
import { cn } from "@/utils";

const FORM_KIND_PILL_STYLES: Record<Exclude<PokemonFormKind, "default">, string> = {
  mega: "border-violet-400/30 bg-violet-500/15 text-violet-100",
  gigantamax: "border-rose-400/30 bg-rose-500/15 text-rose-100",
  regional: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  other: "border-slate-400/30 bg-slate-500/15 text-slate-200",
};

type PokemonFormKindPillProps = {
  formKind: PokemonFormKind;
  className?: string;
};

export function PokemonFormKindPill({ formKind, className }: PokemonFormKindPillProps) {
  const label = getFormKindPillLabel(formKind);

  if (!label || formKind === "default") {
    return null;
  }

  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-sm font-medium",
        FORM_KIND_PILL_STYLES[formKind],
        className,
      )}
    >
      {label}
    </span>
  );
}
