"use client";

type SupabaseLikeError = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
  status?: number;
  name?: string;
};

function normalizeMessage(message: string | undefined): string {
  return (message ?? "").toLowerCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toSupabaseLikeError(error: unknown): SupabaseLikeError | null {
  if (error instanceof Error) {
    return error as SupabaseLikeError;
  }

  if (!isRecord(error)) {
    return null;
  }

  return {
    message: typeof error.message === "string" ? error.message : undefined,
    details: typeof error.details === "string" ? error.details : undefined,
    hint: typeof error.hint === "string" ? error.hint : undefined,
    code: typeof error.code === "string" ? error.code : undefined,
    status: typeof error.status === "number" ? error.status : undefined,
    name: typeof error.name === "string" ? error.name : undefined,
  };
}

function combinedMessage(error: SupabaseLikeError): string {
  return normalizeMessage([error.message, error.details, error.hint].filter(Boolean).join(" "));
}

export function isRetryableSupabaseError(error: unknown): boolean {
  const typedError = toSupabaseLikeError(error);
  if (!typedError) {
    return false;
  }

  const message = combinedMessage(typedError);

  if (typedError.status === 0 || message.includes("failed to fetch") || message.includes("network")) {
    return true;
  }

  if (
    message.includes("could not find the table") ||
    message.includes("schema cache") ||
    message.includes("relation") ||
    message.includes("no api key") ||
    message.includes("jwt") ||
    message.includes("row-level security") ||
    message.includes("permission denied") ||
    typedError.code === "PGRST205" ||
    typedError.code === "42501" ||
    typedError.status === 401 ||
    typedError.status === 403
  ) {
    return false;
  }

  return true;
}

export function toFriendlySupabaseMessage(
  error: unknown,
  fallback: string,
): string {
  const typedError = toSupabaseLikeError(error);
  if (!typedError) {
    return fallback;
  }

  const message = combinedMessage(typedError);

  if (message.includes("no api key") || message.includes("apikey")) {
    return "Supabase request is missing the public anon key. Check NEXT_PUBLIC_SUPABASE_ANON_KEY and restart the dev server.";
  }

  if (
    message.includes("could not find the table") ||
    message.includes("schema cache") ||
    message.includes("relation") && message.includes("does not exist") ||
    typedError.code === "PGRST205"
  ) {
    return "Saved-team database tables are not ready. Run supabase/auth-saved-teams.sql, then reload the Supabase schema cache.";
  }

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials") ||
    message.includes("invalid email or password")
  ) {
    return "Email or password is incorrect.";
  }

  if (
    message.includes("email not confirmed") ||
    message.includes("confirm your email")
  ) {
    return "Please confirm your email before signing in.";
  }

  if (
    message.includes("already registered") ||
    message.includes("user already registered") ||
    message.includes("already exists")
  ) {
    return "An account with this email already exists.";
  }

  if (
    message.includes("weak password") ||
    message.includes("password should be") ||
    message.includes("password must")
  ) {
    return "Password is too weak. Use at least 8 characters and avoid common passwords.";
  }

  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (message.includes("email") && message.includes("invalid")) {
    return "Please enter a valid email address.";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("load failed")
  ) {
    return "Unable to connect to Supabase right now. Please try again.";
  }

  if (
    message.includes("jwt") ||
    message.includes("row-level security") ||
    message.includes("rls") ||
    message.includes("unauthorized") ||
    message.includes("permission denied") ||
    typedError.code === "42501" ||
    typedError.status === 403
  ) {
    return "Your session does not have access to this saved team data. Try refreshing or signing in again.";
  }

  if (typedError.code === "PGRST301" || typedError.status === 401) {
    return "Please sign in to continue.";
  }

  if (typedError.status === 0) {
    return "Unable to connect to Supabase right now. Please try again.";
  }

  return fallback;
}
