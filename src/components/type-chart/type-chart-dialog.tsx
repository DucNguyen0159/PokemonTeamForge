"use client";

import { useEffect, useState } from "react";
import { Grid3x3, X } from "lucide-react";

import { cn } from "@/utils";
import { TypeChartList } from "@/components/type-chart/type-chart-list";
import { TypeChartMatrix } from "@/components/type-chart/type-chart-matrix";

type TypeChartTab = "table" | "list";

export function TypeChartDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TypeChartTab>("table");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-5 right-4 z-40 inline-flex items-center gap-2 rounded-2xl border border-border/70",
          "bg-card/95 px-4 py-2.5 text-sm font-semibold text-foreground shadow-lg shadow-black/25",
          "backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-card",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-6 sm:right-6",
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="builder-type-chart-dialog"
      >
        <Grid3x3 className="size-4 text-primary" aria-hidden />
        Type chart
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={() => setIsOpen(false)}
        >
          <section
            id="builder-type-chart-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="builder-type-chart-title"
            className={cn(
              "flex w-full flex-col border border-border/70 bg-[#0f1525] shadow-2xl",
              "h-[min(92dvh,100%)] rounded-t-2xl sm:h-auto sm:max-h-[min(88dvh,900px)] sm:max-w-5xl sm:rounded-2xl",
            )}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Builder reference
                </p>
                <h2 id="builder-type-chart-title" className="mt-1 text-lg font-semibold text-foreground">
                  Type chart
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Row = attacking type. Column = defending type.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Close type chart"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="flex gap-1 border-b border-border/50 px-4 sm:px-5">
              {(
                [
                  { id: "table" as const, label: "Table" },
                  { id: "list" as const, label: "List" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                  aria-selected={activeTab === tab.id}
                  role="tab"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {activeTab === "table" ? (
                <TypeChartMatrix showFooter />
              ) : (
                <TypeChartList />
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
