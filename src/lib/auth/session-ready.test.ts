import { describe, expect, it } from "vitest";

import { isSessionReadyForCloudData } from "@/lib/auth/session-ready";

const baseReady = {
  isInitialized: true,
  isAuthenticated: true,
  session: { access_token: "token" } as never,
  user: { id: "user-123" } as never,
  isLogoutInFlight: false,
  isLoading: false,
};

describe("isSessionReadyForCloudData", () => {
  it("is true when auth is initialized with a stable session and user id", () => {
    expect(isSessionReadyForCloudData(baseReady)).toBe(true);
  });

  it("is false while auth is still initializing or loading", () => {
    expect(
      isSessionReadyForCloudData({
        ...baseReady,
        isInitialized: false,
      }),
    ).toBe(false);
    expect(
      isSessionReadyForCloudData({
        ...baseReady,
        isLoading: true,
      }),
    ).toBe(false);
  });

  it("is false when signed out, missing session data, or logout cleanup is in flight", () => {
    expect(
      isSessionReadyForCloudData({
        ...baseReady,
        isAuthenticated: false,
      }),
    ).toBe(false);
    expect(
      isSessionReadyForCloudData({
        ...baseReady,
        session: null,
      }),
    ).toBe(false);
    expect(
      isSessionReadyForCloudData({
        ...baseReady,
        user: null,
      }),
    ).toBe(false);
    expect(
      isSessionReadyForCloudData({
        ...baseReady,
        isLogoutInFlight: true,
      }),
    ).toBe(false);
  });
});
