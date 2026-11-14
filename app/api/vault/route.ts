import { NextRequest, NextResponse } from "next/server";
import { createFullCustomerVaultZip } from "@/lib/bundle-packager";
import { hasLicenseSession, LICENSE_COOKIE } from "@/lib/license-session";

export async function GET(req: NextRequest) {
  if (!hasLicenseSession(req.cookies.get(LICENSE_COOKIE)?.value)) {
    return NextResponse.json({ error: "Activate your Pro license to download the vault." }, { status: 401 });
  }

  return new Response(await createFullCustomerVaultZip(), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="GridVault_Pro_Fulfillment_Vault.zip"',
      "Cache-Control": "private, no-store",
    },
  });
}
