// lib/custom-template-store.ts
import * as XLSX from "xlsx";

export type ColumnDataType = "text" | "currency" | "date" | "number" | "category" | "formula";

export interface CustomColumn {
  id: string;
  name: string;
  dataType: ColumnDataType;
  description?: string;
  defaultValue?: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  category: "Business" | "Personal" | "Industry";
  currency: string;
  description: string;
  columns: CustomColumn[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "gridvault_custom_templates_v1";

export const DEFAULT_USER_TEMPLATES: CustomTemplate[] = [
  {
    id: "custom-contractor-draw",
    name: "Subcontractor AIA G702 Draw Ledger",
    category: "Industry",
    currency: "USD",
    description: "Tracks subcontractor application for payment, retainage (10%), and change orders.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    columns: [
      { id: "col-1", name: "Draw_Date", dataType: "date", description: "Application date" },
      { id: "col-2", name: "Subcontractor_Name", dataType: "text", description: "Trade contractor" },
      { id: "col-3", name: "Trade_Discipline", dataType: "category", description: "Plumbing, Electrical, Drywall" },
      { id: "col-4", name: "Contract_Sum_Total", dataType: "currency", description: "Scheduled value" },
      { id: "col-5", name: "Work_Completed_This_Period", dataType: "currency", description: "Current work billed" },
      { id: "col-6", name: "Retainage_Withheld_10pct", dataType: "currency", description: "10% retention" },
      { id: "col-7", name: "Net_Amount_Payable", dataType: "currency", description: "Work minus retainage" },
    ],
  },
  {
    id: "custom-influencer-brand",
    name: "Creator Sponsorship & Royalty Tracker",
    category: "Business",
    currency: "USD",
    description: "Tracks brand deal campaign deliverables, usage rights dates, and payment milestones.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    columns: [
      { id: "col-1", name: "Campaign_Date", dataType: "date", description: "Go-live date" },
      { id: "col-2", name: "Brand_Partner", dataType: "text", description: "Sponsor name" },
      { id: "col-3", name: "Deliverable_Type", dataType: "category", description: "YouTube Integration, Reel, Newsletter" },
      { id: "col-4", name: "Contracted_Gross_Fee", dataType: "currency", description: "Agreed fee" },
      { id: "col-5", name: "Agency_Commission_20pct", dataType: "currency", description: "Manager cut" },
      { id: "col-6", name: "Net_Creator_Payout", dataType: "currency", description: "Net income" },
      { id: "col-7", name: "Payment_Status", dataType: "category", description: "Net 30, Paid, Overdue" },
    ],
  },
];

export function getCustomTemplates(): CustomTemplate[] {
  if (typeof window === "undefined") return DEFAULT_USER_TEMPLATES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER_TEMPLATES));
      return DEFAULT_USER_TEMPLATES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER_TEMPLATES;
  }
}

export function saveCustomTemplate(template: CustomTemplate): void {
  if (typeof window === "undefined") return;
  const existing = getCustomTemplates();
  const index = existing.findIndex((t) => t.id === template.id);
  let updated: CustomTemplate[];
  if (index >= 0) {
    updated = [...existing];
    updated[index] = { ...template, updatedAt: new Date().toISOString() };
  } else {
    updated = [template, ...existing];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteCustomTemplate(id: string): void {
  if (typeof window === "undefined") return;
  const existing = getCustomTemplates();
  const filtered = existing.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function exportCustomTemplateToExcel(template: CustomTemplate): void {
  const wb = XLSX.utils.book_new();

  // Summary header
  const headerData: (string | number)[][] = [
    [`GRIDVAULT PRO — CUSTOM USER TEMPLATE: ${template.name.toUpperCase()}`],
    ["Category", template.category],
    ["Base Currency", template.currency],
    ["Description", template.description],
    ["Last Modified", template.updatedAt.slice(0, 10)],
    [],
    template.columns.map((col) => col.name),
  ];

  // Sample row
  const sampleRow = template.columns.map((col) => {
    switch (col.dataType) {
      case "date":
        return new Date().toISOString().slice(0, 10);
      case "currency":
        return 1250.0;
      case "number":
        return 10;
      case "category":
        return "Category A";
      default:
        return `Sample ${col.name}`;
    }
  });

  headerData.push(sampleRow);

  const ws = XLSX.utils.aoa_to_sheet(headerData);
  ws["!cols"] = template.columns.map(() => ({ wch: 22 }));

  XLSX.utils.book_append_sheet(wb, ws, "Master_Ledger");
  XLSX.writeFile(wb, `${template.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_Template.xlsx`);
}
