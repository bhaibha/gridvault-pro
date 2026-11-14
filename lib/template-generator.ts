// lib/template-generator.ts
import * as XLSX from "xlsx";

export interface SheetDefinition {
  sheetName: string;
  data: (string | number)[][];
  colWidths?: number[];
}

export interface TemplateTheme {
  primaryGradient: string;
  accentGlow: string;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  badgeClass: string;
  zebraBg: string;
  highlightValue: string;
}

export interface TablePreviewData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  statusColumnIndex?: number;
  totalRow?: (string | number)[];
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: "B2B" | "B2C";
  targetUser: string;
  badge: string;
  description: string;
  fileName: string;
  theme: TemplateTheme;
  tablePreview: TablePreviewData;
  chartPreview: {
    chartType: string;
    items: { label: string; value: number; displayValue: string; percentage: number; color: string }[];
  };
  sheets: SheetDefinition[];
}

export function generateVisualBar(ratio: number, barLength: number = 22): string {
  const clamped = Math.min(1, Math.max(0, ratio));
  const filled = Math.round(clamped * barLength);
  const empty = barLength - filled;
  return "[" + "█".repeat(filled) + "░".repeat(empty) + "]";
}

export const TEMPLATE_VAULT: TemplateDefinition[] = [
  // =========================================================================
  // B2B 1: Enterprise Vendor & Tax Reconciliation Ledger (Emerald Theme)
  // =========================================================================
  {
    id: "b2b-vendor-tax",
    name: "Enterprise Vendor & Tax Reconciliation Ledger",
    category: "B2B",
    targetUser: "CFOs, CPAs & Corporate Bookkeepers",
    badge: "GST / VAT / Sales Tax Audit",
    description:
      "Audit-grade 3-tab workbook with Executive Tax Dashboard, in-cell visual expense graphs, AP aging profiles, and statutory GSTR/VAT schedules.",
    fileName: "GridVault_B2B_Enterprise_Tax_Reconciliation_Ledger.xlsx",
    theme: {
      primaryGradient: "from-emerald-500 via-teal-500 to-emerald-700",
      accentGlow: "emerald-500/15",
      headerBg: "bg-emerald-950/90",
      headerBorder: "border-emerald-500/40",
      headerText: "text-emerald-200",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      zebraBg: "bg-emerald-950/20",
      highlightValue: "text-emerald-400",
    },
    tablePreview: {
      title: "Master Vendor Accounts Payable & Tax Ledger",
      headers: ["Invoice Date", "Vendor Entity", "Invoice Ref", "Subtotal", "CGST / VAT", "Total Amount", "Status"],
      statusColumnIndex: 6,
      rows: [
        ["2026-10-02", "UltraTech Materials Ltd", "INV-2026-8841", "$420,000.00", "$75,600.00", "$495,600.00", "PAID"],
        ["2026-10-08", "Apex Steel Fabrications", "ST-99120", "$310,000.00", "$55,800.00", "$365,800.00", "PAID"],
        ["2026-10-14", "AWS Cloud EMEA", "AWS-904128", "$138,925.40", "$27,785.08", "$166,710.48", "PAID"],
        ["2026-11-04", "Schneider Electric Industrial", "SE-44910", "$580,000.00", "$104,400.00", "$684,400.00", "PENDING"],
        ["2026-11-12", "Oracle NetSuite Software", "NS-88419", "$290,000.00", "$52,200.00", "$342,200.00", "PAID"],
      ],
      totalRow: ["TOTAL (5 INVOICES)", "5 Corporate Entities", "Reconciled AP", "$1,738,925.40", "$315,785.08", "$2,054,710.48", "VERIFIED"],
    },
    chartPreview: {
      chartType: "Expense Distribution Graph",
      items: [
        { label: "Raw Materials", value: 861400, displayValue: "$861,400", percentage: 24.7, color: "bg-emerald-500" },
        { label: "Capital Equipment", value: 684400, displayValue: "$684,400", percentage: 19.7, color: "bg-teal-500" },
        { label: "Enterprise Cloud & Software", value: 508910, displayValue: "$508,910", percentage: 14.6, color: "bg-indigo-500" },
        { label: "Commercial Facilities", value: 530290, displayValue: "$530,290", percentage: 15.2, color: "bg-blue-500" },
        { label: "Corporate Legal & Audit", value: 413000, displayValue: "$413,000", percentage: 11.9, color: "bg-amber-500" },
        { label: "Logistics & Freight", value: 171100, displayValue: "$171,100", percentage: 4.9, color: "bg-rose-500" },
      ],
    },
    sheets: [
      {
        sheetName: "Executive_Tax_Summary",
        colWidths: [38, 24, 34, 20],
        data: [
          ["GRIDVAULT PRO — EXECUTIVE TAX & VENDOR AUDIT SUMMARY"],
          ["Corporate Entity", "Acme Global Technologies Inc."],
          ["Reporting Period", "Q4 Fiscal Year 2026 (Oct 01 - Dec 31, 2026)"],
          ["Tax Jurisdiction", "Global Multi-Tax (GST / VAT / Sales Tax)"],
          ["Audit Officer", "Senior Financial Controller"],
          [],
          ["KEY AUDIT PERFORMANCE INDICATORS", "AMOUNT (CURRENCY)", "STATUTORY COMPLIANCE NOTES", "AUDIT STATUS"],
          ["Gross Invoiced Spend (All Bills)", 3482150.0, "Total invoice values including taxes", "RECONCILED"],
          ["Net Pre-Tax Base Expenditure", 2950974.58, "Allowable commercial expense", "VERIFIED"],
          ["Total Claimable Input Tax Credit (ITC)", 531175.42, "Direct credit claimable against sales tax", "CLAIMABLE"],
          ["Unpaid / Open Supplier Payables", 845000.0, "Scheduled in AP aging profile", "PENDING AP"],
          ["Paid Invoices Reconciled", 2637150.0, "Bank transaction hash matched", "SETTLED"],
          ["High-Risk / Duplicate Bills Suppressed", 0, "Zero unauthorized duplicate payouts", "PROTECTED"],
          [],
          ["VISUAL EXPENSE DISTRIBUTION (GRAPH)", "SHARE %", "IN-CELL GRAPHICAL BAR CHART", "TOTAL EXPENDITURE"],
          ["Raw Materials & Production", "24.7%", generateVisualBar(0.247), 861400.0],
          ["Capital Industrial Equipment", "19.7%", generateVisualBar(0.197), 684400.0],
          ["Commercial Facilities & Rent", "15.2%", generateVisualBar(0.152), 530289.52],
          ["Enterprise Software & Cloud", "14.6%", generateVisualBar(0.146), 508910.48],
          ["Corporate Legal & Advisory", "11.9%", generateVisualBar(0.119), 413000.0],
          ["Network Infrastructure", "9.0%", generateVisualBar(0.09), 312700.0],
          ["Freight & Shipping Logistics", "4.9%", generateVisualBar(0.049), 171100.0],
          [],
          ["ACCOUNTS PAYABLE AGING PROFILE (GRAPH)", "EXPOSURE AMOUNT", "AGING VISUAL DISTRIBUTION", "STATUS"],
          ["Current (1 - 30 Days)", 545000.0, generateVisualBar(0.645) + " 64.5%", "Normal Credit Terms"],
          ["Past Due (31 - 60 Days)", 210000.0, generateVisualBar(0.249) + " 24.9%", "Scheduled for Weekly Run"],
          ["Past Due (61 - 90 Days)", 90000.0, generateVisualBar(0.106) + " 10.6%", "Under Reconciliation"],
          ["Critical Overdue (> 90 Days)", 0.0, generateVisualBar(0.0) + " 0.0%", "Zero Delinquent Accounts"],
          [],
          ["TAX CATEGORY BREAKDOWN", "CLAIMABLE TAX (ITC)", "STATUTORY REPORTING CODE", "JURISDICTION"],
          ["Central GST (CGST - 9% / 14%)", 212470.17, "Form GSTR-3B Table 4(A)(5)", "National Tax"],
          ["State GST (SGST - 9% / 14%)", 212470.17, "Form GSTR-3B Table 4(A)(5)", "State Tax"],
          ["Integrated GST (IGST - 18% / 28%)", 78450.0, "Form GSTR-3B Table 4(A)(1)", "Inter-state Tax"],
          ["Standard Corporate VAT (UK/EU 20%)", 27785.08, "HMRC MTD Box 4 / EU Form 303", "European VAT"],
        ],
      },
      {
        sheetName: "Master_Vendor_Ledger",
        colWidths: [12, 14, 28, 20, 16, 18, 14, 12, 12, 12, 12, 16, 14, 14, 20],
        data: [
          [
            "Doc_ID",
            "Invoice_Date",
            "Vendor_Legal_Entity",
            "Tax_Registration_ID",
            "Invoice_Ref_No",
            "Expense_Category",
            "Base_Subtotal",
            "CGST_9",
            "SGST_9",
            "IGST_18",
            "VAT_SalesTax",
            "Total_Invoice_Amt",
            "Payment_Status",
            "Payment_Method",
            "Bank_Txn_Reference",
          ],
          [
            "DOC-801",
            "2026-10-02",
            "UltraTech Building Materials Ltd",
            "29AAACU1234F1Z5",
            "INV-2026-8841",
            "Raw Materials",
            420000.0,
            37800.0,
            37800.0,
            0.0,
            0.0,
            495600.0,
            "PAID",
            "RTGS Bank Transfer",
            "UTR-261002-88190",
          ],
          [
            "DOC-802",
            "2026-10-08",
            "Apex Steel & Fabrications Corp",
            "27AABCA9081G1Z3",
            "ST-99120",
            "Raw Materials",
            310000.0,
            27900.0,
            27900.0,
            0.0,
            0.0,
            365800.0,
            "PAID",
            "RTGS Bank Transfer",
            "UTR-261008-44102",
          ],
          [
            "DOC-803",
            "2026-10-14",
            "Amazon Web Services Cloud EMEA",
            "LU263721890",
            "AWS-904128",
            "Cloud Infrastructure",
            138925.4,
            0.0,
            0.0,
            0.0,
            27785.08,
            166710.48,
            "PAID",
            "Corporate Amex 4019",
            "CC-OCT-AWS-88",
          ],
          [
            "DOC-804",
            "2026-10-22",
            "Delta Interstate Logistics Ltd",
            "07DELT4491P1Z9",
            "DEL-8810",
            "Freight & Shipping",
            145000.0,
            0.0,
            0.0,
            26100.0,
            0.0,
            171100.0,
            "PAID",
            "NEFT Transfer",
            "NEFT-261022-771",
          ],
          [
            "DOC-805",
            "2026-11-04",
            "Schneider Electric Industrial Ltd",
            "29SCHN1234F1Z2",
            "SE-44910",
            "Capital Equipment",
            580000.0,
            52200.0,
            52200.0,
            0.0,
            0.0,
            684400.0,
            "PENDING",
            "Net 30 Invoicing",
            "PENDING-DUE-NOV30",
          ],
          [
            "DOC-806",
            "2026-11-12",
            "Oracle NetSuite Global License",
            "27ORAC9910H1Z5",
            "NS-88419",
            "ERP Software",
            290000.0,
            0.0,
            0.0,
            52200.0,
            0.0,
            342200.0,
            "PAID",
            "Corporate Wire",
            "WIRE-261112-990",
          ],
          [
            "DOC-807",
            "2026-11-20",
            "Cisco Enterprise Systems Pvt",
            "29CISC7788J1Z4",
            "CS-1029",
            "Network Hardware",
            265000.0,
            23850.0,
            23850.0,
            0.0,
            0.0,
            312700.0,
            "PENDING",
            "Net 30 Invoicing",
            "PENDING-DUE-DEC20",
          ],
          [
            "DOC-808",
            "2026-12-02",
            "KPMG Advisory Services LLP",
            "27KPMG4411K1Z8",
            "ADV-9901",
            "Auditing & Tax",
            350000.0,
            31500.0,
            31500.0,
            0.0,
            0.0,
            413000.0,
            "PAID",
            "Direct Debit",
            "DD-261202-331",
          ],
          [
            "DOC-809",
            "2026-12-10",
            "CBRE Commercial Facilities Ltd",
            "29CBRE5522L1Z1",
            "FAC-8812",
            "Facilities & Rent",
            452049.18,
            39120.17,
            39120.17,
            0.0,
            0.0,
            530289.52,
            "PAID",
            "Standing Order",
            "SO-261210-449",
          ],
          [
            "TOTAL",
            "",
            "PORTFOLIO TOTALS",
            "",
            "",
            "",
            2950974.58,
            212470.17,
            212470.17,
            78300.0,
            27785.08,
            3482000.0,
            "",
            "",
            "",
          ],
        ],
      },
      {
        sheetName: "Audit_SOP_&_Formulas",
        colWidths: [24, 55],
        data: [
          ["GRIDVAULT PRO — STANDARD OPERATING PROCEDURE (SOP)"],
          ["Topic", "Accounting & Statutory Verification Standard"],
          [],
          ["Input Tax Credit Rule", "Under GST and VAT laws, ITC may only be claimed on original tax invoices bearing valid registration numbers."],
          ["Subtotal + Tax Proof", "Math Verification Formula: Total_Invoice_Amt = Base_Subtotal + CGST + SGST + IGST + VAT_SalesTax."],
          ["Duplicate Prevention", "Invoices are fingerprinted with SHA-256 (Date + Vendor + Invoice_No + Total) to prevent double payments."],
          ["Retention Policy", "Retain digital source scans in GridVault Pro vault for a minimum statutory period of 6 years."],
        ],
      },
    ],
  },

  // =========================================================================
  // B2B 2: Commercial Job-Costing & Material Budget Suite (Blue/Cyan Theme)
  // =========================================================================
  {
    id: "b2b-job-costing",
    name: "Commercial Job-Costing & Material Budget Suite",
    category: "B2B",
    targetUser: "General Contractors, Developers & Project PMs",
    badge: "Budget vs. Actual Variance",
    description:
      "Enterprise construction and agency job-costing workbook with visual budget-burn graphs, WBS cost code allocations, and contract margin tracking.",
    fileName: "GridVault_B2B_Job_Costing_Material_Tracker.xlsx",
    theme: {
      primaryGradient: "from-blue-600 via-cyan-500 to-indigo-600",
      accentGlow: "blue-500/15",
      headerBg: "bg-blue-950/90",
      headerBorder: "border-blue-500/40",
      headerText: "text-cyan-200",
      badgeClass: "bg-blue-500/20 text-cyan-300 border-blue-500/40",
      zebraBg: "bg-blue-950/20",
      highlightValue: "text-cyan-400",
    },
    tablePreview: {
      title: "Project Budget vs. Actual Expenditure Ledger",
      headers: ["Project Code", "Project Name", "Budget Allocated", "Committed Cost", "Net Variance", "Status"],
      statusColumnIndex: 5,
      rows: [
        ["PRJ-701", "Skyline Heights Towers", "$11,200,000", "$9,850,000", "+$1,350,000", "Under Budget"],
        ["PRJ-702", "Grand Metro Logistics", "$6,400,000", "$6,180,000", "+$220,000", "Under Budget"],
        ["PRJ-703", "Harbor View Villas", "$4,800,000", "$5,020,000", "-$220,000", "OVER BUDGET"],
        ["PRJ-704", "Tech Park Sector 4", "$14,500,000", "$13,100,000", "+$1,400,000", "Under Budget"],
      ],
      totalRow: ["TOTALS", "4 Commercial Sites", "$36,900,000", "$34,150,000", "+$2,750,000", "Under Budget"],
    },
    chartPreview: {
      chartType: "Project Budget Utilization Graph",
      items: [
        { label: "PRJ-701: Skyline Towers", value: 9850000, displayValue: "87.9%", percentage: 87.9, color: "bg-emerald-500" },
        { label: "PRJ-702: Grand Metro Logistics", value: 6180000, displayValue: "96.6%", percentage: 96.6, color: "bg-blue-500" },
        { label: "PRJ-703: Harbor Waterfront", value: 5020000, displayValue: "104.6%", percentage: 104.6, color: "bg-rose-500" },
        { label: "PRJ-704: Tech Park Sector 4", value: 13100000, displayValue: "90.3%", percentage: 90.3, color: "bg-teal-500" },
      ],
    },
    sheets: [
      {
        sheetName: "Project_Variance_Dashboard",
        colWidths: [18, 30, 20, 20, 26, 18, 22],
        data: [
          ["GRIDVAULT PRO — PROJECT JOB-COSTING MASTER DASHBOARD"],
          ["Company", "Pinnacle Construction & Engineering Group"],
          ["Reporting Month", "November 2026"],
          [],
          ["PROJECT CODE", "PROJECT NAME", "REVISED BUDGET", "COMMITTED COST", "BUDGET UTILIZATION (GRAPH)", "NET VARIANCE", "STATUS"],
          ["PRJ-701", "Skyline Heights Luxury Towers", 11200000.0, 9850000.0, generateVisualBar(0.879) + " 87.9%", 1350000.0, "Under Budget (On Track)"],
          ["PRJ-702", "Grand Metro Logistics Center", 6400000.0, 6180000.0, generateVisualBar(0.966) + " 96.6%", 220000.0, "Under Budget (On Track)"],
          ["PRJ-703", "Harbor View Waterfront Villas", 4800000.0, 5020000.0, generateVisualBar(1.0) + " 104.6%", -220000.0, "OVER BUDGET ⚠️"],
          ["PRJ-704", "Tech Park Sector 4 Data Center", 14500000.0, 13100000.0, generateVisualBar(0.903) + " 90.3%", 1400000.0, "Under Budget (On Track)"],
          ["TOTALS", "PORTFOLIO SUMMARY", 36900000.0, 34150000.0, generateVisualBar(0.925) + " 92.5%", 2750000.0, "7.5% Healthy Portfolio Buffer"],
          [],
          ["TRADE DISCIPLINE COST BREAKDOWN (GRAPH)", "EXPENDITURE", "TRADE COST ALLOCATION GRAPH", "SHARE %"],
          ["05-METALS (Structural Steel & Rebar)", 1404000.0, generateVisualBar(0.264), "26.4%"],
          ["15-MECHANICAL (HVAC Chiller Units)", 1920000.0, generateVisualBar(0.361), "36.1%"],
          ["09-FINISHES (Marble, Tile & Ceilings)", 1179000.0, generateVisualBar(0.222), "22.2%"],
          ["16-ELECTRICAL (Armored Cables & Panels)", 462500.0, generateVisualBar(0.087), "8.7%"],
          ["03-CONCRETE (Structural Cement & Aggregates)", 352000.0, generateVisualBar(0.066), "6.6%"],
        ],
      },
      {
        sheetName: "Granular_Material_Log",
        colWidths: [12, 14, 14, 28, 30, 14, 12, 14, 16, 16, 16],
        data: [
          [
            "Log_ID",
            "Delivery_Date",
            "Project_Code",
            "Supplier_Vendor",
            "Material_Description",
            "Cost_Code",
            "Qty",
            "Unit_Rate",
            "Total_Cost",
            "Billable_To_Client",
            "Approval_Status",
          ],
          [
            "MAT-101",
            "2026-11-02",
            "PRJ-701",
            "UltraTech Cement Ltd",
            "OPC 53 Grade Structural Cement",
            "03-CONCRETE",
            800,
            440.0,
            352000.0,
            "YES - Base Contract",
            "Approved by Site PM",
          ],
          [
            "MAT-102",
            "2026-11-04",
            "PRJ-701",
            "Tata Steel Industrial",
            "Fe 550D TMT Rebar (16mm)",
            "05-METALS",
            24,
            58500.0,
            1404000.0,
            "YES - Base Contract",
            "Approved by Site PM",
          ],
          [
            "MAT-103",
            "2026-11-07",
            "PRJ-702",
            "Saint-Gobain Gyproc",
            "Acoustic Ceiling Panels (600x600)",
            "09-FINISHES",
            450,
            620.0,
            279000.0,
            "YES - Base Contract",
            "Approved by Site PM",
          ],
          [
            "MAT-104",
            "2026-11-10",
            "PRJ-703",
            "Italian Marble Importers Corp",
            "Statuario White Polished Slabs",
            "09-FINISHES",
            120,
            7500.0,
            900000.0,
            "Change Order #4",
            "Awaiting Client Signature",
          ],
          [
            "MAT-105",
            "2026-11-15",
            "PRJ-704",
            "Schneider Electric",
            "HVAC Inverter Chiller Modules",
            "15-MECHANICAL",
            4,
            480000.0,
            1920000.0,
            "YES - Base Contract",
            "Approved by Site PM",
          ],
          [
            "MAT-106",
            "2026-11-18",
            "PRJ-704",
            "Havells Industrial Cables",
            "Fire-Resistant Armored Cable 3C",
            "16-ELECTRICAL",
            25,
            18500.0,
            462500.0,
            "YES - Base Contract",
            "Approved by Site PM",
          ],
          [
            "TOTALS",
            "",
            "",
            "",
            "LOG EXPENDITURE TOTAL",
            "",
            "",
            "",
            5317500.0,
            "",
            "",
          ],
        ],
      },
    ],
  },

  // =========================================================================
  // B2B 3: Executive P&L & Cash-Flow Treasury Model (Purple/Violet Theme)
  // =========================================================================
  {
    id: "b2b-cashflow",
    name: "Executive P&L & Cash-Flow Treasury Model",
    category: "B2B",
    targetUser: "Founders, CFOs & Treasury Controllers",
    badge: "Runway & Operating Cash Flow",
    description:
      "Board-ready cash-flow model parsing bank statements into operating burn rate, EBITDA bridges, and liquidity waterfall graphs.",
    fileName: "GridVault_B2B_Executive_CashFlow_Treasury.xlsx",
    theme: {
      primaryGradient: "from-purple-600 via-violet-500 to-indigo-600",
      accentGlow: "purple-500/15",
      headerBg: "bg-purple-950/90",
      headerBorder: "border-purple-500/40",
      headerText: "text-purple-200",
      badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      zebraBg: "bg-purple-950/20",
      highlightValue: "text-purple-400",
    },
    tablePreview: {
      title: "Executive Cash Flow & Runway Reconciliation",
      headers: ["Financial Line Item", "October 2026", "November 2026", "Margin %", "Q4 Trend"],
      statusColumnIndex: 4,
      rows: [
        ["Gross B2B SaaS Revenue", "$485,000", "$542,000", "100%", "+11.8% Growth"],
        ["Direct Hosting & COGS", "-$42,500", "-$46,800", "8.6%", "Controlled"],
        ["Engineering Payroll", "-$185,000", "-$188,000", "34.7%", "Stable"],
        ["Sales & Marketing OpEx", "-$78,500", "-$84,200", "15.5%", "CAC Payback 5.4m"],
        ["Operating EBITDA Profit", "$150,600", "$193,900", "35.8%", "+28.7% Expansion"],
      ],
      totalRow: ["NET CASH RUNWAY", "$2,840,000", "$3,033,900", "+35.8%", "18.4 Months Runway"],
    },
    chartPreview: {
      chartType: "Operating Waterfall Breakdown",
      items: [
        { label: "Gross Revenue", value: 542000, displayValue: "$542k", percentage: 100, color: "bg-emerald-500" },
        { label: "Engineering Payroll", value: 188000, displayValue: "$188k", percentage: 34.6, color: "bg-indigo-500" },
        { label: "Sales & Marketing", value: 84200, displayValue: "$84.2k", percentage: 15.5, color: "bg-amber-500" },
        { label: "Hosting & Infrastructure", value: 46800, displayValue: "$46.8k", percentage: 8.6, color: "bg-teal-500" },
        { label: "Net EBITDA Profit", value: 193900, displayValue: "$193.9k (35.8%)", percentage: 35.8, color: "bg-blue-500" },
      ],
    },
    sheets: [
      {
        sheetName: "Executive_P&L_Board_Summary",
        colWidths: [38, 18, 18, 28, 20],
        data: [
          ["GRIDVAULT PRO — EXECUTIVE P&L & TREASURY REPORT"],
          ["Corporate Entity", "SaaS Scale Operations Inc."],
          ["Treasury Currency", "USD ($)"],
          [],
          ["FINANCIAL LINE ITEM", "OCTOBER 2026", "NOVEMBER 2026", "REVENUE & OPEX WATERFALL (GRAPH)", "Q4 MOM PERFORMANCE"],
          ["Gross B2B SaaS Revenue", 485000.0, 542000.0, generateVisualBar(1.0) + " Revenue Inflow", "+11.8% MoM Growth"],
          ["Direct Hosting & COGS (AWS/GCP)", -42500.0, -46800.0, generateVisualBar(0.086) + " 8.6% of Rev", "COGS Controlled"],
          ["Gross Operating Margin", 442500.0, 495200.0, generateVisualBar(0.914) + " 91.4% Margin", "High Gross Margin"],
          ["R&D & Engineering Payroll", -185000.0, -188000.0, generateVisualBar(0.347) + " 34.7% of Rev", "Stable Staffing"],
          ["Sales, Marketing & Acquisition", -78500.0, -84200.0, generateVisualBar(0.155) + " 15.5% of Rev", "CAC Payback 5.4 Mo"],
          ["General & Administrative (G&A)", -28400.0, -29100.0, generateVisualBar(0.054) + " 5.4% of Rev", "Facilities & Legal"],
          ["Total Operating Expenses (OpEx)", -291900.0, -301300.0, generateVisualBar(0.556) + " 55.6% Total Burn", "Controlled OpEx"],
          ["Operating Income (EBITDA)", 150600.0, 193900.0, generateVisualBar(0.358) + " 35.8% Net Margin", "+28.7% Profit Expansion"],
          [],
          ["TREASURY & RUNWAY METRICS", "CURRENT BALANCE", "RUN RATE", "STATUS"],
          ["Cash & Liquid Equivalents", 2840000.0, "$2.84M in Silicon Valley Bank", "Healthy Reserves"],
          ["Net Monthly Operating Burn", 0.0, "Profitable / Self-Sustaining", "Infinite Runway"],
          ["Days Sales Outstanding (DSO)", 38.2, "Industry Average: 45 Days", "Top Quartile"],
        ],
      },
      {
        sheetName: "Bank_Reconciliation_Ledger",
        colWidths: [14, 20, 28, 18, 16, 16, 18],
        data: [
          [
            "Txn_Date",
            "Transaction_ID",
            "Counterparty_Entity",
            "Account_Class",
            "Debit_Cash_Out",
            "Credit_Cash_In",
            "Closing_Balance",
          ],
          ["2026-11-01", "TXN-90142", "Stripe Enterprise Payout", "Revenue", 0.0, 142500.0, 2642500.0],
          ["2026-11-03", "TXN-90143", "AWS Cloud Services EMEA", "COGS", 24500.0, 0.0, 2618000.0],
          ["2026-11-05", "TXN-90144", "Gusto Monthly Payroll", "Payroll", 185000.0, 0.0, 2433000.0],
          ["2026-11-12", "TXN-90145", "Fortune 500 Enterprise Deal", "Revenue", 0.0, 285000.0, 2718000.0],
          ["2026-11-18", "TXN-90146", "Google Workspace & Software", "G&A", 4200.0, 0.0, 2713800.0],
          ["2026-11-25", "TXN-90147", "LinkedIn Corporate Ads", "Marketing", 18500.0, 0.0, 2695300.0],
          ["2026-11-30", "TXN-90148", "Silicon Valley Bank Interest", "Treasury", 0.0, 9420.0, 2704720.0],
          ["TOTALS", "", "MONTHLY CASH FLOW", "", 232200.0, 436920.0, "+$204,720 Net Flow"],
        ],
      },
    ],
  },

  // =========================================================================
  // B2B 4: Strategic Lead CRM & Pipeline Funnel (Rose/Pink Theme)
  // =========================================================================
  {
    id: "b2b-lead-crm",
    name: "Strategic Lead & Business Card CRM Suite",
    category: "B2B",
    targetUser: "Chief Revenue Officers & Enterprise Sales Execs",
    badge: "Pipeline & Follow-up Launcher",
    description:
      "Converts conference card scans into a high-converting sales pipeline with visual deal-stage funnel graphs and contact enrichment.",
    fileName: "GridVault_B2B_Lead_CRM_Pipeline.xlsx",
    theme: {
      primaryGradient: "from-rose-500 via-pink-500 to-amber-500",
      accentGlow: "rose-500/15",
      headerBg: "bg-rose-950/90",
      headerBorder: "border-rose-500/40",
      headerText: "text-rose-200",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      zebraBg: "bg-rose-950/20",
      highlightValue: "text-rose-400",
    },
    tablePreview: {
      title: "Conference Lead & Deal Opportunity Pipeline",
      headers: ["Full Name", "Corporate Title", "Company", "Direct Email", "Lead Tier", "Estimated Value"],
      statusColumnIndex: 4,
      rows: [
        ["Alexander Hayes", "CIO", "Vanguard Logistics", "a.hayes@vanguard.com", "Tier 1 Hot", "$420,000"],
        ["Dr. Elena Rostova", "VP Procurement", "Nordic Pharma", "e.rostova@nordic.se", "Tier 1 Hot", "$350,000"],
        ["Marcus Thorne", "Head of Ops", "Titan Infrastructure", "m.thorne@titan.com", "Tier 2 Warm", "$180,000"],
        ["Siddharth Mehta", "Managing Partner", "Mehta CPAs", "siddharth@mehta.in", "Partner", "$800,000"],
      ],
      totalRow: ["TOTAL PIPELINE", "4 Key Decision Makers", "Enterprise Accounts", "All Contacts Verified", "Active Pipeline", "$1,750,000"],
    },
    chartPreview: {
      chartType: "Sales Pipeline Funnel",
      items: [
        { label: "Tier 1 Hot Leads", value: 420000, displayValue: "14 Deals ($420k)", percentage: 23.6, color: "bg-rose-500" },
        { label: "Tier 2 Warm Evaluators", value: 560000, displayValue: "28 Deals ($560k)", percentage: 31.5, color: "bg-amber-500" },
        { label: "Enterprise Strategic Partners", value: 800000, displayValue: "8 Deals ($800k)", percentage: 44.9, color: "bg-emerald-500" },
      ],
    },
    sheets: [
      {
        sheetName: "Executive_Pipeline_Dashboard",
        colWidths: [32, 14, 20, 28, 22],
        data: [
          ["GRIDVAULT PRO — EXECUTIVE SALES PIPELINE SUMMARY"],
          ["Conference Event", "SaaS Growth Summit SF & TechWeek 2026"],
          [],
          ["PIPELINE STAGE", "LEAD COUNT", "DEAL VALUE ($)", "PIPELINE STAGE FUNNEL (GRAPH)", "NEXT ACTION REQUIRED"],
          ["Tier 1 Hot Leads (Decision Makers)", 14, 420000.0, generateVisualBar(0.236) + " 23.6%", "Schedule 20-min Founder Demo"],
          ["Tier 2 Warm Leads (Evaluators)", 28, 560000.0, generateVisualBar(0.315) + " 31.5%", "Send Case Study & Free Sandbox"],
          ["Tier 3 Enterprise Strategic Partners", 8, 800000.0, generateVisualBar(0.449) + " 44.9%", "Introduce to Partnerships VP"],
          ["TOTAL PIPELINE GENERATED", 50, 1780000.0, generateVisualBar(1.0) + " 100%", "Estimated Closing Rate: 18.5%"],
        ],
      },
      {
        sheetName: "Contact_Outreach_Roster",
        colWidths: [12, 22, 26, 26, 30, 18, 16, 20, 28],
        data: [
          [
            "Scan_Date",
            "Full_Name",
            "Corporate_Title",
            "Company_Name",
            "Direct_Email",
            "Phone_Number",
            "Lead_Tier",
            "Lead_Source",
            "Action_Notes",
          ],
          [
            "2026-11-06",
            "Alexander Hayes",
            "Chief Information Officer",
            "Vanguard Logistics Global",
            "a.hayes@vanguardglobal.com",
            "+1-415-555-0182",
            "Tier 1 Hot",
            "SaaS Summit Keynote",
            "Interested in 500-user enterprise rollout",
          ],
          [
            "2026-11-06",
            "Dr. Elena Rostova",
            "VP Procurement & Finance",
            "Nordic Pharma Biotech",
            "elena.rostova@nordicpharma.se",
            "+46-8-555-0199",
            "Tier 1 Hot",
            "CPA Breakfast Panel",
            "Wants audit compliance sheet demo",
          ],
          [
            "2026-11-07",
            "Marcus Thorne",
            "Head of Construction Ops",
            "Titan Infrastructure Group",
            "m.thorne@titaninfra.com",
            "+1-312-555-0144",
            "Tier 2 Warm",
            "Booth Visit #4",
            "Send Job Costing material sheet template",
          ],
          [
            "2026-11-07",
            "Siddharth Mehta",
            "Managing Partner",
            "Mehta & Associates CPAs",
            "siddharth@mehtacpas.in",
            "+91-98200-11223",
            "Partner",
            "B2B Partner Lounge",
            "Wants 30% affiliate link for client roster",
          ],
        ],
      },
    ],
  },

  // =========================================================================
  // B2C 1: Tax-Deduction & IRS/HMRC Audit Organizer (Teal/Mint Theme)
  // =========================================================================
  {
    id: "b2c-tax-organizer",
    name: "Comprehensive Tax-Deduction & Audit Organizer",
    category: "B2C",
    targetUser: "Freelancers, Creators, Consultants & Prosumers",
    badge: "IRS / HMRC Audit-Ready",
    description:
      "Audit-proof personal tax organizer with category deduction graphs, Section 179 depreciation schedules, and tax savings projections.",
    fileName: "GridVault_B2C_Tax_Deduction_Audit_Organizer.xlsx",
    theme: {
      primaryGradient: "from-teal-500 via-emerald-500 to-green-600",
      accentGlow: "teal-500/15",
      headerBg: "bg-teal-950/90",
      headerBorder: "border-teal-500/40",
      headerText: "text-teal-200",
      badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      zebraBg: "bg-teal-950/20",
      highlightValue: "text-teal-400",
    },
    tablePreview: {
      title: "Schedule C Allowable Business Deductions",
      headers: ["Deduction Class", "Expense ($)", "Audit Verification Proof", "Tax Deductible"],
      statusColumnIndex: 3,
      rows: [
        ["Self-Employed Health Insurance", "$6,800.00", "Form 1040 Adjustments", "100% Eligible"],
        ["Business Travel & Lodging", "$5,420.00", "Boarding passes & lodging folio", "100% Eligible"],
        ["Computing Hardware (Sec 179)", "$4,890.00", "Apple invoices attached", "100% Eligible"],
        ["Dedicated Home Office Space", "$4,200.00", "250 sq ft allocated office", "100% Eligible"],
        ["Software & AI Development", "$3,140.00", "API & SaaS monthly billing", "100% Eligible"],
      ],
      totalRow: ["TOTAL DEDUCTIONS", "$24,450.00", "5 Audit Proofs Attached", "100% Eligible"],
    },
    chartPreview: {
      chartType: "Tax Deduction Breakdown",
      items: [
        { label: "Self-Employed Health", value: 6800, displayValue: "$6,800", percentage: 23.7, color: "bg-emerald-500" },
        { label: "Business Travel & Lodging", value: 5420, displayValue: "$5,420", percentage: 18.9, color: "bg-blue-500" },
        { label: "Computing Hardware (Sec 179)", value: 4890, displayValue: "$4,890", percentage: 17.0, color: "bg-teal-500" },
        { label: "Home Office Allocation", value: 4200, displayValue: "$4,200", percentage: 14.6, color: "bg-indigo-500" },
        { label: "Software & AI Tools", value: 3140, displayValue: "$3,140", percentage: 10.9, color: "bg-amber-500" },
      ],
    },
    sheets: [
      {
        sheetName: "Tax_Deduction_Summary",
        colWidths: [38, 18, 28, 32],
        data: [
          ["GRIDVAULT PRO — ANNUAL TAX DEDUCTION & AUDIT REPORT"],
          ["Taxpayer / Business Entity", "John Doe (Sole Proprietor / Consultant)"],
          ["Tax Assessment Year", "Tax Year 2026 (Filing Due April 2027)"],
          ["IRS Schedule / Form", "Schedule C (Profit or Loss from Business)"],
          [],
          ["TAX DEDUCTION CATEGORY", "EXPENSE ($)", "DEDUCTION SHARE (GRAPH)", "AUDIT VERIFICATION STATUS"],
          ["Self-Employed Health Insurance", 6800.0, generateVisualBar(0.237) + " 23.7%", "Verified on Form 1040"],
          ["Business Travel, Flights & Lodging", 5420.0, generateVisualBar(0.189) + " 18.9%", "Boarding passes & hotel receipts"],
          ["Hardware & Computing Equipment (Sec 179)", 4890.0, generateVisualBar(0.17) + " 17.0%", "Apple invoices attached"],
          ["Home Office Dedicated Allocation", 4200.0, generateVisualBar(0.146) + " 14.6%", "250 sq ft dedicated workspace"],
          ["Software, AI Tools & Subscriptions", 3140.0, generateVisualBar(0.109) + " 10.9%", "API & SaaS receipts logged"],
          ["Professional Education & Industry Certs", 2150.0, generateVisualBar(0.075) + " 7.5%", "Course certificate verified"],
          ["Charitable Cash Donations (501c3)", 1500.0, generateVisualBar(0.052) + " 5.2%", "Written acknowledgment attached"],
          ["Business Meals (50% Allowable)", 640.0, generateVisualBar(0.022) + " 2.2%", "Client attendee log attached"],
          [],
          ["TOTAL ALLOWABLE DEDUCTIONS", 28740.0, generateVisualBar(1.0) + " 100%", "Direct deduction from gross income"],
          ["ESTIMATED CASH TAX SAVINGS", 9196.8, "At 32% Marginal Tax Bracket", "Net cash preserved in pocket"],
        ],
      },
      {
        sheetName: "Itemized_Receipt_Vault",
        colWidths: [12, 14, 22, 26, 16, 14, 10, 36, 14],
        data: [
          [
            "Receipt_ID",
            "Date",
            "Deduction_Class",
            "Vendor_Store",
            "Receipt_Ref_No",
            "Expense_Amount",
            "Currency",
            "Business_Purpose_Documentation",
            "Audit_Ready",
          ],
          [
            "RCP-401",
            "2026-02-14",
            "Hardware",
            "Apple Store Fifth Ave",
            "APL-991204",
            3499.0,
            "USD",
            "MacBook Pro M4 Max for AI agent development",
            "VERIFIED",
          ],
          [
            "RCP-402",
            "2026-03-10",
            "Software",
            "Anthropic & OpenAI API",
            "INV-88190",
            480.0,
            "USD",
            "Client document batch extraction tokens",
            "VERIFIED",
          ],
          [
            "RCP-403",
            "2026-04-18",
            "Travel",
            "Delta Air Lines",
            "DL-849102",
            840.0,
            "USD",
            "Roundtrip SF to NYC for Q2 Client Strategy",
            "VERIFIED",
          ],
          [
            "RCP-404",
            "2026-06-22",
            "Education",
            "MIT Professional Ed",
            "MIT-2291",
            1950.0,
            "USD",
            "Advanced Agentic AI Architecture Masterclass",
            "VERIFIED",
          ],
          [
            "RCP-405",
            "2026-09-14",
            "Charity",
            "Red Cross International",
            "DON-904",
            1000.0,
            "USD",
            "501(c)(3) official donation acknowledgment",
            "VERIFIED",
          ],
        ],
      },
    ],
  },

  // =========================================================================
  // B2C 2: Household Budget & Subscription Leak Finder (Amber/Coral Theme)
  // =========================================================================
  {
    id: "b2c-subscription-leak",
    name: "Household Budget & Recurring Subscription Audit",
    category: "B2C",
    targetUser: "Families, High-Net-Worth Individuals & Budgeters",
    badge: "Leak & Waste Elimination",
    description:
      "Audits credit card statements to isolate forgotten SaaS trials, gym fees, and inflation creep with annualized drain waterfall charts.",
    fileName: "GridVault_B2C_Budget_Subscription_Leak_Finder.xlsx",
    theme: {
      primaryGradient: "from-amber-500 via-orange-500 to-red-500",
      accentGlow: "amber-500/15",
      headerBg: "bg-amber-950/90",
      headerBorder: "border-amber-500/40",
      headerText: "text-amber-200",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      zebraBg: "bg-amber-950/20",
      highlightValue: "text-amber-400",
    },
    tablePreview: {
      title: "Recurring Subscription Waste & Cancellation Roster",
      headers: ["Service Provider", "Category", "Monthly Fee", "Annualized Drain", "Action Required", "Annual Saved"],
      statusColumnIndex: 4,
      rows: [
        ["Luxury Health Club", "Fitness", "$89.00", "$1,068.00", "CANCEL", "$1,068.00"],
        ["Streaming TV Bundle", "Media", "$34.99", "$419.88", "DOWNGRADE", "$210.00"],
        ["Duplicate Cloud Storage", "Tech", "$19.99", "$239.88", "CANCEL", "$239.88"],
        ["Forgotten Audiobook App", "Media", "$14.95", "$179.40", "PAUSE", "$179.40"],
      ],
      totalRow: ["TOTALS (4 ACTIVE)", "4 Subscriptions", "$158.89 /mo", "$1,907.16 /yr", "4 ACTIONED", "$1,697.28 SAVED"],
    },
    chartPreview: {
      chartType: "Annualized Subscription Drain",
      items: [
        { label: "Unused Gym Membership", value: 1068, displayValue: "$1,068/yr", percentage: 51.8, color: "bg-rose-500" },
        { label: "Streaming TV Bundle", value: 420, displayValue: "$420/yr", percentage: 20.3, color: "bg-amber-500" },
        { label: "Duplicate Cloud Storage", value: 240, displayValue: "$240/yr", percentage: 11.6, color: "bg-indigo-500" },
        { label: "Audiobook Credits", value: 179, displayValue: "$179/yr", percentage: 8.7, color: "bg-teal-500" },
        { label: "Unused VPN Renewals", value: 156, displayValue: "$156/yr", percentage: 7.6, color: "bg-blue-500" },
      ],
    },
    sheets: [
      {
        sheetName: "Subscription_Leak_Analysis",
        colWidths: [34, 18, 16, 18, 28, 20],
        data: [
          ["GRIDVAULT PRO — SUBSCRIPTION LEAK & SAVINGS AUDIT"],
          [],
          ["SERVICE PROVIDER", "CATEGORY", "MONTHLY FEE", "ANNUAL DRAIN (GRAPH)", "ACTION REQUIRED", "ANNUAL CASH SAVED"],
          ["Gym & Health Club Membership", "Fitness", 89.0, generateVisualBar(0.518) + " $1,068/yr", "Zero visits in 4 mo — CANCEL", 1068.0],
          ["Streaming TV Bundle (Max/Hulu)", "Entertainment", 34.99, generateVisualBar(0.203) + " $420/yr", "Consolidate into ad-tier", 210.0],
          ["Unused Cloud Storage Tier", "Tech", 19.99, generateVisualBar(0.116) + " $240/yr", "Duplicate of iCloud — CANCEL", 239.88],
          ["Audiobook Monthly Credit", "Media", 14.95, generateVisualBar(0.087) + " $179/yr", "12 unspent credits — PAUSE", 179.4],
          ["VPN Auto-Renew Service", "Security", 12.99, generateVisualBar(0.076) + " $156/yr", "Switch to free router VPN", 155.88],
          ["TOTAL SUBSCRIPTION DRAIN", "", 171.92, generateVisualBar(1.0) + " $2,063/yr", "4 Actionable Leaks Found", "$1,853.16 / Year Saved"],
        ],
      },
    ],
  },

  // =========================================================================
  // B2C 3: Home Renovation & Asset Warranty Vault (Cyan/Sky Theme)
  // =========================================================================
  {
    id: "b2c-warranty-tracker",
    name: "Home Renovation & Asset Warranty Vault",
    category: "B2C",
    targetUser: "Homeowners, Real Estate Investors & Landlords",
    badge: "Capital Improvements & Warranties",
    description:
      "Tracks contractor milestone payments, materials receipts, appliance serial numbers, and automated warranty expiration countdown schedules.",
    fileName: "GridVault_B2C_Renovation_Warranty_Tracker.xlsx",
    theme: {
      primaryGradient: "from-cyan-500 via-sky-500 to-blue-600",
      accentGlow: "cyan-500/15",
      headerBg: "bg-cyan-950/90",
      headerBorder: "border-cyan-500/40",
      headerText: "text-cyan-200",
      badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      zebraBg: "bg-cyan-950/20",
      highlightValue: "text-cyan-400",
    },
    tablePreview: {
      title: "Appliance & Home Asset Warranty Registry",
      headers: ["Asset Name", "Manufacturer", "Serial Number", "Purchase Cost", "Warranty Expiry", "Status"],
      statusColumnIndex: 5,
      rows: [
        ["Inverter Heat Pump HVAC", "Carrier Commercial", "24VNA9 / SN-88190", "$7,850.00", "2036-04-12", "9.4 Yrs Active"],
        ["French Door Smart Fridge", "Samsung Bespoke", "RF29 / SN-449102", "$2,499.00", "2031-06-18", "4.6 Yrs Active"],
        ["Architectural Roof Shingles", "GAF Timberline HDZ", "SKU-GAF-HDZ", "$12,400.00", "2056-08-05", "29.8 Yrs Active"],
      ],
      totalRow: ["TOTAL ASSET VALUE", "3 Core Home Systems", "3 Serialized Warranties", "$22,749.00", "2031 - 2056", "3 PROTECTED"],
    },
    chartPreview: {
      chartType: "Warranty Lifespan Countdown",
      items: [
        { label: "Architectural Roof Shingles", value: 30, displayValue: "29.8 Yrs Left", percentage: 99.3, color: "bg-emerald-500" },
        { label: "Carrier Inverter Heat Pump", value: 10, displayValue: "9.4 Yrs Left", percentage: 94.0, color: "bg-teal-500" },
        { label: "Samsung French Door Fridge", value: 5, displayValue: "4.6 Yrs Left", percentage: 92.0, color: "bg-blue-500" },
      ],
    },
    sheets: [
      {
        sheetName: "Asset_Warranty_Schedule",
        colWidths: [14, 28, 22, 26, 20, 16, 14, 18, 28],
        data: [
          [
            "Purchase_Date",
            "Asset_Name",
            "Manufacturer",
            "Model_Serial_Number",
            "Retailer_Vendor",
            "Cost ($)",
            "Warranty_Yrs",
            "Expiry_Date",
            "WARRANTY LIFESPAN (GRAPH)",
          ],
          [
            "2026-04-12",
            "Duo Inverter Heat Pump HVAC",
            "Carrier Commercial",
            "24VNA9 / SN-88190412",
            "AirPro Mechanical Ltd",
            7850.0,
            10,
            "2036-04-12",
            generateVisualBar(0.94) + " 9.4 Yrs Remaining",
          ],
          [
            "2026-06-18",
            "French Door Smart Fridge",
            "Samsung Bespoke",
            "RF29BB8600 / SN-449102",
            "Best Buy Commercial",
            2499.0,
            5,
            "2031-06-18",
            generateVisualBar(0.92) + " 4.6 Yrs Remaining",
          ],
          [
            "2026-08-05",
            "Architectural Roof Shingles",
            "GAF Timberline HDZ",
            "SKU-GAF-HDZ-Charcoal",
            "Beacon Building Supply",
            12400.0,
            30,
            "2056-08-05",
            generateVisualBar(0.993) + " 29.8 Yrs Remaining",
          ],
        ],
      },
    ],
  },

  // =========================================================================
  // B2C 4: Multi-Currency Travel Claim Suite (Indigo/Violet Theme)
  // =========================================================================
  {
    id: "b2c-travel-claim",
    name: "Multi-Currency Corporate Travel Claim Suite",
    category: "B2C",
    targetUser: "Business Travelers, Consultants & Remote Execs",
    badge: "Multi-Currency FX Normalizer",
    description:
      "Normalizes mixed-currency travel receipts (USD, EUR, GBP, CHF) into your reimbursement home currency with visual category allocation graphs.",
    fileName: "GridVault_B2C_Travel_Expense_Claim.xlsx",
    theme: {
      primaryGradient: "from-indigo-500 via-purple-500 to-pink-500",
      accentGlow: "indigo-500/15",
      headerBg: "bg-indigo-950/90",
      headerBorder: "border-indigo-500/40",
      headerText: "text-indigo-200",
      badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      zebraBg: "bg-indigo-950/20",
      highlightValue: "text-indigo-400",
    },
    tablePreview: {
      title: "International Travel Expense Reimbursement Voucher",
      headers: ["Expense Category", "Original Currency", "FX Rate", "Reimbursed Amount ($)", "Status"],
      statusColumnIndex: 4,
      rows: [
        ["Commercial Flights (BA & Swiss)", "£1,240 + CHF 450", "1.28 / 1.12", "$2,091.20", "Approved"],
        ["Hotel Lodging (6 Nights)", "€1,450.00", "1.08", "$1,566.00", "Approved"],
        ["Client Dinners & Working Meals", "£380 + €290", "1.28 / 1.08", "$799.60", "Approved"],
        ["Local High-Speed Rail & Taxis", "CHF 180 + €85", "1.12 / 1.08", "$293.40", "Approved"],
      ],
      totalRow: ["TOTAL REIMBURSEMENT", "GBP / CHF / EUR Normalized", "Multi-Currency FX", "$4,750.20", "Approved"],
    },
    chartPreview: {
      chartType: "Travel Expense Allocation",
      items: [
        { label: "Commercial Flights", value: 2091.2, displayValue: "$2,091 (44.0%)", percentage: 44.0, color: "bg-indigo-500" },
        { label: "Hotel Lodging", value: 1566.0, displayValue: "$1,566 (33.0%)", percentage: 33.0, color: "bg-emerald-500" },
        { label: "Working Meals", value: 799.6, displayValue: "$799.60 (16.8%)", percentage: 16.8, color: "bg-amber-500" },
        { label: "Local Rail & Transit", value: 293.4, displayValue: "$293.40 (6.2%)", percentage: 6.2, color: "bg-teal-500" },
      ],
    },
    sheets: [
      {
        sheetName: "Reimbursement_Claim_Voucher",
        colWidths: [32, 24, 16, 18, 28, 24],
        data: [
          ["GRIDVAULT PRO — EXECUTIVE EXPENSE REIMBURSEMENT CLAIM"],
          ["Employee Name", "Marcus Sterling (Lead Engagement Consultant)"],
          ["Trip Itinerary", "European Client Tour (London - Zurich - Munich)"],
          ["Reimbursement Currency", "USD ($)"],
          [],
          ["EXPENSE CATEGORY", "ORIGINAL SPEND", "FX RATE", "CONVERTED ($)", "SPEND ALLOCATION (GRAPH)", "REIMBURSEMENT CODE"],
          ["Commercial Flights (BA & Swiss)", "£1,240.00 + CHF 450.00", "1.28 / 1.12", 2091.2, generateVisualBar(0.44) + " 44.0%", "Approved - Code 101"],
          ["Hotel Lodging (6 Nights Total)", "€1,450.00", "1.08", 1566.0, generateVisualBar(0.33) + " 33.0%", "Approved - Code 102"],
          ["Client Dinners & Working Meals", "£380.00 + €290.00", "1.28 / 1.08", 799.6, generateVisualBar(0.168) + " 16.8%", "Approved - Code 103"],
          ["Local Rail, High-Speed & Taxis", "CHF 180.00 + €85.00", "1.12 / 1.08", 293.4, generateVisualBar(0.062) + " 6.2%", "Approved - Code 104"],
          [],
          ["TOTAL CLAIM SUBMITTED", "", "", 4750.2, generateVisualBar(1.0) + " 100%", "Approved by Managing Director"],
        ],
      },
    ],
  },
];

export function downloadTemplateWorkbook(templateId: string): void {
  const template = TEMPLATE_VAULT.find((t) => t.id === templateId);
  if (!template) {
    console.error(`Template not found: ${templateId}`);
    return;
  }

  const wb = XLSX.utils.book_new();

  template.sheets.forEach((sheet) => {
    const ws = XLSX.utils.aoa_to_sheet(sheet.data);
    if (sheet.colWidths) {
      ws["!cols"] = sheet.colWidths.map((w) => ({ wch: w }));
    }
    XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName);
  });

  XLSX.writeFile(wb, template.fileName);
}

export function downloadAllTemplates(): void {
  TEMPLATE_VAULT.forEach((template, idx) => {
    setTimeout(() => {
      downloadTemplateWorkbook(template.id);
    }, idx * 300);
  });
}
