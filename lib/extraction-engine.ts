// lib/extraction-engine.ts

export interface ExtractedLineItem {
  description: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type DocType = "RECEIPT" | "INVOICE" | "BANK_STATEMENT" | "BUSINESS_CARD" | "CUSTOM";

export interface ExtractedDocument {
  id: string;
  fileName: string;
  docType: DocType;
  date: string; // YYYY-MM-DD
  vendorOrContact: string;
  invoiceOrRefNo: string;
  taxId: string;
  category: string;
  currency: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  vatOrSalesTax: number;
  totalAmount: number;
  confidence: number;
  mathVerified: boolean;
  isDuplicate: boolean;
  duplicateHash: string;
  notesOrEmail: string;
  lineItems: ExtractedLineItem[];
  thumbnailUrl?: string;
  rawJson?: string;
}

/**
 * Normalizes number formats across global regions:
 * Handles European comma-decimal (1.250,50), Indian lakh/crore formatting (1,25,000.00),
 * and currency symbols.
 */
export function sanitizeNumber(val: unknown): number {
  if (typeof val === "number" && !Number.isNaN(val)) {
    return Number(val.toFixed(2));
  }
  if (typeof val !== "string") {
    return 0;
  }

  let cleaned = val.trim();
  if (!cleaned) return 0;

  // Remove currency symbols, letters, spaces
  cleaned = cleaned.replace(/[^0-9.,-]/g, "");

  // Detect comma as decimal separator: e.g. "1.250,50" or "1250,50" vs "1,250.50"
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  if (lastComma > lastDot) {
    // Comma is likely the decimal separator
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    // Standard format or Indian numbering: remove commas as thousands separators
    cleaned = cleaned.replace(/,/g, "");
  }

  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : Number(parsed.toFixed(2));
}

/**
 * Generates an idempotent fingerprint to detect duplicate supplier bills or receipts
 */
export function computeDuplicateHash(
  date: string,
  vendor: string,
  refNo: string,
  total: number
): string {
  const normalizedVendor = (vendor || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 16);
  const normalizedRef = (refNo || "none")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
  const normalizedTotal = total.toFixed(2);
  const normalizedDate = date.trim();

  return `${normalizedDate}_${normalizedVendor}_${normalizedRef}_${normalizedTotal}`;
}

export function buildSystemPrompt(docType: DocType, customInstructions?: string): string {
  return `You are a high-precision corporate financial auditor and document extraction engine.
Extract structured tabular data from the attached document (${docType}).

Rules:
1. Date: Strictly normalize all dates to ISO format "YYYY-MM-DD". If ambiguous, infer the most plausible past/current date.
2. Monetary values: Output all prices, subtotals, taxes, and totals as pure numbers (e.g. 142.50). Never include currency symbols ($/€/£/₹) in the numeric fields.
3. Currency: Detect ISO currency code (USD, EUR, GBP, INR, AED, CAD, AUD, etc.).
4. Tax Splitting:
   - If Indian GST invoice: extract cgst, sgst, igst.
   - If US, UK, EU, or general invoice: extract vatOrSalesTax.
   - Ensure the tax breakdown matches the receipt.
5. Line Items: Extract each line item with description, SKU/code if visible, quantity, unit price, and line total.
6. Confidence Score: Output a floating-point score between 0.10 and 1.00 reflecting visual legibility and completeness.
7. Business Cards / Leads: For business cards, populate vendorOrContact with full name & company, and notesOrEmail with email, phone, and title.
${customInstructions ? `Additional User Instructions: ${customInstructions}` : ""}

Return ONLY a valid JSON object matching this schema:
{
  "date": "YYYY-MM-DD",
  "vendorOrContact": "string",
  "invoiceOrRefNo": "string",
  "taxId": "string (GSTIN, VAT ID, EIN, or empty)",
  "category": "Materials | Software | Travel | Office Supplies | Utilities | Professional Services | Dining | Lead | General",
  "currency": "USD",
  "subtotal": 0.00,
  "cgst": 0.00,
  "sgst": 0.00,
  "igst": 0.00,
  "vatOrSalesTax": 0.00,
  "totalAmount": 0.00,
  "confidence": 0.95,
  "notesOrEmail": "string",
  "lineItems": [
    {
      "description": "string",
      "sku": "string",
      "quantity": 1,
      "unitPrice": 0.00,
      "lineTotal": 0.00
    }
  ]
}`;
}

export async function extractDocumentWithAI(
  fileBase64: string,
  mimeType: string,
  fileName: string,
  apiKey: string,
  provider: "openai" | "gemini",
  docType: DocType = "INVOICE",
  customInstructions?: string
): Promise<ExtractedDocument> {
  const systemPrompt = buildSystemPrompt(docType, customInstructions);
  let rawJsonText = "{}";

  // Normalize mime type
  let effectiveMime = mimeType || "image/jpeg";
  if (fileName.toLowerCase().endsWith(".pdf")) {
    effectiveMime = "application/pdf";
  } else if (fileName.toLowerCase().endsWith(".png")) {
    effectiveMime = "image/png";
  } else if (fileName.toLowerCase().endsWith(".webp")) {
    effectiveMime = "image/webp";
  }

  if (provider === "openai") {
    // OpenAI Vision (Note: OpenAI expects images; PDFs must be rendered to image or sent via file API)
    // If user passed PDF to OpenAI, format as image data URL if converted, or fail gracefully
    const imageUrl = `data:${effectiveMime};base64,${fileBase64}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: `Extract all financial details from document: ${fileName}` },
              { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`OpenAI API Error (${res.status}): ${errBody.slice(0, 150)}`);
    }

    const data = await res.json();
    rawJsonText = data.choices?.[0]?.message?.content || "{}";
  } else {
    // Google Gemini (supports gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash)
    // Gemini natively supports application/pdf inline_data!
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let succeeded = false;
    let lastError = "";

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  { inline_data: { mime_type: effectiveMime, data: fileBase64 } },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          succeeded = true;
          break;
        } else {
          lastError = await res.text();
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!succeeded) {
      throw new Error(`Gemini API Error: ${lastError.slice(0, 150)}`);
    }
  }

  // Parse and sanitize extraction output
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(rawJsonText);
  } catch {
    // Fallback: extract JSON from markdown block if LLM returned markdown codefence
    const match = rawJsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      parsed = JSON.parse(match[1]);
    }
  }

  const subtotal = sanitizeNumber(parsed.subtotal);
  const cgst = sanitizeNumber(parsed.cgst);
  const sgst = sanitizeNumber(parsed.sgst);
  const igst = sanitizeNumber(parsed.igst);
  const vatOrSalesTax = sanitizeNumber(parsed.vatOrSalesTax);
  const totalAmount = sanitizeNumber(parsed.totalAmount);

  // Compute and check math reconciliation
  const totalTax = Number((cgst + sgst + igst + vatOrSalesTax).toFixed(2));
  const expectedTotal = Number((subtotal + totalTax).toFixed(2));

  // Math verified condition
  const mathDiff = Math.abs(expectedTotal - totalAmount);
  const isBusinessCard = docType === "BUSINESS_CARD";
  const mathVerified = isBusinessCard || subtotal === 0 || mathDiff <= 0.12;

  // Auto-downgrade confidence if math is inconsistent
  const rawConfidence = sanitizeNumber(parsed.confidence) || 0.88;
  const confidence = mathVerified ? rawConfidence : Math.min(rawConfidence, 0.55);

  const date =
    typeof parsed.date === "string" && parsed.date.length >= 8
      ? parsed.date.slice(0, 10)
      : new Date().toISOString().slice(0, 10);

  const vendorOrContact = String(parsed.vendorOrContact || "Unknown Entity").trim();
  const invoiceOrRefNo = String(parsed.invoiceOrRefNo || "N/A").trim();

  // Parse line items safely
  const lineItems: ExtractedLineItem[] = Array.isArray(parsed.lineItems)
    ? parsed.lineItems.map((item: Record<string, unknown>) => {
        const qty = sanitizeNumber(item.quantity) || 1;
        const unit = sanitizeNumber(item.unitPrice);
        const lineTot = sanitizeNumber(item.lineTotal) || Number((qty * unit).toFixed(2));
        return {
          description: String(item.description || "Item").trim(),
          sku: String(item.sku || "").trim(),
          quantity: qty,
          unitPrice: unit,
          lineTotal: lineTot,
        };
      })
    : [];

  const duplicateHash = computeDuplicateHash(date, vendorOrContact, invoiceOrRefNo, totalAmount);

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fileName,
    docType,
    date,
    vendorOrContact,
    invoiceOrRefNo,
    taxId: String(parsed.taxId || "").trim(),
    category: String(parsed.category || "General").trim(),
    currency: String(parsed.currency || "USD").toUpperCase().slice(0, 3),
    subtotal: subtotal || (totalAmount > 0 && totalTax > 0 ? Number((totalAmount - totalTax).toFixed(2)) : totalAmount),
    cgst,
    sgst,
    igst,
    vatOrSalesTax,
    totalAmount,
    confidence,
    mathVerified,
    isDuplicate: false,
    duplicateHash,
    notesOrEmail: String(parsed.notesOrEmail || "").trim(),
    lineItems,
    rawJson: rawJsonText,
  };
}
