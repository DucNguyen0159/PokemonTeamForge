import { describe, expect, it } from "vitest";

import {
  isRetryableSupabaseError,
  toFriendlySupabaseMessage,
} from "@/lib/supabase/errors";

describe("toFriendlySupabaseMessage", () => {
  it("normalizes common auth failures", () => {
    expect(toFriendlySupabaseMessage(new Error("Invalid login credentials"), "fallback")).toBe(
      "Email or password is incorrect.",
    );
    expect(toFriendlySupabaseMessage(new Error("User already registered"), "fallback")).toBe(
      "An account with this email already exists.",
    );
    expect(toFriendlySupabaseMessage(new Error("Weak password"), "fallback")).toBe(
      "Password is too weak. Use at least 8 characters and avoid common passwords.",
    );
    expect(toFriendlySupabaseMessage(new Error("Too many requests"), "fallback")).toBe(
      "Too many attempts. Please wait a moment and try again.",
    );
  });

  it("uses fallback when the error is unknown", () => {
    expect(toFriendlySupabaseMessage(new Error("Unexpected auth issue"), "fallback")).toBe(
      "fallback",
    );
    expect(toFriendlySupabaseMessage("not an error", "fallback")).toBe("fallback");
  });

  it("normalizes account access and network failures", () => {
    expect(toFriendlySupabaseMessage(new Error("Failed to fetch"), "fallback")).toBe(
      "Unable to connect to Supabase right now. Please try again.",
    );
    expect(toFriendlySupabaseMessage(new Error("new row violates row-level security policy"), "fallback")).toBe(
      "Your session does not have access to this account data. Try refreshing or signing in again.",
    );
  });

  it("normalizes plain PostgREST setup and api-key errors", () => {
    expect(
      toFriendlySupabaseMessage(
        {
          code: "PGRST205",
          message: "Could not find the table 'public.teams' in the schema cache",
        },
        "fallback",
      ),
    ).toBe(
      "Saved-team database tables are not ready. Run supabase/auth-saved-teams.sql, then reload the Supabase schema cache.",
    );
    expect(
      toFriendlySupabaseMessage(
        {
          message: "No API key found in request",
          hint: "No apikey request header or url param was found.",
        },
        "fallback",
      ),
    ).toBe(
      "Supabase request is missing the public anon key. Check NEXT_PUBLIC_SUPABASE_ANON_KEY and restart the dev server.",
    );
  });

  it("marks only transient saved-team failures as retryable", () => {
    expect(isRetryableSupabaseError(new Error("Failed to fetch"))).toBe(true);
    expect(
      isRetryableSupabaseError({
        code: "PGRST205",
        message: "Could not find the table 'public.teams' in the schema cache",
      }),
    ).toBe(false);
    expect(isRetryableSupabaseError({ status: 403, message: "permission denied" })).toBe(false);
  });
});
