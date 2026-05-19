import { describe, expect, it } from "vitest";

import { getSavedTeamsLoadingState } from "@/hooks/queries/user-teams-query";

describe("getSavedTeamsLoadingState", () => {
  it("shows preparing state before the session is ready", () => {
    expect(
      getSavedTeamsLoadingState({
        isAuthenticated: true,
        isSessionReady: false,
        isPending: true,
        isFetching: false,
        hasCachedTeams: false,
      }),
    ).toEqual({
      isPreparingCloudSync: true,
      showInitialSkeleton: false,
      isRefreshingTeams: false,
    });
  });

  it("shows an initial skeleton only for the first fetch", () => {
    expect(
      getSavedTeamsLoadingState({
        isAuthenticated: true,
        isSessionReady: true,
        isPending: true,
        isFetching: true,
        hasCachedTeams: false,
      }),
    ).toEqual({
      isPreparingCloudSync: false,
      showInitialSkeleton: true,
      isRefreshingTeams: false,
    });
  });

  it("shows a refresh state when cached teams are being updated", () => {
    expect(
      getSavedTeamsLoadingState({
        isAuthenticated: true,
        isSessionReady: true,
        isPending: false,
        isFetching: true,
        hasCachedTeams: true,
      }),
    ).toEqual({
      isPreparingCloudSync: false,
      showInitialSkeleton: false,
      isRefreshingTeams: true,
    });
  });
});
