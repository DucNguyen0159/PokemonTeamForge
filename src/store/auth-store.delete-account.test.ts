import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
const signOut = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    rpc,
    auth: {
      signOut,
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

describe("auth-store deleteAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAuthStore();

    rpc.mockResolvedValue({ data: null, error: null });
    signOut.mockResolvedValue({ error: null });
  });

  it("returns a friendly message when delete_own_account RPC fails", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "function delete_own_account() does not exist", code: "42883" },
    });

    const result = await useAuthStore.getState().deleteAccount();

    expect(rpc).toHaveBeenCalledWith("delete_own_account");
    expect(signOut).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.message).toContain("delete");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("calls RPC then signs out locally when deletion succeeds", async () => {
    const result = await useAuthStore.getState().deleteAccount();

    expect(rpc).toHaveBeenCalledWith("delete_own_account");
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(result.success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
