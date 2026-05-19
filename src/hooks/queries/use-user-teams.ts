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
import {
  getUserTeamsQueryKey,
  shouldRetryUserTeamsQuery,
  USER_TEAMS_QUERY_KEY,
  userTeamsRetryDelay,
} from "@/hooks/queries/user-teams-query";
import { useAuthStore } from "@/store/auth-store";
import type { Team } from "@/types/team";

export { USER_TEAMS_QUERY_KEY, prefetchUserTeams } from "@/hooks/queries/user-teams-query";

export function useUserTeams() {
  const isSessionReady = useAuthStore(selectIsSessionReady);
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: getUserTeamsQueryKey(userId),
    queryFn: () => listUserTeams(userId),
    enabled: isSessionReady && Boolean(userId),
    retry: shouldRetryUserTeamsQuery,
    retryDelay: userTeamsRetryDelay,
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
