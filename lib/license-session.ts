import { createHmac, timingSafeEqual } from "node:crypto";

export const LICENSE_COOKIE = "gridvault_license";
export const LICENSE_SESSION_SECONDS = 60 * 60;

export function licenseConfig() {
  const secret = process.env.GRIDVAULT_SESSION_SECRET;
  const store = process.env.LEMON_SQUEEZY_STORE_ID;
  const variant = process.env.LEMON_SQUEEZY_VARIANT_ID;
  if (!secret || secret.length < 32 || !store || !variant) return null;
  return { secret, store, variant };
}

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createLicenseSession(secret: string) {
  const expires = String(Math.floor(Date.now() / 1000) + LICENSE_SESSION_SECONDS);
  return expires + "." + signature(expires, secret);
}

export function hasLicenseSession(token?: string) {
  const config = licenseConfig();
  if (!config || !token) return false;
  const [expires, mac, extra] = token.split(".");
  if (extra !== undefined || !/^\d{10}$/.test(expires) || Number(expires) <= Date.now() / 1000 || !mac) return false;
  const expected = Buffer.from(signature(expires, config.secret));
  const received = Buffer.from(mac);
  return received.length === expected.length && timingSafeEqual(received, expected);
}
