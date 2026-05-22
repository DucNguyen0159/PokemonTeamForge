import { beforeEach, describe, expect, it, vi } from "vitest";

import { PASSWORD_RESET_EMAIL_SENT_MESSAGE } from "@/lib/auth/auth-constants";

const resetPasswordForEmail = vi.fn();
const updateUser = vi.fn();
const getSession = vi.fn();
const fromMock = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      resetPasswordForEmail,
      updateUser,
      getSession,
    },
    from: fromMock,
  }),
}));

vi.mock("@/lib/auth/auth-utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/auth-utils")>();
  return {
    ...actual,
    getPasswordResetRedirectUrl: vi.fn(() => "http://localhost:3000/reset-password"),
  };
});

import { useAuthStore } from "@/store/auth-store";

function resetAuthStore() {
  useAuthStore.setState({
    session: null,
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: false,
    isLogoutInFlight: false,
    isInitialized: true,
    error: null,
  });
}

describe("auth-store password reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAuthStore();

    resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    updateUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    });
  });

  it("calls resetPasswordForEmail with reset-password redirect and generic success", async () => {
    const result = await useAuthStore.getState().requestPasswordReset("trainer@example.com");

    expect(resetPasswordForEmail).toHaveBeenCalledWith("trainer@example.com", {
      redirectTo: "http://localhost:3000/reset-password",
    });
    expect(result).toEqual({
      success: true,
      message: PASSWORD_RESET_EMAIL_SENT_MESSAGE,
    });
  });

  it("returns a friendly message when resetPasswordForEmail fails", async () => {
    resetPasswordForEmail.mockResolvedValue({
      data: {},
      error: new Error("Too many requests"),
    });

    const result = await useAuthStore.getState().requestPasswordReset("trainer@example.com");

    expect(result.success).toBe(false);
    expect(result.message).toContain("Too many attempts");
  });

  it("calls updateUser with the new password", async () => {
    const result = await useAuthStore.getState().updatePassword("new-password-99");

    expect(updateUser).toHaveBeenCalledWith({ password: "new-password-99" });
    expect(getSession).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.message).toContain("Password updated");
  });

  it("returns a friendly message when updateUser fails", async () => {
    updateUser.mockResolvedValue({
      data: { user: null },
      error: new Error("Auth session missing"),
    });

    const result = await useAuthStore.getState().updatePassword("new-password-99");

    expect(result.success).toBe(false);
    expect(result.message).toContain("reset session expired");
  });
});
