"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { addPokemonSlugToTeam } from "@/lib/team/add-pokemon-to-team";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

type PokemonDetailActionsProps = {
  slug: string;
};

type ToastState =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null;

const TOAST_DISMISS_MS = 4000;

export function PokemonDetailActions({ slug }: PokemonDetailActionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (next: ToastState) => {
      clearDismissTimer();
      setToast(next);
      if (next) {
        dismissTimerRef.current = setTimeout(() => {
          setToast(null);
          dismissTimerRef.current = null;
        }, TOAST_DISMISS_MS);
      }
    },
    [clearDismissTimer],
  );

  useEffect(() => () => clearDismissTimer(), [clearDismissTimer]);

  async function handleAddToTeam() {
    setIsAdding(true);
    try {
      const result = await addPokemonSlugToTeam(slug);
      if (result.ok) {
        showToast({
          kind: "success",
          message: `Added ${result.pokemonName} to slot ${result.slot}.`,
        });
      } else {
        showToast({ kind: "error", message: result.message });
      }
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          size="sm"
          className="rounded-xl"
          disabled={isAdding}
          onClick={() => void handleAddToTeam()}
        >
          {isAdding ? "Adding…" : "Add to Team"}
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <Link href="/builder">Open Builder</Link>
        </Button>
      </div>

      {toast ? (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "max-w-sm rounded-xl border px-3 py-2 text-right text-xs shadow-sm",
            toast.kind === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          {toast.message}
        </p>
      ) : null}
    </div>
  );
}
