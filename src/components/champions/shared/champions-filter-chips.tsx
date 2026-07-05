"use client";

import { cn } from "@/utils";

export function championsFilterChipClass(isActive: boolean): string {
  return cn(
    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
    isActive
      ? "border-primary/40 bg-primary/10 text-primary"
      : "border-border/60 bg-background/45 text-muted-foreground hover:border-border/80 hover:text-foreground",
  );
}

export function ChampionsFilterChips<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label?: string;
  hint?: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  const activeCount = value === options[0]?.value ? 0 : 1;

  return (
    <div>
      {label ? <p className="text-xs font-medium text-muted-foreground">{label}</p> : null}
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground/80">{hint}</p> : null}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={championsFilterChipClass(value === option.value)}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
        {activeCount > 0 && options[0] ? (
          <button
            type="button"
            className="text-[11px] text-muted-foreground underline hover:text-foreground"
            onClick={() => onChange(options[0].value)}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
