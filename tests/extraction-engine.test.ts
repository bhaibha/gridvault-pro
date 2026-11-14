// tests/extraction-engine.test.ts
import { describe, it, expect } from "vitest";
import {
  sanitizeNumber,
  computeDuplicateHash,
} from "../lib/extraction-engine";

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
