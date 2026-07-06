"use client";

import { useMemo } from "react";

import {
  buildActiveTeamNextStep,
  buildActiveTeamSnapshot,
} from "@/lib/champions/active-team-snapshot";
import { usePokemonSummariesBySlot } from "@/hooks/queries/use-pokemon-catalog";
import { useChampionsTeamStore } from "@/store/champions-team-store";

export function useActiveTeamSnapshot() {
  const team = useChampionsTeamStore((state) => state.team);

  return useMemo(() => {
    const snapshot = buildActiveTeamSnapshot(team);
    const nextStep = buildActiveTeamNextStep(snapshot, team);
    return { team, snapshot, nextStep };
  }, [team]);
}

export function useActiveTeamSummaries() {
  const team = useChampionsTeamStore((state) => state.team);
  return usePokemonSummariesBySlot(team.pokemon);
}
