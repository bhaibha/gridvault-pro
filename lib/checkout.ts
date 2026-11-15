import { licenseConfig } from "./license-session";
import { sellerDetails } from "./seller-details";

export function checkoutUrl(): URL | null {
  if (process.env.GRIDVAULT_CHECKOUT_ENABLED !== "true" ||
      !sellerDetails() || !licenseConfig() || !process.env.GEMINI_PAID_API_KEY) return null;

  try {
    const url = new URL(process.env.LEMON_SQUEEZY_CHECKOUT_URL ?? "");
    if (url.protocol === "https:" && url.hostname.endsWith(".lemonsqueezy.com") &&
        !url.username && !url.password && !url.port && url.pathname.startsWith("/checkout/buy/")) return url;
  } catch {
    // Checkout remains unavailable until a valid URL is configured.
  }
  return null;
}
