import { describe, expect, it } from "vitest";

import { toFriendlySupabaseMessage } from "@/lib/supabase/errors";

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

  it("normalizes saved-team access and network failures", () => {
    expect(toFriendlySupabaseMessage(new Error("Failed to fetch"), "fallback")).toBe(
      "Unable to connect to Supabase right now. Please try again.",
    );
    expect(toFriendlySupabaseMessage(new Error("new row violates row-level security policy"), "fallback")).toBe(
      "Your session does not have access to this saved team data. Try refreshing or signing in again.",
    );
  });
});
