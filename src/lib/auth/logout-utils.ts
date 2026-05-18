export const LOGOUT_CLEANUP_TIMEOUT_MS = 4000;

export type LogoutCleanupResult = "completed" | "failed" | "timed-out";

export async function runLogoutCleanupWithTimeout(
  cleanup: () => Promise<unknown>,
  timeoutMs = LOGOUT_CLEANUP_TIMEOUT_MS,
): Promise<LogoutCleanupResult> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<LogoutCleanupResult>((resolve) => {
    timeoutId = setTimeout(() => resolve("timed-out"), timeoutMs);
  });

  const cleanupPromise = cleanup()
    .then((): LogoutCleanupResult => "completed")
    .catch((): LogoutCleanupResult => "failed");

  const result = await Promise.race([cleanupPromise, timeoutPromise]);

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  return result;
}
