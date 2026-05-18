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
});
