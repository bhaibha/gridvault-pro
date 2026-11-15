import JSZip from "jszip";
import * as XLSX from "xlsx";
import { TEMPLATE_VAULT, buildTemplateWorkbook } from "./template-generator";

export async function createFullCustomerVaultZip(): Promise<Blob> {
  const zip = new JSZip();
  for (const template of TEMPLATE_VAULT) {
    const workbook = buildTemplateWorkbook(template);
    const bytes: ArrayBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const folder = template.category === "B2B" ? "B2B_Corporate_Suite" : "B2C_Prosumer_Suite";
    zip.file(`${folder}/${template.fileName}`, bytes);
  }
  zip.file("QUICKSTART.txt", [
    "These macro-free Excel workbooks contain sample layouts and values.",
    "Copy an Excel export into a workbook and review the source documents before using the results.",
    "For Google Sheets, import the Excel file or paste TSV from the workspace.",
    "License terms and support: https://gridvault-pro.vercel.app/terms",
  ].join("\n"));
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}
