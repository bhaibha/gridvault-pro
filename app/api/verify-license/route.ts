import { NextRequest, NextResponse } from "next/server";
import { createLicenseSession, hasLicenseSession, LICENSE_COOKIE, LICENSE_SESSION_SECONDS, licenseConfig } from "@/lib/license-session";

export function GET(req: NextRequest) {
  return NextResponse.json(
    { valid: hasLicenseSession(req.cookies.get(LICENSE_COOKIE)?.value) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function POST(req: NextRequest) {
  const config = licenseConfig();
  if (!config) return NextResponse.json({ error: "License activation is not configured." }, { status: 503 });

  const body = await req.json().catch(() => null);
  const licenseKey = typeof body?.licenseKey === "string" ? body.licenseKey.trim() : "";
  const instanceId = typeof body?.instanceId === "string" ? body.instanceId : "";
  if (!licenseKey || licenseKey.length > 128 || (instanceId && !/^[\w-]{1,80}$/.test(instanceId))) {
    return NextResponse.json({ error: "Enter a valid purchase license key." }, { status: 400 });
  }

  try {
    const fields = new URLSearchParams({ license_key: licenseKey });
    fields.set(instanceId ? "instance_id" : "instance_name", instanceId || "GridVault web browser");
    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/licenses/${instanceId ? "validate" : "activate"}`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
        body: fields,
        signal: AbortSignal.timeout(10000),
      }
    );
    if (response.status >= 500 || response.status === 429) throw new Error("License service unavailable");
    const result = await response.json();
    const verified = instanceId ? result.valid && result.instance?.id === instanceId : result.activated;
    const verifiedInstance = result.instance?.id;
    if (!response.ok || !verified || !verifiedInstance ||
        String(result.meta?.store_id) !== config.store || String(result.meta?.variant_id) !== config.variant) {
      return NextResponse.json({ error: "This license or browser activation could not be verified." }, { status: 403 });
    }

    const output = NextResponse.json({ valid: true, instanceId: verifiedInstance });
    output.cookies.set(LICENSE_COOKIE, createLicenseSession(config.secret), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: LICENSE_SESSION_SECONDS,
    });
    return output;
  } catch {
    return NextResponse.json({ error: "License verification is temporarily unavailable." }, { status: 503 });
  }
}
