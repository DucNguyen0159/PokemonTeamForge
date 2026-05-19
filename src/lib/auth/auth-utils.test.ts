import { describe, expect, it } from "vitest";

import {
  authErrorTitle,
  getLogoutButtonLabel,
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
    expect(resolveAuthRedirectTarget("/admin")).toBe("/profile");
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
