import { describe, expect, it } from "vitest";

import {
  createAuthGenerationGuard,
  createAuthOperationQueue,
  createLogoutInFlightTracker,
} from "@/lib/auth/auth-operations";

describe("auth operation queue", () => {
  it("runs operations one at a time in order", async () => {
    const queue = createAuthOperationQueue();
    const order: number[] = [];

    const first = queue.enqueue(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      order.push(1);
    });
    const second = queue.enqueue(async () => {
      order.push(2);
    });

    await Promise.all([first, second]);
    expect(order).toEqual([1, 2]);
  });

  it("propagates errors without blocking the queue", async () => {
    const queue = createAuthOperationQueue();

    await expect(
      queue.enqueue(async () => {
        throw new Error("fail");
      }),
    ).rejects.toThrow("fail");

    await expect(
      queue.enqueue(async () => "ok"),
    ).resolves.toBe("ok");
  });
});

describe("auth generation guard", () => {
  it("bumps generation and detects stale snapshots", () => {
    const guard = createAuthGenerationGuard();
    const first = guard.bump();
    expect(guard.get()).toBe(first);
    expect(guard.isStale(first)).toBe(false);

    guard.bump();
    expect(guard.isStale(first)).toBe(true);
    expect(guard.isStale(guard.get())).toBe(false);
  });
});

describe("logout in-flight tracker", () => {
  it("blocks waitUntilSettled until settle is called", async () => {
    const tracker = createLogoutInFlightTracker();
    tracker.begin();
    expect(tracker.isInFlight()).toBe(true);

    let settled = false;
    const waiting = tracker.waitUntilSettled().then(() => {
      settled = true;
    });

    await Promise.resolve();
    expect(settled).toBe(false);

    tracker.settle();
    await waiting;
    expect(settled).toBe(true);
    expect(tracker.isInFlight()).toBe(false);
  });

  it("resolves immediately when no logout is in flight", async () => {
    const tracker = createLogoutInFlightTracker();
    await expect(tracker.waitUntilSettled()).resolves.toBeUndefined();
    expect(tracker.isInFlight()).toBe(false);
  });
});
