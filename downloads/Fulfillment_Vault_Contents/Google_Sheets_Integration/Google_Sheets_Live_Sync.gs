/**
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
