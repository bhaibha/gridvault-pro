import { NextResponse } from "next/server";
import { licenseConfig } from "@/lib/license-session";

export function GET(req: Request) {
  let checkout: URL | undefined;
  try {
    checkout = new URL(process.env.LEMON_SQUEEZY_CHECKOUT_URL ?? "");
  } catch {
    // In demo deployments the checkout URL is unset.
  }
  if (process.env.GRIDVAULT_CHECKOUT_ENABLED !== "true" || !licenseConfig() || !process.env.GEMINI_API_KEY || checkout?.protocol !== "https:" ||
      !checkout.hostname.endsWith(".lemonsqueezy.com") || !checkout.pathname.startsWith("/checkout/buy/")) {
    return NextResponse.redirect(new URL("/app?checkout=unavailable", req.url));
  }
  return NextResponse.redirect(checkout);
}
