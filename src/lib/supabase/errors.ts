"use client";

type SupabaseLikeError = {
  message?: string;
  code?: string;
  status?: number;
  name?: string;
};

function normalizeMessage(message: string | undefined): string {
  return (message ?? "").toLowerCase();
}

export function toFriendlySupabaseMessage(
  error: unknown,
  fallback: string,
): string {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const typedError = error as SupabaseLikeError;
  const message = normalizeMessage(typedError.message);

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
    message.includes("permission denied")
  ) {
    return "Your session does not have access to this saved team data. Try refreshing or signing in again.";
  }

  if (typedError.code === "PGRST301") {
    return "Please sign in to continue.";
  }

  if (typedError.status === 0) {
    return "Unable to connect to Supabase right now. Please try again.";
  }

  return fallback;
}
