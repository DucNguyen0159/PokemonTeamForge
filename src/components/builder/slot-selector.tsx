"use client";

import { memo, useCallback, useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Search, X } from "lucide-react";

import { cn } from "@/utils";

export type SelectorOption = {
  id: number;
  name: string;
  slug: string;
  meta?: string;
};

type SlotSelectorProps = {
  label: string;
  selected: SelectorOption | null;
  options: SelectorOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (option: SelectorOption) => void;
  onClear?: () => void;
  renderOption?: (option: SelectorOption) => ReactNode;
  selectedPrefix?: ReactNode;
  selectedSuffix?: ReactNode;
  noOptionsText?: string;
  searchable?: boolean;
  hideOptionMeta?: boolean;
};

function SlotSelectorComponent({
  label,
  selected,
  options,
  isOpen,
  onToggle,
  onSelect,
  onClear,
  renderOption,
  selectedPrefix,
  selectedSuffix,
  noOptionsText = "No options found",
  searchable = true,
  hideOptionMeta = false,
}: SlotSelectorProps) {
  const [search, setSearch] = useState("");

  const handleToggle = useCallback(() => {
    if (!isOpen) {
      setSearch("");
    }
    onToggle();
  }, [isOpen, onToggle]);

  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      searchable && normalizedSearch
        ? options.filter((o) => o.name.toLowerCase().includes(normalizedSearch))
        : options,
    [normalizedSearch, options, searchable],
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
          "border border-border/40 bg-background/40",
          "hover:border-border/70 hover:bg-background/60",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          isOpen && "border-primary/40 bg-background/60",
        )}
      >
        <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
        <div className="flex min-w-0 items-center gap-1.5">
          {selected && selectedPrefix ? (
            <span className="shrink-0">{selectedPrefix}</span>
          ) : null}
          <span
            className={cn(
              "min-w-0 max-w-[120px] truncate text-xs",
              selected ? "text-foreground/90" : "text-muted-foreground/50",
            )}
          >
            {selected ? selected.name : `— ${label} —`}
          </span>
          {selected && selectedSuffix ? (
            <span className="shrink-0">{selectedSuffix}</span>
          ) : null}
          <ChevronDown
            className={cn(
              "size-3 flex-shrink-0 text-muted-foreground transition-transform duration-150",
              isOpen && "rotate-180",
            )}
            aria-hidden
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
          {searchable ? (
            <div className="flex items-center gap-2 border-b border-border/40 px-2.5 py-2">
              <Search className="size-3.5 flex-shrink-0 text-muted-foreground" aria-hidden />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}…`}
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          ) : null}

          <ul className="max-h-44 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                {noOptionsText}
              </li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.id} role="option" aria-selected={selected?.id === opt.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(opt)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-1.5 text-xs",
                      "transition-colors hover:bg-accent/60",
                      selected?.id === opt.id && "bg-primary/10 text-primary",
                    )}
                  >
                    <span className="min-w-0 flex-1 font-medium">
                      {renderOption ? renderOption(opt) : opt.name}
                    </span>
                    {opt.meta && !hideOptionMeta && (
                      <span className="text-muted-foreground">{opt.meta}</span>
                    )}
                  </button>
                </li>
              ))
            )}

            {onClear && selected && (
              <>
                <li aria-hidden className="mx-3 my-1 border-t border-border/40" />
                <li>
                  <button
                    type="button"
                    onClick={onClear}
                    className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                  >
                    <X className="size-3" aria-hidden />
                    Clear
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export const SlotSelector = memo(SlotSelectorComponent);
