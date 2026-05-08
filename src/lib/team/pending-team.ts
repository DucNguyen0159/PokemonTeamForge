"use client";

import type { Team } from "@/types/team";

const PENDING_TEAM_STORAGE_KEY = "pokemon-team-forge-pending-load-team";

export function savePendingLoadedTeam(team: Team): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(PENDING_TEAM_STORAGE_KEY, JSON.stringify(team));
  } catch (error) {
    console.error("[Pending Team] Failed to store pending team", error);
  }
}

export function consumePendingLoadedTeam(): Team | null {
  if (typeof window === "undefined") {
    return null;
  }

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PENDING_TEAM_STORAGE_KEY);
  } catch (error) {
    console.error("[Pending Team] Failed to access pending team", error);
    return null;
  }
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
