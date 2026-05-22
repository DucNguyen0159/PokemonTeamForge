import { describe, expect, it } from "vitest";

import {
  appendAuthRedirectQuery,
  authErrorTitle,
  getAuthCallbackUrl,
  getPasswordResetRedirectUrl,
  getLogoutButtonLabel,
  isPasswordRecoveryUrl,
  resolveAuthRedirectTarget,
  sanitizeUsername,
} from "@/lib/auth/auth-utils";

describe("auth utils", () => {
  it("sanitizes profile usernames and falls back to trainer ids", () => {
    expect(sanitizeUsername(" Henry Nguyen! ")).toBe("Henry-Nguyen");
    expect(sanitizeUsername("ab", "12345678-aaaa-bbbb")).toBe("trainer-12345678");
    expect(sanitizeUsername("", "ABCDEF12-aaaa-bbbb")).toBe("trainer-abcdef12");
  });

  it("allows safe auth redirect targets", () => {
    expect(resolveAuthRedirectTarget("/builder")).toBe("/builder");
    expect(resolveAuthRedirectTarget("/team-card?tab=export")).toBe("/team-card?tab=export");
    expect(resolveAuthRedirectTarget(encodeURIComponent("/pokedex?ability=levitate"))).toBe(
      "/pokedex?ability=levitate",
    );
  });

  it("rejects unsafe or circular auth redirect targets", () => {
    expect(resolveAuthRedirectTarget("https://example.com")).toBe("/profile");
    expect(resolveAuthRedirectTarget("//example.com/profile")).toBe("/profile");
    expect(resolveAuthRedirectTarget("/login")).toBe("/profile");
    expect(resolveAuthRedirectTarget("/register")).toBe("/profile");
    expect(resolveAuthRedirectTarget("/forgot-password")).toBe("/profile");
    expect(resolveAuthRedirectTarget("/reset-password")).toBe("/profile");
    expect(resolveAuthRedirectTarget("/auth/callback")).toBe("/profile");
    expect(resolveAuthRedirectTarget("/auth/callback?code=abc")).toBe("/profile");
    expect(resolveAuthRedirectTarget("/admin")).toBe("/profile");
  });

  it("appends redirect query params to auth paths", () => {
    expect(appendAuthRedirectQuery("/forgot-password", "/builder")).toBe(
      "/forgot-password?redirect=%2Fbuilder",
    );
    expect(appendAuthRedirectQuery("/login", null)).toBe("/login");
  });

  it("detects password recovery redirects from query or hash", () => {
    expect(
      isPasswordRecoveryUrl(new URLSearchParams("type=recovery"), new URLSearchParams("")),
    ).toBe(true);
    expect(
      isPasswordRecoveryUrl(new URLSearchParams(""), new URLSearchParams("type=recovery")),
    ).toBe(true);
    expect(
      isPasswordRecoveryUrl(new URLSearchParams("type=signup"), new URLSearchParams("")),
    ).toBe(false);
  });

  it("builds the Supabase auth callback URL from an origin", () => {
    expect(getAuthCallbackUrl("http://localhost:3000")).toBe(
      "http://localhost:3000/auth/callback",
    );
    expect(getAuthCallbackUrl("https://poketeamforge.com/")).toBe(
      "https://poketeamforge.com/auth/callback",
    );
    expect(getAuthCallbackUrl()).toBe("/auth/callback");
  });

  it("builds the Supabase password-reset redirect URL from an origin", () => {
    expect(getPasswordResetRedirectUrl("http://localhost:3000")).toBe(
      "http://localhost:3000/reset-password",
    );
    expect(getPasswordResetRedirectUrl("https://poketeamforge.com/")).toBe(
      "https://poketeamforge.com/reset-password",
    );
    expect(getPasswordResetRedirectUrl()).toBe("/reset-password");
  });

  it("labels logout buttons based on in-flight cleanup state", () => {
    expect(
      getLogoutButtonLabel({ isLoggingOut: false, isLogoutInFlight: false }),
    ).toBe("Log out");
    expect(
      getLogoutButtonLabel({ isLoggingOut: true, isLogoutInFlight: true }),
    ).toBe("Signing out...");
    expect(
      getLogoutButtonLabel({ isLoggingOut: false, isLogoutInFlight: true }),
    ).toBe("Finishing sign out...");
  });

  it("uses a specific title for rate-limited auth attempts", () => {
    expect(authErrorTitle("Too many attempts. Please wait a moment and try again.", "Registration failed")).toBe(
      "Too many attempts",
    );
    expect(authErrorTitle("Email or password is incorrect.", "Sign in failed")).toBe("Sign in failed");
  });
});
