"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, ClipboardPaste, Copy, Trash2, X } from "lucide-react";

import { MOCK_ITEMS } from "@/data/mock-items";
import {
  useSaveTeamMutation,
  useUpdateTeamMutation,
} from "@/hooks/queries/use-user-teams";
import { formatShowdownExport } from "@/lib/parsing/format-showdown-export";
import { parseShowdownImport } from "@/lib/parsing/parse-showdown-import";
import { useAuthStore } from "@/store/auth-store";
import { useTeamStore } from "@/store/team-store";
import { Button } from "@/components/ui/button";
import type { PokemonDetail } from "@/types/pokemon";
import type { Team } from "@/types/team";

export function BuilderControls() {
  const team = useTeamStore((s) => s.team);
  const clearTeam = useTeamStore((s) => s.clearTeam);
  const loadTeam = useTeamStore((s) => s.loadTeam);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const saveTeamMutation = useSaveTeamMutation();
  const updateTeamMutation = useUpdateTeamMutation();

  const [importText, setImportText] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warningLines, setWarningLines] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const exportText = useMemo(() => formatShowdownExport(team), [team]);

  const slugify = (value: string): string =>
    value
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  async function fetchPokemonDetail(name: string): Promise<PokemonDetail | null> {
    const response = await fetch(`/api/pokemon/${encodeURIComponent(name)}`);
    const payload = (await response.json()) as {
      success: boolean;
      data?: PokemonDetail;
      error?: { message?: string };
    };

    if (!response.ok || !payload.success || !payload.data) {
      return null;
    }

    return payload.data;
  }

  function buildEmptySlots() {
    return Array.from({ length: 6 }, (_, index) => ({
      slot: index + 1,
      pokemon: null,
      selectedAbility: null,
      selectedItem: null,
      moves: [1, 2, 3, 4].map((moveSlot) => ({
        slot: moveSlot as 1 | 2 | 3 | 4,
        move: null,
      })),
      isShiny: false,
    }));
  }

  async function handleImport() {
    setIsImporting(true);
    setFeedback(null);
    setError(null);
    setWarningLines([]);

    const parsed = parseShowdownImport(importText);
    if (!parsed.isValid) {
      setError(parsed.errors[0] ?? "Import text could not be parsed.");
      setWarningLines(parsed.warnings);
      setIsImporting(false);
      return;
    }

    const nextTeam: Team = {
      ...team,
      pokemon: buildEmptySlots(),
    };

    const localWarnings: string[] = [...parsed.warnings];
    let importedCount = 0;

    for (let i = 0; i < parsed.sets.length; i += 1) {
      const parsedSet = parsed.sets[i];
      const detail = await fetchPokemonDetail(parsedSet.species);

      if (!detail) {
        localWarnings.push(`Set ${i + 1}: Pokémon "${parsedSet.species}" not found.`);
        continue;
      }

      const ability = parsedSet.ability
        ? detail.abilities.find((entry) => slugify(entry.name) === slugify(parsedSet.ability!)) ?? null
        : null;

      if (parsedSet.ability && !ability) {
        localWarnings.push(
          `Set ${i + 1}: ability "${parsedSet.ability}" not found for ${detail.name}.`,
        );
      }

      const item = parsedSet.item
        ? MOCK_ITEMS.find((entry) => slugify(entry.name) === slugify(parsedSet.item!)) ?? null
        : null;

      if (parsedSet.item && !item) {
        localWarnings.push(`Set ${i + 1}: item "${parsedSet.item}" not found in current item pool.`);
      }

      const moves = [1, 2, 3, 4].map((moveSlot) => {
        const wantedMove = parsedSet.moves[moveSlot - 1];
        if (!wantedMove) {
          return {
            slot: moveSlot as 1 | 2 | 3 | 4,
            move: null,
          };
        }

        const matched =
          detail.moves.find((move) => slugify(move.name) === slugify(wantedMove)) ?? null;

        if (!matched) {
          localWarnings.push(
            `Set ${i + 1}: move "${wantedMove}" not found for ${detail.name}.`,
          );
        }

        return {
          slot: moveSlot as 1 | 2 | 3 | 4,
          move: matched,
        };
      });

      nextTeam.pokemon[i] = {
        ...nextTeam.pokemon[i],
        pokemon: detail,
        selectedAbility: ability,
        selectedItem: item,
        moves,
      };

      importedCount += 1;
    }

    if (importedCount === 0) {
      setError("No valid Pokémon could be imported. Please check names and try again.");
      setWarningLines(localWarnings);
      setIsImporting(false);
      return;
    }

    loadTeam(nextTeam);
    setWarningLines(localWarnings);
    setFeedback(`Imported ${importedCount} Pokémon into your team.`);
    setImportText("");
    setIsImportOpen(false);
    setIsImporting(false);
  }

  async function handleCopyExport() {
    if (!exportText.trim()) {
      setError("Your team is empty. Add Pokémon before exporting.");
      return;
    }

    setIsCopying(true);
    setFeedback(null);
    setError(null);

    try {
      await navigator.clipboard.writeText(exportText);
      setFeedback("Team copied to clipboard.");
    } catch {
      setError("Clipboard copy failed. You can still copy from the export text box.");
    } finally {
      setIsCopying(false);
    }
  }

  async function handleSaveTeam() {
    if (!isAuthenticated) {
      setError("Please log in to save teams to Supabase. Guest mode still autosaves locally.");
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    setError(null);

    try {
      if (team.id) {
        await updateTeamMutation.mutateAsync({ teamId: team.id, team });
        setFeedback("Saved team updated in Supabase.");
      } else {
        const saved = await saveTeamMutation.mutateAsync(team);
        loadTeam({
          ...team,
          id: saved.id,
          userId: null,
          createdAt: saved.createdAt,
          updatedAt: saved.updatedAt,
          isPublic: saved.isPublic,
        });
        setFeedback("Team saved to Supabase.");
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save team right now. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={isImportOpen ? "secondary" : "outline"}
          size="sm"
          className="gap-1.5 rounded-xl text-xs"
          aria-label="Import team"
          onClick={() => {
            setIsImportOpen((prev) => !prev);
            setIsExportOpen(false);
            setFeedback(null);
            setError(null);
          }}
        >
          <ClipboardPaste className="size-3.5" aria-hidden />
          Import
        </Button>

        <Button
          variant={isExportOpen ? "secondary" : "outline"}
          size="sm"
          className="gap-1.5 rounded-xl text-xs"
          aria-label="Export team"
          onClick={() => {
            setIsExportOpen((prev) => !prev);
            setIsImportOpen(false);
            setFeedback(null);
            setError(null);
          }}
        >
          <Copy className="size-3.5" aria-hidden />
          Export
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyExport}
          className="gap-1.5 rounded-xl text-xs"
          aria-label="Copy team to clipboard"
          disabled={isCopying}
        >
          {isCopying ? (
            <Check className="size-3.5" aria-hidden />
          ) : (
            <Clipboard className="size-3.5" aria-hidden />
          )}
          Copy
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

        <Button
          size="sm"
          onClick={handleSaveTeam}
          className="gap-1.5 rounded-xl text-xs"
          aria-label="Save current team"
          disabled={
            isSaving || saveTeamMutation.isPending || updateTeamMutation.isPending
          }
        >
          {isSaving ? "Saving..." : team.id ? "Update Saved Team" : "Save Team"}
        </Button>
      </div>

      {!isAuthenticated ? (
        <p className="text-xs text-muted-foreground">
          Guest mode is active: your current builder session is saved locally.
        </p>
      ) : null}

      {feedback ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
          {feedback}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
          {error}
        </p>
      ) : null}

      {warningLines.length > 0 ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          <p className="mb-1 text-xs font-medium text-amber-200">Import notes</p>
          <ul className="space-y-0.5 text-xs text-amber-100/90">
            {warningLines.slice(0, 4).map((line, idx) => (
              <li key={`${line}-${idx}`}>- {line}</li>
            ))}
            {warningLines.length > 4 ? (
              <li>- +{warningLines.length - 4} more</li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {isImportOpen ? (
        <div className="space-y-2 rounded-xl border border-border/60 bg-card/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-foreground">Import Team (Showdown-style)</p>
            <button
              type="button"
              onClick={() => setIsImportOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label="Close import panel"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder={`Charizard @ Heavy-Duty Boots\nAbility: Blaze\n- Flamethrower\n- Air Slash\n- Roost\n- Dragon Pulse`}
            className="min-h-32 w-full rounded-lg border border-border/60 bg-background/50 p-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setImportText("");
                setWarningLines([]);
                setError(null);
              }}
            >
              Reset
            </Button>
            <Button size="sm" className="text-xs" onClick={handleImport} disabled={isImporting}>
              {isImporting ? "Importing..." : "Import to Builder"}
            </Button>
          </div>
        </div>
      ) : null}

      {isExportOpen ? (
        <div className="space-y-2 rounded-xl border border-border/60 bg-card/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-foreground">Export Team Text</p>
            <button
              type="button"
              onClick={() => setIsExportOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label="Close export panel"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <textarea
            readOnly
            value={exportText}
            className="min-h-32 w-full rounded-lg border border-border/60 bg-background/50 p-2 text-xs text-foreground focus-visible:outline-none"
            placeholder="Your exported team will appear here."
          />
        </div>
      ) : null}
    </div>
  );
}
