import Link from "next/link";
import { Swords } from "lucide-react";

import { cn } from "@/utils";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
};

export function BrandMark({ className, compact = false }: BrandMarkProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-2xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
      aria-label="PokemonTeamForge home"
    >
      <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-2xl border border-primary/30 bg-primary/10 shadow-sm shadow-black/20">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_36%),linear-gradient(135deg,rgba(155,181,209,0.26),transparent_55%)]" />
        <Swords className="relative size-4 text-primary transition-transform group-hover:rotate-6" aria-hidden />
      </span>
      {compact ? null : (
        <span className="leading-none">
          <span className="block text-sm font-semibold tracking-wide text-foreground">
            PokemonTeamForge
          </span>
          <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground sm:block">
            Battle Lab
          </span>
        </span>
      )}
    </Link>
  );
}
