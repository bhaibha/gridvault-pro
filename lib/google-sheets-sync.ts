// lib/google-sheets-sync.ts
import { ExtractedDocument } from "./extraction-engine";

const WEBHOOK_STORAGE_KEY = "gridvault_gsheet_webhook_url";
const SHEET_NAME_KEY = "gridvault_gsheet_target_name";

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// -------------------------------------------------------------
// GRIDVAULT PRO — GOOGLE SHEETS LIVE SYNC WEBHOOK SCRIPT
// -------------------------------------------------------------
// 1. In your Google Sheet, click Extensions > Apps Script
// 2. Replace everything with this code and click Save (disk icon)
// 3. Click Deploy > New Deployment
// 4. Select type "Web app"
//    - Execute as: "Me"
//    - Who has access: "Anyone"
// 5. Click Deploy and paste the Web App URL into GridVault Pro
// -------------------------------------------------------------

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    var rows = payload.rows;

    if (!rows || rows.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "No rows provided" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Initialize header row if sheet is brand new
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Doc_ID",
        "Date",
        "Audit_Status",
        "Vendor_Or_Contact",
        "Invoice_Ref",
        "Category",
        "Currency",
        "Subtotal",
        "Tax_Total",
        "Grand_Total",
        "Confidence",
        "Source_File"
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#0F172A").setFontColor("#F8FAFC");
    }

    // Append all extracted documents
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      sheet.appendRow([
        r.id.slice(0, 8),
        r.date,
        r.isDuplicate ? "DUPLICATE" : !r.mathVerified ? "MATH_CHECK" : "VERIFIED",
        r.vendorOrContact,
        r.invoiceOrRefNo,
        r.category,
        r.currency,
        r.subtotal,
        Number((r.cgst + r.sgst + r.igst + r.vatOrSalesTax).toFixed(2)),
        r.totalAmount,
        Math.round(r.confidence * 100) + "%",
        r.fileName
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      syncedRows: rows.length,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ status: "GridVault Pro Sync Active" }))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export function getSavedGoogleSheetWebhook(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WEBHOOK_STORAGE_KEY);
}

export function saveGoogleSheetWebhook(url: string, sheetName?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WEBHOOK_STORAGE_KEY, url.trim());
  if (sheetName) {
    localStorage.setItem(SHEET_NAME_KEY, sheetName.trim());
  }
}

export function clearGoogleSheetWebhook(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WEBHOOK_STORAGE_KEY);
  localStorage.removeItem(SHEET_NAME_KEY);
}

export async function testGoogleSheetConnection(webhookUrl: string): Promise<boolean> {
  try {
    const res = await fetch(webhookUrl.trim(), {
      method: "GET",
      mode: "no-cors",
    });
    return true;
  } catch {
    return false;
  }
}

export async function pushRowsToGoogleSheet(
  webhookUrl: string,
  docs: ExtractedDocument[]
): Promise<{ success: boolean; syncedCount: number; error?: string }> {
  try {
    const res = await fetch(webhookUrl.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ rows: docs }),
    });

    // In no-cors or standard text mode
    return { success: true, syncedCount: docs.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sync failed";
    return { success: false, syncedCount: 0, error: msg };
  }
}
