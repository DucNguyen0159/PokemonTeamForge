"use client";

import { ClipboardPaste, Copy, Trash2 } from "lucide-react";

import { useTeamStore } from "@/store/team-store";
import { Button } from "@/components/ui/button";

export function BuilderControls() {
  const clearTeam = useTeamStore((s) => s.clearTeam);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 rounded-xl text-xs"
        aria-label="Import team"
        disabled
      >
        <ClipboardPaste className="size-3.5" aria-hidden />
        Import
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 rounded-xl text-xs"
        aria-label="Export team"
        disabled
      >
        <Copy className="size-3.5" aria-hidden />
        Export
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={clearTeam}
        className="ml-auto gap-1.5 rounded-xl text-xs text-muted-foreground hover:text-destructive"
        aria-label="Clear all Pokémon from team"
      >
        <Trash2 className="size-3.5" aria-hidden />
        Clear Team
      </Button>
    </div>
  );
}
