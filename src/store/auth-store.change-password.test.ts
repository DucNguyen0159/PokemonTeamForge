import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHANGE_PASSWORD_SUCCESS_MESSAGE } from "@/lib/auth/auth-constants";

const signInWithPassword = vi.fn();
const updateUser = vi.fn();
const getSession = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword,
      updateUser,
      getSession,
    },
  }),
}));

import { useAuthStore } from "@/store/auth-store";

function resetAuthStore() {
  useAuthStore.setState({
    session: { access_token: "token" } as never,
    user: { id: "user-1", email: "trainer@example.com" } as never,
    profile: {
      id: "user-1",
      username: "MexuHenry",
      avatarUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    isAuthenticated: true,
    isLoading: false,
    isLogoutInFlight: false,
    isInitialized: true,
    error: null,
  });
}

describe("auth-store changePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAuthStore();

    signInWithPassword.mockResolvedValue({
      data: { session: { access_token: "token" }, user: { id: "user-1" } },
      error: null,
    });
    updateUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    getSession.mockResolvedValue({
      data: {
        session: { access_token: "token" },
        user: { id: "user-1", email: "trainer@example.com" },
      },
      error: null,
    });
  });

  it("verifies the current password before updating", async () => {
    const result = await useAuthStore
      .getState()
      .changePassword("old-password", "new-password-99");

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "trainer@example.com",
      password: "old-password",
    });
    expect(updateUser).toHaveBeenCalledWith({ password: "new-password-99" });
    expect(result).toEqual({
      success: true,
      message: CHANGE_PASSWORD_SUCCESS_MESSAGE,
    });
  });

  it("returns a friendly message when current password verification fails", async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: new Error("Invalid login credentials"),
    });

    const result = await useAuthStore
      .getState()
      .changePassword("wrong-password", "new-password-99");

    expect(updateUser).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.message).toContain("incorrect");
  });

  it("requires a signed-in account with an email", async () => {
    useAuthStore.setState({
      session: null,
      user: null,
      profile: null,
      isAuthenticated: false,
    });

    const result = await useAuthStore
      .getState()
      .changePassword("old-password", "new-password-99");

    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.message).toContain("Sign in again");
  });
});
