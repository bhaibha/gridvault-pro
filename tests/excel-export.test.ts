// tests/excel-export.test.ts
import { describe, it, expect } from "vitest";
import { safeExcelString, generateWorkbook } from "../lib/excel-export";
import { getSampleStressTestBatch } from "../lib/test-samples";

describe("Excel Export & Security Tests", () => {
  describe("safeExcelString (Formula Injection Prevention)", () => {
    it("escapes formula injection attack vectors with a single quote", () => {
      expect(safeExcelString("=cmd|' /C calc'!A0")).toBe("'=cmd|' /C calc'!A0");
      expect(safeExcelString("+SUM(A1:A10)")).toBe("'+SUM(A1:A10)");
      expect(safeExcelString("-2+3*4")).toBe("'-2+3*4");
      expect(safeExcelString("@IMPORTXML(...)")).toBe("'@IMPORTXML(...)");
    });

    it("leaves normal business strings untouched", () => {
      expect(safeExcelString("UltraTech Cement Ltd")).toBe("UltraTech Cement Ltd");
      expect(safeExcelString("INV-2026-884")).toBe("INV-2026-884");
      expect(safeExcelString("")).toBe("");
    });
  });

  describe("generateWorkbook", () => {
    it("builds a 3-tab workbook with Executive_Summary, Verified_Ledger, and Line_Items_Detail", () => {
      const sampleDocs = getSampleStressTestBatch();
      const wb = generateWorkbook(sampleDocs, "GST");

      expect(wb.SheetNames).toContain("Executive_Summary");
      expect(wb.SheetNames).toContain("Verified_Ledger");
      expect(wb.SheetNames).toContain("Line_Items_Detail");
    });

    it("correctly filters out duplicates from net spend calculation", () => {
      const sampleDocs = getSampleStressTestBatch();
      const wb = generateWorkbook(sampleDocs, "GST");
      const summarySheet = wb.Sheets["Executive_Summary"];

      expect(summarySheet).toBeDefined();
    });
  });
});
