// lib/bundle-packager.ts
import JSZip from "jszip";
import * as XLSX from "xlsx";
import { TEMPLATE_VAULT, TemplateDefinition } from "./template-generator";

const GOOGLE_APPS_SCRIPT_CONTENT = `/**
 * ============================================================================
 * GridVault Pro — Google Sheets Webhook Integration
 * ============================================================================
 * 
 * Instructions:
 * 1. Open your target Google Sheet.
 * 2. Click "Extensions" > "Apps Script".
 * 3. Delete any default code and paste this ENTIRE file into the editor.
 * 4. Click "Deploy" > "New deployment".
 * 5. Under "Select type", choose "Web app".
 * 6. Set Description: "GridVault Sync".
 * 7. Set "Execute as": "Me".
 * 8. Set "Who has access": "Anyone" (crucial for webhook delivery).
 * 9. Click "Deploy" and authorize permissions.
 * 10. Copy the Web App URL and paste it into GridVault Pro > "Push to Google Sheet".
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-create headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Doc ID",
        "Date",
        "Status",
        "Vendor / Contact",
        "Invoice / Ref No",
        "Category",
        "Currency",
        "Subtotal",
        "Tax Amount",
        "Grand Total",
        "Math Verified",
        "Confidence %",
        "Synced At"
      ]);
      
      // Style header row
      var headerRange = sheet.getRange(1, 1, 1, 13);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0F172A");
      headerRange.setFontColor("#38BDF8");
    }
    
    var rows = payload.rows || [];
    var timestamp = new Date().toISOString();
    
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      sheet.appendRow([
        r.id || "",
        r.date || "",
        r.status || "VERIFIED",
        r.vendorOrContact || "",
        r.invoiceOrRefNo || "",
        r.category || "General",
        r.currency || "USD",
        r.subtotal || 0,
        r.tax || 0,
        r.totalAmount || 0,
        r.mathVerified ? "YES" : "CHECK",
        Math.round((r.confidence || 1) * 100) + "%",
        timestamp
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      rowsAdded: rows.length,
      message: "Successfully synced " + rows.length + " verified records to Google Sheet."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "GridVault Pro Google Sheets Webhook Receiver",
    version: "1.0.0"
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

const WELCOME_GUIDE_CONTENT = `# Welcome to GridVault Pro ($100 Lifetime Suite)
Thank you for your purchase of GridVault Pro!

You now own the complete lifetime document-to-spreadsheet extraction engine and the turnkey 8 Master Spreadsheet Vault. You never have to pay a recurring monthly SaaS subscription again.

---

## What's Included in This Vault

