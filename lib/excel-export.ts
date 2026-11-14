// lib/excel-export.ts
import * as XLSX from "xlsx";
import { ExtractedDocument } from "./extraction-engine";
import { reviewStatus, summarizeSpend } from "./ledger-review";

/**
 * Prevents CSV/Excel Formula Injection attacks.
 * If a cell string starts with =, +, -, @, or tab/return, prepends a single quote.
 */
export function safeExcelString(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export type TaxReportingMode = "GST" | "VAT" | "SIMPLE";

export function generateWorkbook(
  docs: ExtractedDocument[],
  taxMode: TaxReportingMode = "GST"
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const reviewCount = docs.filter((doc) => reviewStatus(doc) !== "VERIFIED").length;
  const summaryAoa: (string | number)[][] = [
    ["GRIDVAULT PRO - DOCUMENT REVIEW SUMMARY"],
    ["Report Generated", new Date().toISOString().slice(0, 10)],
    ["Reporting Tax Mode", taxMode],
    ["Total Documents", docs.length],
    ["Documents Without Review Flags", docs.length - reviewCount],
    ["Documents Flagged for Review", reviewCount],
    [],
    ["Reconciled invoices and receipts only"],
    ["Currency", "Document Count", "Extracted Tax", "Reconciled Spend"],
    ...summarizeSpend(docs).map(([currency, total]) => [
      currency, total.count, Number(total.tax.toFixed(2)), Number(total.spend.toFixed(2)),
    ]),
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);
  wsSummary["!cols"] = [{ wch: 36 }, { wch: 18 }, { wch: 18 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Executive_Summary");

  // -------------------------------------------------------------
  // TAB 2: DOCUMENT LEDGER
  // -------------------------------------------------------------
  const ledgerRows = docs.map((d) => {
    const baseRecord: Record<string, string | number> = {
      Doc_ID: safeExcelString(d.id),
      Audit_Status: reviewStatus(d),
      Date: safeExcelString(d.date),
      Type: d.docType,
      Vendor_Or_Contact: safeExcelString(d.vendorOrContact),
      Invoice_Ref_No: safeExcelString(d.invoiceOrRefNo),
      Tax_ID: safeExcelString(d.taxId),
      Category: safeExcelString(d.category),
      Currency: safeExcelString(d.currency),
      Subtotal: d.subtotal,
    };

    if (taxMode === "GST") {
      baseRecord.CGST = d.cgst;
      baseRecord.SGST = d.sgst;
      baseRecord.IGST = d.igst;
    } else if (taxMode === "VAT") {
      baseRecord.VAT_Sales_Tax = d.vatOrSalesTax;
    } else {
      baseRecord.Total_Tax = Number((d.cgst + d.sgst + d.igst + d.vatOrSalesTax).toFixed(2));
    }

    if (taxMode !== "SIMPLE") {
      baseRecord.Total_Tax = Number((d.cgst + d.sgst + d.igst + d.vatOrSalesTax).toFixed(2));
    }
    baseRecord.Grand_Total = d.totalAmount;
    baseRecord.Confidence = `${Math.round(d.confidence * 100)}%`;
    baseRecord.Notes_Details = safeExcelString(d.notesOrEmail);
    baseRecord.Source_Filename = safeExcelString(d.fileName);

    return baseRecord;
  });

  const wsLedger = XLSX.utils.json_to_sheet(ledgerRows);
  wsLedger["!cols"] = [
    { wch: 10 },
    { wch: 15 },
    { wch: 12 },
    { wch: 14 },
    { wch: 28 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 8 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
    { wch: 12 },
    { wch: 24 },
    { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, wsLedger, "Document_Ledger");

  // -------------------------------------------------------------
  // TAB 3: LINE-ITEMS DETAIL (Job-Costing / SKU Audit)
  // -------------------------------------------------------------
  const lineRows: Record<string, string | number>[] = [];
  docs.forEach((d) => {
    if (d.lineItems && d.lineItems.length > 0) {
      d.lineItems.forEach((item, idx) => {
        lineRows.push({
          Doc_ID: safeExcelString(d.id),
          Review_Status: reviewStatus(d),
          Item_Index: idx + 1,
          Date: safeExcelString(d.date),
          Vendor: safeExcelString(d.vendorOrContact),
          Invoice_Ref: safeExcelString(d.invoiceOrRefNo),
          Category: safeExcelString(d.category),
          Item_Description: safeExcelString(item.description),
          SKU_Code: safeExcelString(item.sku),
          Quantity: item.quantity,
          Unit_Price: item.unitPrice,
          Line_Total: item.lineTotal,
          Currency: safeExcelString(d.currency),
        });
      });
    }
  });

  const wsLines = XLSX.utils.json_to_sheet(
    lineRows.length > 0
      ? lineRows
      : [
          {
            Note: "No individual line items parsed in this batch. Header totals are recorded in Document_Ledger.",
          },
        ]
  );
  wsLines["!cols"] = [
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
    { wch: 32 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 8 },
  ];
  XLSX.utils.book_append_sheet(wb, wsLines, "Line_Items_Detail");

  return wb;
}

export function exportMasterWorkbook(
  docs: ExtractedDocument[],
  taxMode: TaxReportingMode = "GST",
  fileNamePrefix: string = "GridVault_Financial_Audit"
): void {
  const wb = generateWorkbook(docs, taxMode);
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileNamePrefix}_${dateStr}.xlsx`);
}

export function exportAsCsv(
  docs: ExtractedDocument[],
  taxMode: TaxReportingMode = "GST",
  fileNamePrefix: string = "GridVault_Ledger"
): void {
  const wb = generateWorkbook(docs, taxMode);
  const ledgerSheet = wb.Sheets["Document_Ledger"];
  const csvContent = XLSX.utils.sheet_to_csv(ledgerSheet);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileNamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
