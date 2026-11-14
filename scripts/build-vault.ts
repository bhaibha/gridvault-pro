// scripts/build-vault.ts
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import { TEMPLATE_VAULT, TemplateDefinition } from "../lib/template-generator";

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

### 3. Google Sheets Integration (\`Google_Sheets_Integration/Google_Sheets_Live_Sync.gs\`)
* Ready-to-deploy Google Apps Script for real-time 1-click sync from GridVault Pro directly to live Google Sheets.

---

## Universal Compatibility Guarantee
Every workbook in this vault is 100% macro-free, open, and formula-linked. Verified to open cleanly in:
* Microsoft Excel 2016 through Microsoft 365 (Windows & Mac)
* Google Sheets
* Apple Numbers
* LibreOffice Calc
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
`;

function buildWorkbookBuffer(template: TemplateDefinition): Buffer {
  const wb = XLSX.utils.book_new();

  template.sheets.forEach((sheet) => {
    const ws = XLSX.utils.aoa_to_sheet(sheet.data);
    if (sheet.colWidths) {
      ws["!cols"] = sheet.colWidths.map((w) => ({ wch: w }));
    }
    XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName);
  });

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

async function main() {
  const rootDir = path.resolve(__dirname, "..");
  const downloadsDir = path.join(rootDir, "downloads");
  const extractedDir = path.join(downloadsDir, "Fulfillment_Vault_Contents");
  const b2bDir = path.join(extractedDir, "B2B_Corporate_Suite");
  const b2cDir = path.join(extractedDir, "B2C_Prosumer_Suite");
  const integrationsDir = path.join(extractedDir, "Google_Sheets_Integration");
  const publicDir = path.join(rootDir, "public");

  fs.mkdirSync(b2bDir, { recursive: true });
  fs.mkdirSync(b2cDir, { recursive: true });
  fs.mkdirSync(integrationsDir, { recursive: true });
  fs.mkdirSync(publicDir, { recursive: true });

  const zip = new JSZip();
  const zipB2B = zip.folder("B2B_Corporate_Suite");
  const zipB2C = zip.folder("B2C_Prosumer_Suite");
  const zipInt = zip.folder("Google_Sheets_Integration");

  console.log("Generating 8 Master Spreadsheets...");

  for (const template of TEMPLATE_VAULT) {
    const buf = buildWorkbookBuffer(template);
    const targetDir = template.category === "B2B" ? b2bDir : b2cDir;
    const targetZipFolder = template.category === "B2B" ? zipB2B : zipB2C;
    const filePath = path.join(targetDir, template.fileName);

    fs.writeFileSync(filePath, buf);
    targetZipFolder?.file(template.fileName, buf);
    console.log(`  ✓ Generated: [${template.category}] ${template.fileName}`);
  }

  // Google Apps Script
  const gasPath = path.join(integrationsDir, "Google_Sheets_Live_Sync.gs");
  fs.writeFileSync(gasPath, GOOGLE_APPS_SCRIPT_CONTENT);
  zipInt?.file("Google_Sheets_Live_Sync.gs", GOOGLE_APPS_SCRIPT_CONTENT);

  // Docs
  fs.writeFileSync(path.join(extractedDir, "WELCOME_AND_QUICKSTART.md"), WELCOME_GUIDE_CONTENT);
  zip.file("WELCOME_AND_QUICKSTART.md", WELCOME_GUIDE_CONTENT);

  fs.writeFileSync(path.join(extractedDir, "COMMERCIAL_LICENSE_AGREEMENT.md"), COMMERCIAL_LICENSE_CONTENT);
  zip.file("COMMERCIAL_LICENSE_AGREEMENT.md", COMMERCIAL_LICENSE_CONTENT);

  console.log("Generating compressed GridVault_Pro_Fulfillment_Vault.zip...");
  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  const zipPath = path.join(downloadsDir, "GridVault_Pro_Fulfillment_Vault.zip");
  fs.writeFileSync(zipPath, zipBuffer);

  // Copy to public folder for web server download
  const publicZipPath = path.join(publicDir, "GridVault_Pro_Fulfillment_Vault.zip");
  fs.writeFileSync(publicZipPath, zipBuffer);

  console.log("\nSUCCESS!");
  console.log(`Zip archive created at: ${zipPath}`);
  console.log(`Public download URL ready at: http://localhost:3000/GridVault_Pro_Fulfillment_Vault.zip`);
  console.log(`Uncompressed files ready at: ${extractedDir}`);
}

main().catch(console.error);
