// app/api/extract/route.ts
import { NextResponse } from "next/server";
import { extractDocumentWithAI, DocType } from "@/lib/extraction-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fileBase64,
      mimeType,
      fileName,
      apiKey,
      provider,
      docType,
      customInstructions,
    } = body;

    if (!fileBase64 || !apiKey || !provider) {
      return NextResponse.json(
        { error: "Missing required fields: fileBase64, apiKey, provider." },
        { status: 400 }
      );
    }

    const doc = await extractDocumentWithAI(
      fileBase64,
      mimeType || "image/jpeg",
      fileName || "uploaded_file.jpg",
      apiKey,
      provider,
      (docType as DocType) || "INVOICE",
      customInstructions
    );

    return NextResponse.json({ success: true, doc });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
