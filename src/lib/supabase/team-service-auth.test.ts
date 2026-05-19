import { beforeEach, describe, expect, it, vi } from "vitest";

const getUserMock = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getUser: getUserMock,
    },
  }),
}));

import { resolveAuthenticatedUserId } from "@/lib/supabase/team-service";

describe("resolveAuthenticatedUserId", () => {
  beforeEach(() => {
    getUserMock.mockReset();
  });

  it("returns a trusted user id without calling Supabase auth", async () => {
    await expect(resolveAuthenticatedUserId("user-123")).resolves.toBe("user-123");
    expect(getUserMock).not.toHaveBeenCalled();
  });

  it("falls back to getUser when no trusted id is provided", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "server-user" } },
      error: null,
    });

    await expect(resolveAuthenticatedUserId()).resolves.toBe("server-user");
    expect(getUserMock).toHaveBeenCalledTimes(1);
  });

  it("throws when fallback auth has no user", async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(resolveAuthenticatedUserId(null)).rejects.toThrow(
      "Please sign in to manage saved teams.",
    );
  });
});
