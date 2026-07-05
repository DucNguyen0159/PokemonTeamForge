"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  loadChampionsTeamById,
  saveChampionsTeam,
  updateChampionsTeam,
} from "@/lib/supabase/champions-team-service";
import { USER_TEAMS_QUERY_KEY } from "@/hooks/queries/user-teams-query";
import type { ChampionsTeam } from "@/types/champions";

export function useSaveChampionsTeamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (team: ChampionsTeam) => saveChampionsTeam(team),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USER_TEAMS_QUERY_KEY });
    },
  });
}

export function useUpdateChampionsTeamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, team }: { teamId: string; team: ChampionsTeam }) =>
      updateChampionsTeam(teamId, team),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USER_TEAMS_QUERY_KEY });
    },
  });
}

export function useLoadChampionsTeamMutation() {
  return useMutation({
    mutationFn: (teamId: string) => loadChampionsTeamById(teamId),
  });
}
