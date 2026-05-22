"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Grid3x3, X } from "lucide-react";

import { cn } from "@/utils";
import { TypeChartList } from "@/components/type-chart/type-chart-list";
import { TypeChartMatrix } from "@/components/type-chart/type-chart-matrix";
import {
  getFocusableElements,
  trapFocusWithin,
} from "@/components/type-chart/type-chart-overlay-a11y";
import { Button } from "@/components/ui/button";

type TypeChartTab = "table" | "list";

export type TypeChartContext = "builder" | "pokedex" | "detail";

const TYPE_CHART_COPY: Record<
  TypeChartContext,
  { eyebrow: string; description: string }
> = {
  builder: {
    eyebrow: "Builder reference",
    description: "Row = attacking type. Column = defending type.",
  },
  pokedex: {
    eyebrow: "Pokédex reference",
    description: "Row = attacking type. Column = defending type.",
  },
  detail: {
    eyebrow: "Pokémon reference",
    description: "Row = attacking type. Column = defending type.",
  },
};

type TypeChartController = {
  open: (trigger?: HTMLElement | null) => void;
  close: () => void;
  dialogId: string;
  isOpen: boolean;
};

const TypeChartContextState = createContext<TypeChartController | null>(null);

const TYPE_CHART_OVERLAY_ENTER_MS = 280;
const TYPE_CHART_OVERLAY_EXIT_MS = 200;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getOverlayExitMs(): number {
  return prefersReducedMotion() ? 0 : TYPE_CHART_OVERLAY_EXIT_MS;
}

function useTypeChartController(): TypeChartController {
  const value = useContext(TypeChartContextState);
  if (!value) {
    throw new Error("Type chart controls must be used within TypeChartProvider.");
  }

  return value;
}

type TypeChartProviderProps = {
  context: TypeChartContext;
  children: ReactNode;
};

export function TypeChartProvider({ context, children }: TypeChartProviderProps) {
  const [isPresent, setIsPresent] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const titleId = useId();
  const dialogId = useId();
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const copy = TYPE_CHART_COPY[context];

  const close = useCallback(() => {
    if (!isPresent || isExiting) {
      return;
    }

    setIsExiting(true);
    setOverlayActive(false);

    window.setTimeout(() => {
      setIsPresent(false);
      setIsExiting(false);
      const trigger = lastTriggerRef.current;
      requestAnimationFrame(() => {
        trigger?.focus();
      });
    }, getOverlayExitMs());
  }, [isExiting, isPresent]);

  const open = useCallback((trigger?: HTMLElement | null) => {
    if (trigger) {
      lastTriggerRef.current = trigger;
    } else if (document.activeElement instanceof HTMLElement) {
      lastTriggerRef.current = document.activeElement;
    }

    setIsExiting(false);
    setIsPresent(true);
    setOverlayActive(false);

    if (prefersReducedMotion()) {
      setOverlayActive(true);
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOverlayActive(true);
      });
    });
  }, []);

  useEffect(() => {
    if (!isPresent) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, isPresent]);

  useEffect(() => {
    if (!isPresent || !overlayActive) {
      return;
    }

    const dialog = document.getElementById(dialogId);
    if (!dialog) {
      return;
    }

    const focusDelay = prefersReducedMotion() ? 0 : TYPE_CHART_OVERLAY_ENTER_MS;
    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusableElements(dialog);
      focusable[0]?.focus();
    }, focusDelay);

    const releaseTrap = trapFocusWithin(dialog);

    return () => {
      window.clearTimeout(focusTimer);
      releaseTrap();
    };
  }, [dialogId, isPresent, overlayActive]);

  const overlayState = overlayActive ? "open" : isExiting ? "closed" : undefined;

  const controller: TypeChartController = {
    open,
    close,
    dialogId,
    isOpen: isPresent,
  };

  return (
    <TypeChartContextState.Provider value={controller}>
      {children}
      {isPresent ? (
        <div
          className={cn(
            "ptf-type-chart-backdrop fixed inset-0 z-50 flex items-end justify-center bg-background/25 p-0 sm:items-center sm:bg-background/10 sm:p-6",
          )}
          {...(overlayState ? { "data-state": overlayState } : {})}
          role="presentation"
          onMouseDown={close}
        >
          <section
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            {...(overlayState ? { "data-state": overlayState } : {})}
            className={cn(
              "ptf-type-chart-panel flex w-full min-h-0 flex-col border border-border/70 bg-card shadow-2xl",
              "h-[min(92dvh,100%)] rounded-t-2xl sm:h-auto sm:max-h-[min(88dvh,900px)] sm:max-w-5xl sm:rounded-2xl",
            )}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <TypeChartOverlayHeader
              titleId={titleId}
              eyebrow={copy.eyebrow}
              description={copy.description}
              onClose={close}
            />
            <TypeChartOverlayTabs />
          </section>
        </div>
      ) : null}
    </TypeChartContextState.Provider>
  );
}

