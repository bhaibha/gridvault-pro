import type { ExtractedDocument } from "./extraction-engine";

export function reviewStatus(doc: ExtractedDocument) {
  if (doc.isDuplicate) return "DUPLICATE";
  if (doc.docType === "QUOTATION" || doc.docType === "DELIVERY_NOTE") return doc.docType;
  if (doc.docType === "UNKNOWN") return "TYPE_CHECK";
  if (!doc.mathVerified) return "MATH_CHECK";
  if (!Number.isFinite(doc.confidence) || doc.confidence < 0.9) return "LOW_CONFIDENCE";
  if (doc.docType !== "BUSINESS_CARD" && !/^[A-Z]{3}$/.test(doc.currency)) return "CURRENCY_CHECK";
  return "VERIFIED";
}

export function summarizeSpend(documents: ExtractedDocument[]) {
  const totals = new Map<string, { count: number; spend: number; tax: number }>();
  for (const doc of documents) {
    if (reviewStatus(doc) !== "VERIFIED" || !["INVOICE", "RECEIPT"].includes(doc.docType)) continue;
    const total = totals.get(doc.currency) ?? { count: 0, spend: 0, tax: 0 };
    total.count += 1;
    total.spend += doc.totalAmount;
    total.tax += doc.cgst + doc.sgst + doc.igst + doc.vatOrSalesTax;
    totals.set(doc.currency, total);
  }
  return Array.from(totals).sort(([a], [b]) => a.localeCompare(b));
}
