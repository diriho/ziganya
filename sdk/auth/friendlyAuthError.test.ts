import { describe, expect, it } from "vitest";
import { friendlyAuthError } from "./index";

const withStatus = (message: string, status: number) => Object.assign(new Error(message), { status });

describe("friendlyAuthError", () => {
  it("attributes gateway timeouts to Supabase's infrastructure, not a specific cause", () => {
    expect(friendlyAuthError(withStatus("", 504))).toMatch(/status\.supabase\.com/i);
    expect(friendlyAuthError(withStatus("Gateway Time-out", 504))).toMatch(/restart/i);
    expect(friendlyAuthError(new Error("upstream request timeout"))).toMatch(/not your account/i);
    // Regression: this used to hard-code "confirmation email" as the cause even when the
    // timeout came from the Google OAuth authorize call, which never sends an email.
    expect(friendlyAuthError(new Error("upstream request timeout"))).not.toMatch(/confirmation email/i);
  });

  it("maps common Supabase auth messages", () => {
    expect(friendlyAuthError(new Error("Invalid login credentials"))).toBe("Incorrect email or password.");
    expect(friendlyAuthError(new Error("User already registered"))).toMatch(/already exists/);
    expect(friendlyAuthError(new Error("Error sending confirmation email"))).toMatch(/may have been created/);
    expect(friendlyAuthError(new Error("Signups not allowed for this instance"))).toMatch(/disabled/);
  });

  it("maps OAuth return errors", () => {
    expect(friendlyAuthError(new Error("Unsupported provider: provider is not enabled"))).toMatch(/Google sign-in isn't enabled/);
    expect(friendlyAuthError(new Error("access_denied"))).toMatch(/cancelled/);
    expect(friendlyAuthError(new Error("invalid request: both auth code and code verifier should be non-empty"))).toMatch(/expired|different browser/);
  });

  it("falls back sensibly", () => {
    expect(friendlyAuthError(undefined, "Nope.")).toBe("Nope.");
    expect(friendlyAuthError(withStatus("", 418), "Nope.")).toBe("Nope. (HTTP 418)");
    expect(friendlyAuthError(new Error("Some unusual message"))).toBe("Some unusual message");
  });
});