function TypeChartOverlayHeader({
  titleId,
  eyebrow,
  description,
  onClose,
}: {
  titleId: string;
  eyebrow: string;
  description: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
        <h2 id={titleId} className="mt-1 text-lg font-semibold text-foreground">
          Type chart
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Close type chart"
      >
        <X className="size-5" aria-hidden />
      </button>
    </div>
  );
}

function TypeChartOverlayTabs() {
  const [activeTab, setActiveTab] = useState<TypeChartTab>("table");
  const tabListId = useId();
  const tableTabId = `${tabListId}-table`;
  const listTabId = `${tabListId}-list`;
  const tablePanelId = `${tabListId}-table-panel`;
  const listPanelId = `${tabListId}-list-panel`;

  return (
    <>
      <div
        role="tablist"
        aria-label="Type chart views"
        className="flex gap-1 border-b border-border/50 px-4 sm:px-5"
      >
        {(
          [
            { id: "table" as const, label: "Table", tabId: tableTabId, panelId: tablePanelId },
            { id: "list" as const, label: "List", tabId: listTabId, panelId: listPanelId },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            id={tab.tabId}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={tab.panelId}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={tablePanelId}
        role="tabpanel"
        aria-labelledby={tableTabId}
        hidden={activeTab !== "table"}
        tabIndex={activeTab === "table" ? 0 : -1}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-5",
          activeTab !== "table" && "hidden",
        )}
      >
        <TypeChartMatrix showFooter />
      </div>
      <div
        id={listPanelId}
        role="tabpanel"
        aria-labelledby={listTabId}
        hidden={activeTab !== "list"}
        tabIndex={activeTab === "list" ? 0 : -1}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-5",
          activeTab !== "list" && "hidden",
        )}
      >
        <TypeChartList />
      </div>
    </>
  );
}

type TypeChartFabProps = {
  className?: string;
};

export function TypeChartFab({ className }: TypeChartFabProps) {
  const { open, dialogId, isOpen } = useTypeChartController();

  return (
    <button
      type="button"
      onClick={(event) => open(event.currentTarget)}
      className={cn(
        "fixed bottom-5 right-4 z-40 inline-flex items-center gap-2 rounded-2xl border border-border/70",
        "bg-card/95 px-4 py-2.5 text-sm font-semibold text-foreground shadow-lg shadow-black/25",
        "backdrop-blur-md transition-[colors,transform] duration-150 hover:border-primary/40 hover:bg-card active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-6 sm:right-6",
        className,
      )}
      aria-haspopup="dialog"
      aria-controls={dialogId}
      aria-expanded={isOpen}
    >
      <Grid3x3 className="size-4 text-primary" aria-hidden />
      Type chart
    </button>
  );
}

type TypeChartOpenButtonProps = {
  children?: ReactNode;
  className?: string;
};

export function TypeChartOpenButton({
  children = "Open type chart",
  className,
}: TypeChartOpenButtonProps) {
  const { open, dialogId, isOpen } = useTypeChartController();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("shrink-0 rounded-xl transition-colors hover:border-primary/40 hover:bg-accent/60", className)}
      onClick={(event) => open(event.currentTarget)}
      aria-haspopup="dialog"
      aria-controls={dialogId}
      aria-expanded={isOpen}
    >
      {children}
    </Button>
  );
}
