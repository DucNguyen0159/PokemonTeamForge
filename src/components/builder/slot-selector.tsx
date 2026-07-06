"use client";

import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
  autoFocusSearch?: boolean;
  layout?: "inline" | "stacked";
  hasError?: boolean;
  preserveSelectedName?: boolean;
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
  autoFocusSearch = true,
  layout = "inline",
  hasError = false,
  preserveSelectedName = false,
}: SlotSelectorProps) {
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const optionsListRef = useRef<HTMLUListElement | null>(null);
  const activeOptionRef = useRef<HTMLLIElement | null>(null);
  const listId = useId();

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
  const selectedIndex = useMemo(
    () => (selected ? filtered.findIndex((opt) => opt.id === selected.id) : -1),
    [filtered, selected],
  );
  const effectiveActiveIndex =
    activeIndex >= 0 && activeIndex < filtered.length
      ? activeIndex
      : selectedIndex >= 0
        ? selectedIndex
        : 0;

  useEffect(() => {
    if (!isOpen || !searchable || !autoFocusSearch) {
      return;
    }
    searchInputRef.current?.focus();
  }, [autoFocusSearch, isOpen, searchable]);

  useEffect(() => {
    if (!isOpen || !activeOptionRef.current) {
      return;
    }
    activeOptionRef.current.scrollIntoView({ block: "nearest" });
  }, [effectiveActiveIndex, isOpen]);

  const closeDropdown = useCallback(() => {
    if (!isOpen) {
      return;
    }
    onToggle();
    triggerRef.current?.focus();
  }, [isOpen, onToggle]);

  const selectActiveOption = useCallback(() => {
    const option = filtered[effectiveActiveIndex];
    if (!option) {
      return;
    }
    onSelect(option);
  }, [effectiveActiveIndex, filtered, onSelect]);

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!isOpen && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        handleToggle();
        return;
      }

      if (!isOpen) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeDropdown();
      }
    },
    [closeDropdown, handleToggle, isOpen],
  );

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) =>
          Math.min((prev >= 0 ? prev : effectiveActiveIndex) + 1, Math.max(filtered.length - 1, 0)),
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => Math.max((prev >= 0 ? prev : effectiveActiveIndex) - 1, 0));
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        selectActiveOption();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeDropdown();
      }
    },
    [closeDropdown, effectiveActiveIndex, filtered.length, isOpen, selectActiveOption],
  );

  const handleOptionMouseEnter = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <div className={cn("relative", layout === "stacked" && "space-y-1")}>
      {layout === "stacked" ? (
        <span className="block text-xs text-muted-foreground">{label}</span>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-expanded={isOpen}
        aria-label={layout === "stacked" ? label : undefined}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
          "border border-border/40 bg-background/40",
          "hover:border-border/70 hover:bg-background/60",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          isOpen && "border-primary/40 bg-background/60",
          hasError && "border-rose-500/50 ring-1 ring-rose-500/30",
        )}
      >
        {layout === "inline" ? (
          <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
        ) : null}
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center gap-1.5",
            layout === "stacked" ? "justify-between" : "justify-end",
          )}
        >
          {selected && selectedPrefix ? (
            <span className="shrink-0">{selectedPrefix}</span>
          ) : null}
          <span
            title={selected?.name}
            className={cn(
              "min-w-0 text-xs",
              layout === "stacked"
                ? preserveSelectedName
                  ? "flex-1 text-left leading-snug"
                  : "flex-1 truncate text-left"
                : "max-w-[120px] truncate",
              selected ? "text-foreground/90" : "text-muted-foreground/50",
            )}
          >
            {selected ? selected.name : layout === "stacked" ? `Select ${label.toLowerCase()}` : `— ${label} —`}
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
                ref={searchInputRef}
                autoFocus={autoFocusSearch}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={`Search ${label.toLowerCase()}…`}
                className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
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

          <ul ref={optionsListRef} id={listId} className="max-h-44 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                {noOptionsText}
              </li>
            ) : (
              filtered.map((opt, index) => (
                <li
                  key={opt.id}
                  role="option"
                  aria-selected={selected?.id === opt.id}
                  ref={effectiveActiveIndex === index ? activeOptionRef : null}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(opt)}
                    onMouseEnter={() => handleOptionMouseEnter(index)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-1.5 text-xs",
                      "transition-colors hover:bg-accent/60",
                      selected?.id === opt.id && "text-primary",
                      effectiveActiveIndex === index
                        ? "bg-primary/15 text-foreground"
                        : selected?.id === opt.id
                          ? "bg-primary/10"
                          : "",
                    )}
                  >
                    <span className="min-w-0 flex-1 text-left font-medium">
                      {renderOption ? renderOption(opt) : opt.name}
                    </span>
                    {opt.meta && !hideOptionMeta && (
                      <span className="shrink-0 text-right text-muted-foreground">{opt.meta}</span>
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
