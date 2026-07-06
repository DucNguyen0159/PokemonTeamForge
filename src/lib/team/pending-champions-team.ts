"use client";

import type { ChampionsTeam } from "@/types/champions";

const PENDING_CHAMPIONS_TEAM_STORAGE_KEY = "pokemon-team-forge-pending-load-champions-team";

export type PendingChampionsTeamPayload = {
  team: ChampionsTeam;
  sourcePresetId?: string | null;
  sourcePresetName?: string | null;
};

export function savePendingLoadedChampionsTeam(
  team: ChampionsTeam,
  meta?: { sourcePresetId?: string; sourcePresetName?: string },
): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const payload: PendingChampionsTeamPayload = {
      team,
      sourcePresetId: meta?.sourcePresetId ?? null,
      sourcePresetName: meta?.sourcePresetName ?? null,
    };
    localStorage.setItem(PENDING_CHAMPIONS_TEAM_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("[Pending Champions Team] Failed to store pending team", error);
  }
}

export function consumePendingLoadedChampionsTeam(): PendingChampionsTeamPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PENDING_CHAMPIONS_TEAM_STORAGE_KEY);
  } catch (error) {
    console.error("[Pending Champions Team] Failed to access pending team", error);
    return null;
  }
  if (!raw) {
    return null;
  }

  localStorage.removeItem(PENDING_CHAMPIONS_TEAM_STORAGE_KEY);

  try {
    const parsed = JSON.parse(raw) as PendingChampionsTeamPayload | ChampionsTeam;
    if (parsed && typeof parsed === "object" && "team" in parsed) {
      return parsed;
    }
    return { team: parsed as ChampionsTeam, sourcePresetId: null, sourcePresetName: null };
  } catch {
    return null;
  }
}
