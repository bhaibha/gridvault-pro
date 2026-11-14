// lib/excel-export.ts
import * as XLSX from "xlsx";
import { ExtractedDocument } from "./extraction-engine";

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

  // Exclude duplicates from financial calculations
  const nonDuplicates = docs.filter((d) => !d.isDuplicate);
  const totalSpend = nonDuplicates.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalSubtotal = nonDuplicates.reduce((sum, d) => sum + d.subtotal, 0);
  const totalCgst = nonDuplicates.reduce((sum, d) => sum + d.cgst, 0);
  const totalSgst = nonDuplicates.reduce((sum, d) => sum + d.sgst, 0);
  const totalIgst = nonDuplicates.reduce((sum, d) => sum + d.igst, 0);
  const totalVat = nonDuplicates.reduce((sum, d) => sum + d.vatOrSalesTax, 0);
  const grandTotalTax = totalCgst + totalSgst + totalIgst + totalVat;

  const duplicateCount = docs.filter((d) => d.isDuplicate).length;
  const reviewCount = docs.filter(
    (d) => !d.mathVerified || d.confidence < 0.9 || d.isDuplicate
  ).length;

  // -------------------------------------------------------------
  // TAB 1: EXECUTIVE FINANCIAL & TAX SUMMARY
  // -------------------------------------------------------------
  const summaryAoa: (string | number)[][] = [
    ["GRIDVAULT PRO - EXECUTIVE FINANCIAL & AUDIT SUMMARY"],
    ["Report Generated", new Date().toISOString().slice(0, 10)],
    ["Reporting Tax Mode", taxMode],
    [],
    ["METRIC", "VALUE", "AUDIT CLASSIFICATION"],
    ["Total Documents Processed", docs.length, "Total scanned files in this batch"],
    ["Verified Documents", docs.length - reviewCount, "Reconciled with 90%+ confidence"],
    ["Documents Flagged for Review", reviewCount, "Low confidence, math check, or duplicate"],
    ["Duplicate Documents Excluded", duplicateCount, "Excluded from net spend calculations"],
    ["Net Taxable Subtotal", Number(totalSubtotal.toFixed(2)), "Pre-tax base expenditure"],
  ];

  if (taxMode === "GST") {
    summaryAoa.push(
      ["Total CGST (Central Tax)", Number(totalCgst.toFixed(2)), "Claimable central input credit"],
      ["Total SGST (State Tax)", Number(totalSgst.toFixed(2)), "Claimable state input credit"],
      ["Total IGST (Integrated Tax)", Number(totalIgst.toFixed(2)), "Claimable inter-state input credit"]
    );
  } else if (taxMode === "VAT") {
    summaryAoa.push(
      ["Total VAT / Sales Tax", Number(totalVat.toFixed(2)), "Claimable VAT or sales tax expense"]
    );
  }

  summaryAoa.push(
    ["Total Input Tax Reclaimable", Number(grandTotalTax.toFixed(2)), "Cumulative tax credit total"],
    ["Grand Total Verified Spend", Number(totalSpend.toFixed(2)), "Net total payable (pre-tax + tax)"],
    [],
    ["AUDIT RECONCILIATION HEALTH (GRAPH)", "DOCUMENT COUNT", "VISUAL PROGRESS BAR"],
    [
      "Verified Clean Documents",
      docs.length - reviewCount,
      docs.length > 0
        ? `[${"█".repeat(Math.round(((docs.length - reviewCount) / docs.length) * 20))}${"░".repeat(
            20 - Math.round(((docs.length - reviewCount) / docs.length) * 20)
          )}] ${Math.round(((docs.length - reviewCount) / docs.length) * 100)}%`
        : "[░░░░░░░░░░░░░░░░░░░░] 0%",
    ],
    [
      "Flagged Audit Exceptions",
      reviewCount,
      docs.length > 0
        ? `[${"█".repeat(Math.round((reviewCount / docs.length) * 20))}${"░".repeat(
            20 - Math.round((reviewCount / docs.length) * 20)
          )}] ${Math.round((reviewCount / docs.length) * 100)}%`
        : "[░░░░░░░░░░░░░░░░░░░░] 0%",
    ]
  );

  // Category Spend Aggregation & Graph
  const categoryMap = new Map<string, number>();
  nonDuplicates.forEach((d) => {
    const cat = d.category || "General";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + d.totalAmount);
  });

  if (categoryMap.size > 0 && totalSpend > 0) {
    summaryAoa.push(
      [],
      ["CATEGORY SPEND ALLOCATION (GRAPH)", "EXPENDITURE", "IN-CELL VISUAL BAR CHART"]
    );
    categoryMap.forEach((amt, cat) => {
      const ratio = Math.min(1, Math.max(0, amt / totalSpend));
      const filled = Math.round(ratio * 20);
      const empty = 20 - filled;
      const bar = `[${"█".repeat(filled)}${"░".repeat(empty)}] ${(ratio * 100).toFixed(1)}%`;
      summaryAoa.push([cat, Number(amt.toFixed(2)), bar]);
    });
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);
  wsSummary["!cols"] = [{ wch: 36 }, { wch: 18 }, { wch: 38 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Executive_Summary");

  // -------------------------------------------------------------
  // TAB 2: MASTER VERIFIED LEDGER
  // -------------------------------------------------------------
  const ledgerRows = docs.map((d) => {
    let auditStatus = "VERIFIED";
    if (d.isDuplicate) auditStatus = "DUPLICATE";
    else if (!d.mathVerified) auditStatus = "MATH_CHECK";
    else if (d.confidence < 0.9) auditStatus = "LOW_CONFIDENCE";

    const baseRecord: Record<string, string | number> = {
      Doc_ID: d.id.slice(0, 8),
      Audit_Status: auditStatus,
      Date: d.date,
      Type: d.docType,
      Vendor_Or_Contact: safeExcelString(d.vendorOrContact),
      Invoice_Ref_No: safeExcelString(d.invoiceOrRefNo),
      Tax_ID: safeExcelString(d.taxId),
      Category: safeExcelString(d.category),
      Currency: d.currency,
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
  XLSX.utils.book_append_sheet(wb, wsLedger, "Verified_Ledger");

  // -------------------------------------------------------------
  // TAB 3: LINE-ITEMS DETAIL (Job-Costing / SKU Audit)
  // -------------------------------------------------------------
  const lineRows: Record<string, string | number>[] = [];
  docs.forEach((d) => {
    if (d.lineItems && d.lineItems.length > 0) {
      d.lineItems.forEach((item, idx) => {
        lineRows.push({
          Doc_ID: d.id.slice(0, 8),
          Item_Index: idx + 1,
          Date: d.date,
          Vendor: safeExcelString(d.vendorOrContact),
          Invoice_Ref: safeExcelString(d.invoiceOrRefNo),
          Category: safeExcelString(d.category),
          Item_Description: safeExcelString(item.description),
          SKU_Code: safeExcelString(item.sku),
          Quantity: item.quantity,
          Unit_Price: item.unitPrice,
          Line_Total: item.lineTotal,
          Currency: d.currency,
        });
      });
    }
  });

  const wsLines = XLSX.utils.json_to_sheet(
    lineRows.length > 0
      ? lineRows
      : [
          {
            Note: "No individual line items parsed in this batch. Header totals are recorded in Verified_Ledger.",
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
  const ledgerSheet = wb.Sheets["Verified_Ledger"];
  const csvContent = XLSX.utils.sheet_to_csv(ledgerSheet);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileNamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
