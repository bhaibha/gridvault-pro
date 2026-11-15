import { afterEach, describe, expect, it, vi } from "vitest";
import { createLicenseSession, hasLicenseSession } from "../lib/license-session";

describe("paid workspace session", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("rejects missing, forged, expired, and unconfigured sessions", () => {
    const secret = "test-signing-secret-with-at-least-32-characters";
    vi.stubEnv("GRIDVAULT_SESSION_SECRET", secret);
    vi.stubEnv("LEMON_SQUEEZY_STORE_ID", "123");
    vi.stubEnv("LEMON_SQUEEZY_VARIANT_ID", "456");
    vi.useFakeTimers();
    const token = createLicenseSession(secret);

    expect(hasLicenseSession()).toBe(false);
    expect(hasLicenseSession(token + "x")).toBe(false);
    expect(hasLicenseSession(token)).toBe(true);
    vi.advanceTimersByTime(60 * 60 * 1000);
    expect(hasLicenseSession(token)).toBe(false);
    vi.stubEnv("LEMON_SQUEEZY_STORE_ID", "");
    expect(hasLicenseSession(createLicenseSession(secret))).toBe(false);
  });
});
