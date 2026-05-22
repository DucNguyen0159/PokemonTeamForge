export const FINISHING_SIGN_OUT_MESSAGE =
  "Finishing sign out. You can sign in again in a moment.";

const DEFAULT_AUTH_REDIRECT = "/profile";

/** Paths that must not be used as post-auth ?redirect= targets. */
export const BLOCKED_AUTH_REDIRECT_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
] as const;

const SAFE_REDIRECT_PATHS = [
  "/builder",
  "/profile",
  "/team-card",
  "/pokedex",
  "/abilities",
  "/strategies",
] as const;

/** True when the current URL is a Supabase password-recovery redirect. */
export function isPasswordRecoveryUrl(
  searchParams: URLSearchParams,
  hashParams: URLSearchParams,
): boolean {
  return (
    searchParams.get("type") === "recovery" || hashParams.get("type") === "recovery"
  );
}

export function getPasswordRecoveryParamsFromLocation(
  locationLike: Pick<Location, "search" | "hash">,
): { searchParams: URLSearchParams; hashParams: URLSearchParams } {
  const searchParams = new URLSearchParams(locationLike.search);
  const hashParams = new URLSearchParams(locationLike.hash.replace(/^#/, ""));
  return { searchParams, hashParams };
}

export function isPasswordRecoveryLocation(
  locationLike: Pick<Location, "search" | "hash">,
): boolean {
  const { searchParams, hashParams } = getPasswordRecoveryParamsFromLocation(locationLike);
  return isPasswordRecoveryUrl(searchParams, hashParams);
}

export function getAuthCallbackUrl(origin?: string): string {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");

  if (!base) {
    return "/auth/callback";
  }

  return `${base.replace(/\/$/, "")}/auth/callback`;
}

/** Supabase resetPasswordForEmail redirectTo target (PKCE lands with ?code=). */
export function getPasswordResetRedirectUrl(origin?: string): string {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");

  if (!base) {
    return "/reset-password";
  }

  return `${base.replace(/\/$/, "")}/reset-password`;
}

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

  if (BLOCKED_AUTH_REDIRECT_PATHS.some((path) => decoded === path || decoded.startsWith(`${path}?`))) {
    return fallback;
  }

  const isSafePath = SAFE_REDIRECT_PATHS.some(
    (path) => decoded === path || decoded.startsWith(`${path}?`) || decoded.startsWith(`${path}/`),
  );

  return isSafePath ? decoded : fallback;
}

/** Preserve ?redirect= through login ↔ register ↔ forgot ↔ reset links. */
export function appendAuthRedirectQuery(
  path: string,
  rawRedirect: string | null | undefined,
): string {
  if (!rawRedirect) {
    return path;
  }

  const params = new URLSearchParams();
  params.set("redirect", rawRedirect);
  return `${path}?${params.toString()}`;
}

export function currentAuthRedirectTarget(fallback = DEFAULT_AUTH_REDIRECT): string {
  if (typeof window === "undefined") {
    return fallback;
  }

  const params = new URLSearchParams(window.location.search);
  return resolveAuthRedirectTarget(params.get("redirect"), fallback);
}

export function getLogoutButtonLabel(options: {
  isLoggingOut: boolean;
  isLogoutInFlight: boolean;
}): string {
  if (!options.isLoggingOut && !options.isLogoutInFlight) {
    return "Log out";
  }

  if (options.isLogoutInFlight && !options.isLoggingOut) {
    return "Finishing sign out...";
  }

  return "Signing out...";
}

export function authErrorTitle(message: string | null | undefined, fallback: string): string {
  const normalized = (message ?? "").toLowerCase();
  return normalized.includes("too many attempts") || normalized.includes("too many requests")
    ? "Too many attempts"
    : fallback;
}
