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

  if (message.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }

  if (
    message.includes("email not confirmed") ||
    message.includes("confirm your email")
  ) {
    return "Please confirm your email before signing in.";
  }

  if (message.includes("already registered")) {
    return "An account with this email already exists.";
  }

  if (message.includes("password")) {
    return "Password is invalid. Please check requirements and try again.";
  }

  if (message.includes("network") || message.includes("fetch")) {
    return "Unable to connect to Supabase right now. Please try again.";
  }

  if (
    message.includes("jwt") ||
    message.includes("unauthorized") ||
    message.includes("permission denied")
  ) {
    return "You are not authorized for this action.";
  }

  if (typedError.code === "PGRST301") {
    return "Please sign in to continue.";
  }

  if (typedError.status === 0) {
    return "Unable to connect to Supabase right now. Please try again.";
  }

  return fallback;
}
