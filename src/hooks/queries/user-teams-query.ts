import type { QueryClient } from "@tanstack/react-query";

import { isRetryableSupabaseError } from "@/lib/supabase/errors";
import { listUserTeams } from "@/lib/supabase/team-service";

export const USER_TEAMS_QUERY_KEY = ["user-teams"] as const;

export const USER_TEAMS_MAX_RETRIES = 2;

export function getUserTeamsQueryKey(userId: string | null) {
  return [...USER_TEAMS_QUERY_KEY, userId] as const;
}

export function userTeamsRetryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 4000);
}

export function shouldRetryUserTeamsQuery(failureCount: number, error: unknown): boolean {
  return failureCount < USER_TEAMS_MAX_RETRIES && isRetryableSupabaseError(error);
}

export function prefetchUserTeams(queryClient: QueryClient, userId: string) {
  return queryClient.prefetchQuery({
    queryKey: getUserTeamsQueryKey(userId),
    queryFn: () => listUserTeams(userId),
    retry: shouldRetryUserTeamsQuery,
    retryDelay: userTeamsRetryDelay,
  });
}

export type SavedTeamsLoadingStateInput = {
  isAuthenticated: boolean;
  isSessionReady: boolean;
  isPending: boolean;
  isFetching: boolean;
  hasCachedTeams: boolean;
};

export type SavedTeamsLoadingState = {
  isPreparingCloudSync: boolean;
  showInitialSkeleton: boolean;
  isRefreshingTeams: boolean;
};

export function getSavedTeamsLoadingState({
  isAuthenticated,
  isSessionReady,
  isPending,
  isFetching,
  hasCachedTeams,
}: SavedTeamsLoadingStateInput): SavedTeamsLoadingState {
  const isPreparingCloudSync = isAuthenticated && !isSessionReady;
  const showInitialSkeleton =
    isAuthenticated && isSessionReady && isPending && !hasCachedTeams;
  const isRefreshingTeams =
    isAuthenticated && isSessionReady && isFetching && hasCachedTeams;

  return {
    isPreparingCloudSync,
    showInitialSkeleton,
    isRefreshingTeams,
  };
}
