"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addCommunityTeamComment,
  COMMUNITY_TEAM_NOT_FOUND_MESSAGE,
  deleteCommunityTeamComment,
  forkCommunityTeamToDraft,
  getCommunityChampionsTeamById,
  listCommunityChampionsTeams,
  publishChampionsTeam,
  toggleCommunityTeamStar,
} from "@/lib/supabase/champions-community-service";
import { isRetryableSupabaseError } from "@/lib/supabase/errors";
import { useAuthStore } from "@/store/auth-store";
import type {
  ChampionsCommunityFormatFilter,
  ChampionsCommunitySort,
} from "@/types/champions-community";

export const CHAMPIONS_COMMUNITY_QUERY_KEY = ["champions-community"] as const;
export const CHAMPIONS_COMMUNITY_DETAIL_QUERY_KEY = ["champions-community-detail"] as const;

function communityListQueryKey(sort: ChampionsCommunitySort, format: ChampionsCommunityFormatFilter) {
  return [...CHAMPIONS_COMMUNITY_QUERY_KEY, sort, format] as const;
}

function communityDetailQueryKey(teamId: string) {
  return [...CHAMPIONS_COMMUNITY_DETAIL_QUERY_KEY, teamId] as const;
}

export function useChampionsCommunityList(
  sort: ChampionsCommunitySort,
  format: ChampionsCommunityFormatFilter,
) {
  return useQuery({
    queryKey: communityListQueryKey(sort, format),
    queryFn: () => listCommunityChampionsTeams({ sort, format }),
    staleTime: 60_000,
    retry: (failureCount, error) =>
      failureCount < 1 && !(error instanceof Error && error.message.includes("sign in")),
  });
}

export function useChampionsCommunityDetail(teamId: string) {
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);

  return useQuery({
    queryKey: communityDetailQueryKey(teamId),
    queryFn: () => getCommunityChampionsTeamById(teamId),
    enabled: Boolean(teamId) && isAuthInitialized,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === COMMUNITY_TEAM_NOT_FOUND_MESSAGE) {
        return false;
      }
      return failureCount < 2 && isRetryableSupabaseError(error);
    },
    retryDelay: (attempt) => Math.min(750 * 2 ** attempt, 3_000),
  });
}

export function useToggleChampionsTeamStarMutation(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toggleCommunityTeamStar(teamId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHAMPIONS_COMMUNITY_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: communityDetailQueryKey(teamId) });
    },
  });
}

export function usePublishChampionsTeamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, isPublic }: { teamId: string; isPublic: boolean }) =>
      publishChampionsTeam(teamId, isPublic),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHAMPIONS_COMMUNITY_QUERY_KEY });
    },
  });
}

export function useAddCommunityTeamCommentMutation(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => addCommunityTeamComment(teamId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHAMPIONS_COMMUNITY_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: communityDetailQueryKey(teamId) });
    },
  });
}

export function useDeleteCommunityTeamCommentMutation(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteCommunityTeamComment(commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHAMPIONS_COMMUNITY_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: communityDetailQueryKey(teamId) });
    },
  });
}

export function useForkCommunityTeamMutation() {
  return useMutation({
    mutationFn: (teamId: string) => forkCommunityTeamToDraft(teamId),
  });
}
