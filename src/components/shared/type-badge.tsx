import { memo } from "react";

import { cn } from "@/utils";
import type { PokemonType } from "@/types/shared";

export const TYPE_COLORS: Record<string, string> = {
  normal: "#9ca3af",
  fire: "#f97316",
  water: "#3b82f6",
  electric: "#facc15",
  grass: "#22c55e",
  ice: "#67e8f9",
  fighting: "#dc2626",
  poison: "#a855f7",
  ground: "#ca8a04",
  flying: "#7dd3fc",
  psychic: "#ec4899",
  bug: "#84cc16",
  rock: "#a16207",
  ghost: "#7c3aed",
  dragon: "#6366f1",
  dark: "#6b7280",
  steel: "#94a3b8",
  fairy: "#f9a8d4",
};

type TypeBadgeProps = {
  type: PokemonType | string;
  size?: "sm" | "md";
  className?: string;
};

function TypeBadgeComponent({ type, size = "sm", className }: TypeBadgeProps) {
  const color = TYPE_COLORS[type.toLowerCase()] ?? "#9ca3af";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium capitalize",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className,
      )}
      style={{ backgroundColor: `${color}26`, color }}
    >
      {type}
    </span>
  );
}

export const TypeBadge = memo(TypeBadgeComponent);
