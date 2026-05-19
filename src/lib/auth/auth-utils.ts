const DEFAULT_AUTH_REDIRECT = "/profile";
const SAFE_REDIRECT_PATHS = [
  "/builder",
  "/profile",
  "/team-card",
  "/pokedex",
  "/abilities",
  "/strategies",
] as const;

export function sanitizeUsername(value: string | null | undefined, fallbackUserId?: string): string {
  const normalized = (value ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 32);

  if (normalized.length >= 3) {
    return normalized;
  }

  return fallbackUserId ? `trainer-${fallbackUserId.slice(0, 8).toLowerCase()}` : "";
}

export function resolveAuthRedirectTarget(
  rawRedirect: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT,
): string {
  if (!rawRedirect) {
    return fallback;
  }

  let decoded = rawRedirect;
  try {
    decoded = decodeURIComponent(rawRedirect);
  } catch {
    return fallback;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) {
    return fallback;
  }

  if (decoded === "/login" || decoded === "/register") {
    return fallback;
  }

  const isSafePath = SAFE_REDIRECT_PATHS.some(
    (path) => decoded === path || decoded.startsWith(`${path}?`) || decoded.startsWith(`${path}/`),
  );

  return isSafePath ? decoded : fallback;
}

export function currentAuthRedirectTarget(fallback = DEFAULT_AUTH_REDIRECT): string {
  if (typeof window === "undefined") {
    return fallback;
  }

  const params = new URLSearchParams(window.location.search);
  return resolveAuthRedirectTarget(params.get("redirect"), fallback);
}

export function authErrorTitle(message: string | null | undefined, fallback: string): string {
  const normalized = (message ?? "").toLowerCase();
  return normalized.includes("too many attempts") || normalized.includes("too many requests")
    ? "Too many attempts"
    : fallback;
}
