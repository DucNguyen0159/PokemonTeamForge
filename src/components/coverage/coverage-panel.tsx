"use client";

import { useState } from "react";
import { Shield, Swords } from "lucide-react";

import { cn } from "@/utils";
import { TypeBadge, TYPE_COLORS } from "@/components/shared/type-badge";

const ALL_TYPES = Object.keys(TYPE_COLORS) as string[];

type CoverageTab = "defensive" | "offensive";

function TypeCoverageRow({ type }: { type: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.03]">
      <TypeBadge type={type} />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="w-6 text-center">—</span>
        <span className="w-6 text-center">—</span>
        <span className="w-6 text-center">—</span>
      </div>
    </div>
  );
}

export function CoveragePanel() {
  const [tab, setTab] = useState<CoverageTab>("defensive");

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-md">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Type Coverage</h2>

        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/40 p-0.5">
          <button
            onClick={() => setTab("defensive")}
            aria-pressed={tab === "defensive"}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              tab === "defensive"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Shield className="size-3" aria-hidden />
            Defense
          </button>
          <button
            onClick={() => setTab("offensive")}
            aria-pressed={tab === "offensive"}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              tab === "offensive"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Swords className="size-3" aria-hidden />
            Offense
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-2">
        {tab === "defensive" ? (
          <>
            <span className="w-6 text-center text-[10px] font-medium text-red-400/70">Weak</span>
            <span className="w-6 text-center text-[10px] font-medium text-green-400/70">Res.</span>
            <span className="w-6 text-center text-[10px] font-medium text-sky-400/70">Imm.</span>
          </>
        ) : (
          <>
            <span className="w-6 text-center text-[10px] font-medium text-green-400/70">2×</span>
            <span className="w-6 text-center text-[10px] font-medium text-yellow-400/70">0.5×</span>
            <span className="w-6 text-center text-[10px] font-medium text-muted-foreground/70">0×</span>
          </>
        )}
      </div>

      <div className="-mx-1 flex flex-col">
        {ALL_TYPES.map((type) => (
          <TypeCoverageRow key={type} type={type} />
        ))}
      </div>

      <p className="mt-1 text-center text-xs text-muted-foreground/50">
        Add Pokémon to see coverage data
      </p>
    </section>
  );
}
