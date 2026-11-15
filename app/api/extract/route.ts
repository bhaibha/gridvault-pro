import { NextRequest, NextResponse } from "next/server";
import { extractDocumentWithAI } from "@/lib/extraction-engine";
import { hasLicenseSession, LICENSE_COOKIE } from "@/lib/license-session";
import { DOCUMENT_TYPES, FILE_LIMIT_BYTES } from "@/lib/workspace-limits";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (!hasLicenseSession(req.cookies.get(LICENSE_COOKIE)?.value)) {
    return NextResponse.json({ error: "Activate your Pro license to upload documents." }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_PAID_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Document extraction is not configured." }, { status: 503 });
  }

  const fields = await req.formData().catch(() => null);
  const file = fields?.get("document");
  const docType = fields?.get("docType");
  if (!file || typeof file === "string" || !file.size || file.size > FILE_LIMIT_BYTES ||
      !DOCUMENT_TYPES.includes(file.type) || (docType !== "INVOICE" && docType !== "RECEIPT")) {
    return NextResponse.json({ error: "Upload an invoice or receipt in PDF, JPG, PNG, or WEBP format, up to 3 MB." }, { status: 400 });
  }

  try {
    const doc = await extractDocumentWithAI(
      Buffer.from(await file.arrayBuffer()).toString("base64"),
      file.type,
      file.name,
      apiKey,
      "gemini",
      docType
    );
    // The ledger needs the normalized fields only.
    delete doc.rawJson;
    return NextResponse.json({ doc });
  } catch {
    return NextResponse.json({ error: "Extraction failed. Check the document and try again." }, { status: 502 });
  }
}