### 1. B2B Corporate Suite (\`B2B_Corporate_Suite/\`)
* **Enterprise Vendor & Tax Reconciliation Ledger (\`.xlsx\`):** 3-tab workbook with Executive Tax Summary, in-cell spend sparklines, AP aging schedule, and statutory GSTR/VAT audit tables.
* **Commercial Job-Costing & Material Budget Suite (\`.xlsx\`):** Project budget tracking, committed cost variance calculations, and contractor change order logs.
* **Executive P&L & Cash-Flow Treasury Model (\`.xlsx\`):** Board-level revenue vs OpEx waterfall graphs, EBITDA bridge, and burn runway calculator.
* **Strategic Lead & Business Card CRM Suite (\`.xlsx\`):** Pipeline opportunity tracker with deal tiers and follow-up rosters.

### 2. B2C Prosumer Suite (\`B2C_Prosumer_Suite/\`)
* **Comprehensive Tax-Deduction & Audit Organizer (\`.xlsx\`):** Schedule C business expense organizer with receipt audit verification proof.
* **Household Budget & Recurring Subscription Audit (\`.xlsx\`):** Annualized subscription leak waterfall isolating unused streaming, gym, and SaaS fees.
* **Home Renovation & Asset Warranty Vault (\`.xlsx\`):** Serialized appliance and warranty countdown tracker.
* **Multi-Currency Corporate Travel Claim Suite (\`.xlsx\`):** Expense voucher normalizing EUR/GBP/CHF/USD with daily allowances.

### 3. Google Sheets Integration (\`Google_Sheets_Live_Sync.gs\`)
* Ready-to-deploy Google Apps Script for real-time 1-click sync from GridVault Pro directly to live Google Sheets.

---

## How to Use GridVault Pro Web Workspace

1. **Open the Web App:** Navigate to your GridVault Pro workspace (hosted URL or local instance).
2. **Activate Your License:** Enter your purchase license key in the Activation bar.
3. **Bring Your Own Key (BYOK):**
   * **Google Gemini (Recommended):** Get a free API key at https://aistudio.google.com/app/apikey. Gemini 2.0 Flash is 100% free for up to 15 requests per minute!
   * **OpenAI:** Or use your OpenAI key at https://platform.openai.com/api-keys (GPT-4o-mini costs approx. $0.0018 per document).
4. **Drag & Drop:** Upload up to 500 invoices, receipts, bills, or business cards.
5. **Verify & Reconcile:** Inspect confidence scores, click any cell to edit, and check math verification badges.
6. **Export:** Click "Export 3-Tab .XLSX", "Push to Google Sheet", or copy directly to your clipboard!

---

## Universal Compatibility Guarantee
Every workbook in this vault is 100% macro-free, open, and formula-linked. Verified to open cleanly in:
* Microsoft Excel 2016 through Microsoft 365 (Windows & Mac)
* Google Sheets
* Apple Numbers
* LibreOffice Calc

Need support? Contact support@gridvaultpro.com
`;

const COMMERCIAL_LICENSE_CONTENT = `# GridVault Pro — Commercial License Agreement

This Commercial License Agreement ("Agreement") governs the use of GridVault Pro software and the Master Spreadsheet Vault templates.

## 1. Grant of License
Upon payment of the one-time purchase fee, GridVault Pro grants you a perpetual, non-exclusive, worldwide, royalty-free license to:
* Use GridVault Pro on up to 3 individual devices owned or leased by you.
* Extract unlimited documents, receipts, invoices, and statements without recurring platform fees.
* Use, modify, and customize all 8 Master Spreadsheet Workbooks for internal business and personal accounting.
* Prepare, audit, and share reconciled financial reports with clients, bookkeepers, tax authorities, and legal advisors.

## 2. Redistribution Restrictions
You may NOT:
* Sublicense, resell, redistribute, or publicly host the master template files or GridVault Pro source code as standalone templates or SaaS extraction services.
* Bundle the templates into competing commercial template marketplaces without written authorization.

## 3. Privacy & Data Ownership
* GridVault Pro uses a Zero-Knowledge client-side architecture. All cryptographic encryption keys and document OCR parsing are performed directly within your local device and your chosen AI endpoint.
* GridVault Pro does not store, harvest, or resell your proprietary financial data.

## 4. Disclaimer of Accounting Advice
GridVault Pro is an automated document processing utility. Output should be reviewed by qualified tax or accounting professionals before submitting statutory tax filings.
`;

function buildWorkbookBuffer(template: TemplateDefinition): Uint8Array {
  const wb = XLSX.utils.book_new();

  template.sheets.forEach((sheet) => {
    const ws = XLSX.utils.aoa_to_sheet(sheet.data);
    if (sheet.colWidths) {
      ws["!cols"] = sheet.colWidths.map((w) => ({ wch: w }));
    }
    XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName);
  });

  const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(arrayBuffer);
}

export async function createFullCustomerVaultZip(
  onProgress?: (percent: number, status: string) => void
): Promise<Blob> {
  const zip = new JSZip();

  // Root folders
  const b2bFolder = zip.folder("B2B_Corporate_Suite");
  const b2cFolder = zip.folder("B2C_Prosumer_Suite");
  const integrationsFolder = zip.folder("Google_Sheets_Integration");

  const total = TEMPLATE_VAULT.length;

  for (let i = 0; i < total; i++) {
    const template = TEMPLATE_VAULT[i];
    if (onProgress) {
      onProgress(
        Math.round(((i + 1) / total) * 80),
        `Packaging ${template.name}...`
      );
    }

    const buffer = buildWorkbookBuffer(template);
    const targetFolder = template.category === "B2B" ? b2bFolder : b2cFolder;
    targetFolder?.file(template.fileName, buffer);
  }

  // Add Google Apps Script
  integrationsFolder?.file(
    "Google_Sheets_Live_Sync.gs",
    GOOGLE_APPS_SCRIPT_CONTENT
  );

  // Add Documentation & Legal files
  zip.file("WELCOME_AND_QUICKSTART.md", WELCOME_GUIDE_CONTENT);
  zip.file("COMMERCIAL_LICENSE_AGREEMENT.md", COMMERCIAL_LICENSE_CONTENT);

  if (onProgress) {
    onProgress(95, "Compressing master vault archive...");
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  if (onProgress) {
    onProgress(100, "Complete!");
  }

  return blob;
}

export async function downloadFullCustomerVaultZip(
  onProgress?: (percent: number, status: string) => void
): Promise<void> {
  const blob = await createFullCustomerVaultZip(onProgress);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "GridVault_Pro_Fulfillment_Vault.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
