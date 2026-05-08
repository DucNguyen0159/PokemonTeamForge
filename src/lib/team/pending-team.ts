"use client";

import type { Team } from "@/types/team";

const PENDING_TEAM_STORAGE_KEY = "pokemon-team-forge-pending-load-team";

export function savePendingLoadedTeam(team: Team): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PENDING_TEAM_STORAGE_KEY, JSON.stringify(team));
}

export function consumePendingLoadedTeam(): Team | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(PENDING_TEAM_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  localStorage.removeItem(PENDING_TEAM_STORAGE_KEY);

  try {
    return JSON.parse(raw) as Team;
  } catch {
    return null;
  }
}
