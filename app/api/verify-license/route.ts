// app/api/verify-license/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { licenseKey, instanceName } = body;

    if (!licenseKey || typeof licenseKey !== "string") {
      return NextResponse.json(
        { valid: false, error: "License key is required." },
        { status: 400 }
      );
    }

    const trimmedKey = licenseKey.trim();

    // 1. Founder Master Key bypass for development & internal testing
    if (
      trimmedKey === "GVPRO-FOUNDER-2026-LIFETIME" ||
      trimmedKey === "DEMO-SANDBOX-PRO-KEY"
    ) {
      return NextResponse.json({
        valid: true,
        tier: "PRO_LIFETIME",
        customerName: "Founder / Lifetime Master Tier",
        batchLimit: 500,
        licenseKey: trimmedKey,
        expiresAt: null,
      });
    }

    // 2. Validate against Lemon Squeezy License API
    try {
      const response = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          license_key: trimmedKey,
          instance_name: instanceName || "GridVault_Web_Client",
        }),
      });

      const data = await response.json();

      if (data.valid) {
        return NextResponse.json({
          valid: true,
          tier: "PRO_LIFETIME",
          customerName: data.meta?.customer_name || "Pro Customer",
          batchLimit: 500,
          licenseKey: trimmedKey,
          expiresAt: null,
        });
      } else {
        return NextResponse.json(
          {
            valid: false,
            error: data.error || "Invalid or inactive Lemon Squeezy license key.",
          },
          { status: 403 }
        );
      }
    } catch (networkErr) {
      // In case Lemon Squeezy API is temporarily unreachable or blocked in dev environment,
      // allow standard GVPRO- formatted keys with warning
      if (trimmedKey.startsWith("GVPRO-") && trimmedKey.length >= 12) {
        return NextResponse.json({
          valid: true,
          tier: "PRO_LIFETIME",
          customerName: "Pro Customer (Offline Mode)",
          batchLimit: 500,
          licenseKey: trimmedKey,
          expiresAt: null,
        });
      }

      return NextResponse.json(
        { valid: false, error: "Lemon Squeezy verification service unreachable." },
        { status: 503 }
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ valid: false, error: msg }, { status: 500 });
  }
}
