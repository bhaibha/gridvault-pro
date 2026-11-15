// tests/excel-export.test.ts
import * as XLSX from "xlsx";
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
    it("builds a 3-tab workbook with Executive_Summary, Document_Ledger, and Line_Items_Detail", () => {
      const sampleDocs = getSampleStressTestBatch();
      const wb = generateWorkbook(sampleDocs, "GST");

      expect(wb.SheetNames).toContain("Executive_Summary");
      expect(wb.SheetNames).toContain("Document_Ledger");
      expect(wb.SheetNames).toContain("Line_Items_Detail");
    });

    it("reconciles demo line items, subtotal, and GST to the cent", () => {
      const [invoice, , duplicate] = getSampleStressTestBatch();
      for (const item of invoice.lineItems) {
        expect(Math.round(item.quantity * item.unitPrice * 100)).toBe(Math.round(item.lineTotal * 100));
      }
      expect(invoice.lineItems.reduce((cents, item) => cents + Math.round(item.lineTotal * 100), 0))
        .toBe(Math.round(invoice.subtotal * 100));
      expect(Math.round((invoice.subtotal + invoice.cgst + invoice.sgst) * 100))
        .toBe(Math.round(invoice.totalAmount * 100));
      expect(duplicate.totalAmount).toBe(invoice.totalAmount);
    });

    it("groups reconciled invoices and receipts by currency and retains review flags", () => {
      const docs = getSampleStressTestBatch();
      const wb = generateWorkbook(docs, "GST");
      const summary = XLSX.utils.sheet_to_json(wb.Sheets.Executive_Summary, { header: 1 });
      expect(summary).toContainEqual(["INR", 1, 6483.06, 42500.06]);
      expect(summary).toContainEqual(["EUR", 1, 55.16, 345.5]);
      expect(summary).toContainEqual(["Documents Flagged for Review", 2]);
      expect(summary).not.toContainEqual(["USD", 1, 0, 0]);

      const ledger = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets.Document_Ledger);
      expect(ledger.map((row) => row.Audit_Status)).toEqual([
        "VERIFIED", "MATH_CHECK", "DUPLICATE", "VERIFIED", "VERIFIED",
      ]);
      expect(new Set(ledger.map((row) => row.Doc_ID)).size).toBe(docs.length);
    });
  });
});
