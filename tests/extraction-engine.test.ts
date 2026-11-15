// tests/extraction-engine.test.ts
import { describe, it, expect, vi } from "vitest";
import {
  sanitizeNumber,
  computeDuplicateHash,
  extractDocumentWithAI,
} from "../lib/extraction-engine";
import { reviewStatus, summarizeSpend } from "../lib/ledger-review";

describe("Extraction Engine Utility Tests", () => {
  describe("sanitizeNumber", () => {
    it("handles regular floats and integers", () => {
      expect(sanitizeNumber(125.5)).toBe(125.5);
      expect(sanitizeNumber(500)).toBe(500);
      expect(sanitizeNumber(0)).toBe(0);
    });

    it("strips dollar, euro, pound, and rupee symbols", () => {
      expect(sanitizeNumber("$1,250.75")).toBe(1250.75);
      expect(sanitizeNumber("€450.00")).toBe(450.0);
      expect(sanitizeNumber("£89.99")).toBe(89.99);
      expect(sanitizeNumber("₹1,25,000.00")).toBe(125000.0);
    });

    it("correctly handles European comma decimals (1.450,50)", () => {
      expect(sanitizeNumber("1.450,50")).toBe(1450.5);
      expect(sanitizeNumber("250,75")).toBe(250.75);
      expect(sanitizeNumber("14.999,00 €")).toBe(14999.0);
    });

    it("handles invalid or empty inputs gracefully", () => {
      expect(sanitizeNumber(null)).toBe(0);
      expect(sanitizeNumber(undefined)).toBe(0);
      expect(sanitizeNumber("N/A")).toBe(0);
      expect(sanitizeNumber("")).toBe(0);
    });
  });

  describe("computeDuplicateHash", () => {
    it("generates idempotent hashes for identical bills", () => {
      const hashA = computeDuplicateHash("2026-11-05", "UltraTech Cement Ltd", "INV-8841", 100300.0);
      const hashB = computeDuplicateHash("2026-11-05", "ultratech cement ltd", "inv-8841", 100300.0);
      expect(hashA).toBe(hashB);
    });

    it("generates distinct hashes when invoice number or total differs", () => {
      const hash1 = computeDuplicateHash("2026-11-05", "Vendor A", "INV-101", 500);
      const hash2 = computeDuplicateHash("2026-11-05", "Vendor A", "INV-102", 500);
      const hash3 = computeDuplicateHash("2026-11-05", "Vendor A", "INV-101", 501);
      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
    });
  });
});

describe("purchase document reconciliation", () => {
  it("uses the signed round-off and excludes quotations and delivery notes from spend", async () => {
    const printed = {
      vendorOrContact: "Sample supplier", currency: "INR", confidence: 0.99,
      subtotal: 9090.2, cgst: 818.12, sgst: 818.12, totalAmount: 10726,
    };
    const fetchProvider = vi.fn().mockImplementation(async () => Response.json({
      candidates: [{ content: { parts: [{ text: JSON.stringify(providerFields) }] } }],
    }));
    let providerFields: Record<string, unknown> = { ...printed, docType: "INVOICE", roundOff: -0.44 };
    vi.stubGlobal("fetch", fetchProvider);
    const extract = () => extractDocumentWithAI("data", "application/pdf", "sample.pdf", "test", "gemini", "INVOICE");
    try {
      const invoice = await extract();
      expect(invoice).toMatchObject({ docType: "INVOICE", roundOff: -0.44, mathVerified: true });

      providerFields = { ...printed, docType: "INVOICE" };
      expect(await extract()).toMatchObject({ roundOff: 0, mathVerified: false });

      providerFields = { ...printed, docType: "QUOTATION", roundOff: -0.44 };
      const quotation = await extract();
      expect(quotation).toMatchObject({ docType: "QUOTATION", mathVerified: true });
      expect(reviewStatus(quotation)).toBe("QUOTATION");

      providerFields = { ...printed, docType: "DELIVERY_NOTE", roundOff: -0.44 };
      const delivery = await extract();
      expect(reviewStatus(delivery)).toBe("DELIVERY_NOTE");

      providerFields = { ...printed, roundOff: -0.44 };
      const unknown = await extract();
      expect(reviewStatus(unknown)).toBe("TYPE_CHECK");

      expect(summarizeSpend([invoice, quotation, delivery, unknown])).toEqual([
        ["INR", { count: 1, spend: 10726, tax: 1636.24 }],
      ]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
