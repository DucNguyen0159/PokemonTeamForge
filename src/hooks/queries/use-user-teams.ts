"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { selectIsSessionReady } from "@/lib/auth/session-ready";
import {
  deleteSavedTeam,
  listUserTeams,
  loadSavedTeamById,
  renameSavedTeam,
  saveTeam,
  updateSavedTeam,
} from "@/lib/supabase/team-service";
import { isRetryableSupabaseError } from "@/lib/supabase/errors";
import { useAuthStore } from "@/store/auth-store";
import type { Team } from "@/types/team";

export const USER_TEAMS_QUERY_KEY = ["user-teams"] as const;

export function useUserTeams() {
  const isSessionReady = useAuthStore(selectIsSessionReady);
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: [...USER_TEAMS_QUERY_KEY, userId],
    queryFn: () => listUserTeams(userId),
    enabled: isSessionReady && Boolean(userId),
    retry: (failureCount, error) =>
      failureCount < 1 && isRetryableSupabaseError(error),
  });
}

export function useSaveTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (team: Team) => saveTeam(team),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USER_TEAMS_QUERY_KEY });
    },
  });
}

export function useUpdateTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, team }: { teamId: string; team: Team }) =>
      updateSavedTeam(teamId, team),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USER_TEAMS_QUERY_KEY });
    },
  });
}

export function useRenameTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, name }: { teamId: string; name: string }) =>
      renameSavedTeam(teamId, name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USER_TEAMS_QUERY_KEY });
    },
  });
}

export function useDeleteTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => deleteSavedTeam(teamId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USER_TEAMS_QUERY_KEY });
    },
  });
}

export function useLoadTeamMutation() {
  return useMutation({
    mutationFn: (teamId: string) => loadSavedTeamById(teamId),
  });
}
