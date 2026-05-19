export type AuthOperationQueue = {
  enqueue: <T>(operation: () => Promise<T>) => Promise<T>;
};

export type AuthGenerationGuard = {
  bump: () => number;
  get: () => number;
  isStale: (snapshot: number) => boolean;
};

export type LogoutInFlightTracker = {
  begin: () => void;
  settle: () => void;
  waitUntilSettled: () => Promise<void>;
  isInFlight: () => boolean;
};

export function createAuthOperationQueue(): AuthOperationQueue {
  let tail: Promise<unknown> = Promise.resolve();

  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = tail.then(operation, operation);
    tail = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }

  return { enqueue };
}

export function createAuthGenerationGuard(): AuthGenerationGuard {
  let generation = 0;

  return {
    bump(): number {
      generation += 1;
      return generation;
    },
    get(): number {
      return generation;
    },
    isStale(snapshot: number): boolean {
      return snapshot !== generation;
    },
  };
}

export function createLogoutInFlightTracker(): LogoutInFlightTracker {
  let settleCurrent: (() => void) | null = null;
  let settledPromise: Promise<void> = Promise.resolve();
  let inFlight = false;

  return {
    begin(): void {
      inFlight = true;
      settledPromise = new Promise<void>((resolve) => {
        settleCurrent = resolve;
      });
    },
    settle(): void {
      if (settleCurrent) {
        settleCurrent();
        settleCurrent = null;
      }
      inFlight = false;
    },
    waitUntilSettled(): Promise<void> {
      return settledPromise;
    },
    isInFlight(): boolean {
      return inFlight;
    },
  };
}
