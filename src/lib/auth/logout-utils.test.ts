import { describe, expect, it, vi } from "vitest";

import { runLogoutCleanupWithTimeout } from "@/lib/auth/logout-utils";

describe("runLogoutCleanupWithTimeout", () => {
  it("completes when cleanup resolves", async () => {
    await expect(runLogoutCleanupWithTimeout(() => Promise.resolve(), 100)).resolves.toBe(
      "completed",
    );
  });

  it("reports failed cleanup without throwing", async () => {
    await expect(
      runLogoutCleanupWithTimeout(() => Promise.reject(new Error("offline")), 100),
    ).resolves.toBe("failed");
  });

  it("times out hanging cleanup", async () => {
    vi.useFakeTimers();

    const resultPromise = runLogoutCleanupWithTimeout(
      () => new Promise(() => undefined),
      100,
    );

    await vi.advanceTimersByTimeAsync(100);
    await expect(resultPromise).resolves.toBe("timed-out");

    vi.useRealTimers();
  });
});
