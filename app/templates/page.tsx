// app/templates/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Building2,
  User,
  ArrowLeft,
  Check,
  ShieldCheck,
  Table,
  BarChart3,
  Layers,
  Sparkles,
} from "lucide-react";
import { LandingNavbar } from "@/components/LandingNavbar";
import { TEMPLATE_VAULT } from "@/lib/template-generator";

function getStatusBadgeClass(val: string | number): string {
  const str = String(val).toUpperCase();
  if (
    str.includes("PAID") ||
    str.includes("ACTIVE") ||
    str.includes("APPROVED") ||
    str.includes("RESOLVED") ||
    str.includes("QUALIFIED") ||
    str.includes("COMPLETED") ||
    str.includes("REIMBURSED")
  ) {
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  }
  if (
    str.includes("PENDING") ||
    str.includes("PROCESSING") ||
    str.includes("RENEW") ||
    str.includes("REVIEW") ||
    str.includes("NEEDS AUDIT") ||
    str.includes("SUBMITTED")
  ) {
    return "bg-amber-500/20 text-amber-300 border-amber-500/40";
  }
  if (
    str.includes("OVER") ||
    str.includes("CANCEL") ||
    str.includes("EXPIRED") ||
    str.includes("DENIED") ||
    str.includes("HIGH RISK") ||
    str.includes("UNRESOLVED")
  ) {
    return "bg-rose-500/20 text-rose-300 border-rose-500/40";
  }
  return "bg-slate-800 text-slate-300 border-slate-700";
}

const SPREADSHEET_COLS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function isNumericOrCurrency(val: string | number): boolean {
  if (typeof val === "number") return true;
  const trimmed = String(val).trim();
  return (
    trimmed.startsWith("$") ||
    trimmed.startsWith("€") ||
    trimmed.startsWith("£") ||
    trimmed.startsWith("₹") ||
    trimmed.startsWith("+$") ||
    trimmed.startsWith("-$") ||
    (!isNaN(Number(trimmed.replace(/[,%]/g, ""))) &&
      trimmed.length > 0 &&
      !trimmed.includes("-") &&
      !trimmed.includes("/"))
  );
}

function renderCellEntry(
  cell: string | number,
  cIdx: number,
  totalCols: number,
  isStatusCol: boolean,
  isEntityCol: boolean,
  highlightClass: string
) {
  const str = String(cell).trim();

  // Status Badge
  if (isStatusCol) {
    return (
      <span
        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border tracking-wider uppercase shadow-sm ${getStatusBadgeClass(
          str
        )}`}
      >
        {str}
      </span>
    );
  }

  // Row Entity Naming (Vendor Name, Project Name, Merchant, Asset Name)
  if (isEntityCol) {
    return (
      <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition tracking-tight">
        {str}
      </span>
    );
  }

  // Currency / Financial Amount
  if (
    str.startsWith("$") ||
    str.startsWith("€") ||
    str.startsWith("£") ||
    str.startsWith("₹") ||
    str.startsWith("+$") ||
    str.startsWith("-$")
  ) {
    const isNegative = str.startsWith("-$");
    const isPositive = str.startsWith("+$");
    const isTotalCol = cIdx >= totalCols - 3;

    return (
      <span
        className={`font-mono tabular-nums ${
          isNegative
            ? "text-sm font-black text-rose-400"
            : isPositive
            ? "text-sm font-black text-emerald-400"
            : isTotalCol
            ? `text-sm sm:text-[15px] font-black ${highlightClass}`
            : "text-xs font-bold text-slate-200"
        }`}
      >
        {str}
      </span>
    );
  }

  // ISO Date format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-semibold text-amber-300/90 whitespace-nowrap">
        {str}
      </span>
    );
  }

  // Reference Code / Invoice / SN / Email / Phone
  if (
    str.includes("INV-") ||
    str.includes("ST-") ||
    str.includes("AWS-") ||
    str.includes("SE-") ||
    str.includes("NS-") ||
    str.includes("PRJ-") ||
    str.includes("SN-") ||
    str.includes("SKU-") ||
    str.includes("@")
  ) {
    return (
      <span className="inline-block px-2 py-0.5 rounded bg-sky-950/60 border border-sky-500/30 text-[11px] font-mono font-bold text-sky-300 whitespace-nowrap">
        {str}
      </span>
    );
  }

  // Percentage value
  if (str.endsWith("%")) {
    return (
      <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
        {str}
      </span>
    );
  }

  // Default Entry
  return <span className="text-xs font-medium text-slate-300">{str}</span>;
}

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<"ALL" | "B2B" | "B2C">("ALL");
  const [cardViewMap, setCardViewMap] = useState<Record<string, "TABLE" | "GRAPH" | "SHEETS">>({});
  const setCardView = (id: string, view: "TABLE" | "GRAPH" | "SHEETS") => {
    setCardViewMap((prev) => ({ ...prev, [id]: view }));
  };

  const setAllViews = (view: "TABLE" | "GRAPH" | "SHEETS") => {
    const updated: Record<string, "TABLE" | "GRAPH" | "SHEETS"> = {};
    TEMPLATE_VAULT.forEach((t) => {
      updated[t.id] = view;
    });
    setCardViewMap(updated);
  };

  const displayedTemplates =
    activeCategory === "ALL"
      ? TEMPLATE_VAULT
      : TEMPLATE_VAULT.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <LandingNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8">
        {/* Header Breadcrumb & Title */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Enterprise Turnkey Vault • Color Differentiated</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
                The 8 Master Spreadsheet Workbooks
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Preview eight macro-free Excel workbooks with sample data and layouts for business and personal recordkeeping.
              </p>
            </div>

            <Link href="/app" className="px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
              Open workspace to download
            </Link>
          </div>
        </div>

        {/* Filter Bar & Global View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeCategory === "ALL"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All 8 Workbooks
            </button>
            <button
              onClick={() => setActiveCategory("B2B")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeCategory === "B2B"
                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>B2B Corporate Suite (4)</span>
            </button>
            <button
              onClick={() => setActiveCategory("B2C")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeCategory === "B2C"
                  ? "bg-teal-600 text-white font-bold shadow-md shadow-teal-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>B2C Prosumer Suite (4)</span>
            </button>
          </div>

          {/* Quick Global Switch */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-[11px] font-mono text-slate-500">View Mode:</span>
            <div className="inline-flex rounded-xl bg-slate-950 border border-slate-800 p-0.5">
              <button
                onClick={() => setAllViews("TABLE")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-850 transition flex items-center gap-1"
                title="Switch all templates to Styled Table preview"
              >
                <Table className="w-3 h-3 text-emerald-400" />
                <span>Tables</span>
              </button>
              <button
                onClick={() => setAllViews("GRAPH")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-850 transition flex items-center gap-1"
                title="Switch all templates to Graph view"
              >
                <BarChart3 className="w-3 h-3 text-cyan-400" />
                <span>Graphs</span>
              </button>
              <button
                onClick={() => setAllViews("SHEETS")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-850 transition flex items-center gap-1"
                title="Switch all templates to Sheet tabs view"
              >
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>Sheets</span>
              </button>
            </div>
          </div>
        </div>

        {/* Templates Grid (2-column layout on large screens) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {displayedTemplates.map((template) => {
            const currentView = cardViewMap[template.id] || "TABLE";

            return (
              <div
                key={template.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl transition duration-200 group"
              >
                {/* Colored Top Accent Stripe */}
                <div
                  className={`h-2 w-full bg-gradient-to-r ${template.theme.primaryGradient}`}
                />

                <div className="p-6 sm:p-7 space-y-5 flex-1">
                  {/* Category, Badge & Sheets count */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          template.category === "B2B"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                        }`}
                      >
                        {template.category} • {template.targetUser}
                      </span>
                      {template.badge && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${template.theme.badgeClass}`}
                        >
                          {template.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {template.sheets.length} Sheets Included
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-emerald-300 transition">
                      {template.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  {/* View Mode Toggle Header */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Interactive Preview:</span>
                    </span>

                    {/* View Switcher Tabs */}
                    <div className="inline-flex rounded-xl bg-slate-950 border border-slate-800 p-0.5 text-xs">
                      <button
                        onClick={() => setCardView(template.id, "TABLE")}
                        className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                          currentView === "TABLE"
                            ? "bg-slate-800 text-white shadow"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Table className="w-3 h-3" />
                        <span>Styled Table</span>
                      </button>
                      <button
                        onClick={() => setCardView(template.id, "GRAPH")}
                        className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                          currentView === "GRAPH"
                            ? "bg-slate-800 text-white shadow"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span>Visual Graph</span>
                      </button>
                      <button
                        onClick={() => setCardView(template.id, "SHEETS")}
                        className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                          currentView === "SHEETS"
                            ? "bg-slate-800 text-white shadow"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Layers className="w-3 h-3" />
                        <span>Sheets ({template.sheets.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: STYLED SPREADSHEET TABLE PREVIEW */}
                  {currentView === "TABLE" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${template.theme.primaryGradient}`}
                          />
                          <span className="text-white font-bold">{template.tablePreview.title}</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                          Tabular Spreadsheet Grid
                        </span>
                      </div>

                      {/* Scrollable Styled Table with Tabular Columns */}
                      <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            {/* 1. SPREADSHEET COLUMN LETTER INDICATOR (A, B, C, D...) */}
                            <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-mono text-slate-500 font-bold">
                              <th className="w-8 px-2 py-1 text-center bg-slate-950 border-r border-slate-800/80">#</th>
                              {template.tablePreview.headers.map((_, hIdx) => (
                                <th
                                  key={hIdx}
                                  className="px-3.5 py-1 text-center uppercase tracking-widest border-r border-slate-800/80"
                                >
                                  {SPREADSHEET_COLS[hIdx] || String.fromCharCode(65 + hIdx)}
                                </th>
                              ))}
                            </tr>

                            {/* 2. STYLED COLUMN NAMING (HEADERS) */}
                            <tr className={`${template.theme.headerBg} border-b ${template.theme.headerBorder}`}>
                              <th className="w-8 px-2 py-2.5 text-center text-[10px] font-mono text-slate-400 border-r border-slate-700/50">
                                •
                              </th>
                              {template.tablePreview.headers.map((hdr, hIdx) => {
                                const isNum = hIdx > 2;
                                return (
                                  <th
                                    key={hIdx}
                                    className={`px-3.5 py-2.5 text-xs font-black ${template.theme.headerText} uppercase tracking-wider whitespace-nowrap border-r border-slate-700/50 ${
                                      isNum ? "text-right" : "text-left"
                                    }`}
                                  >
                                    {hdr}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>

                          {/* 3. TABULAR DATA ENTRIES (ROWS WITH CELL BORDERS) */}
                          <tbody className="divide-y divide-slate-800/70 font-sans">
                            {template.tablePreview.rows.map((row, rIdx) => {
                              const isZebra = rIdx % 2 === 1;
                              return (
                                <tr
                                  key={rIdx}
                                  className={`transition hover:bg-slate-850/80 group ${
                                    isZebra ? template.theme.zebraBg : "bg-slate-950"
                                  }`}
                                >
                                  {/* Row Number Column */}
                                  <td className="px-2 py-2 text-center font-mono text-[10px] text-slate-600 border-r border-slate-800/80 bg-slate-950/60 select-none">
                                    {rIdx + 1}
                                  </td>

                                  {row.map((cell, cIdx) => {
                                    const isStatusCol =
                                      template.tablePreview.statusColumnIndex === cIdx;
                                    const isEntityCol =
                                      (cIdx === 1 && template.tablePreview.headers[0].includes("Date")) ||
                                      (cIdx === 0 &&
                                        !template.tablePreview.headers[0].includes("Date") &&
                                        !template.tablePreview.headers[0].includes("Code"));
                                    const isNumeric = isNumericOrCurrency(cell);

                                    return (
                                      <td
                                        key={cIdx}
                                        className={`px-3.5 py-2.5 whitespace-nowrap border-r border-slate-800/80 ${
                                          isStatusCol
                                            ? "text-center"
                                            : isNumeric
                                            ? "text-right"
                                            : "text-left"
                                        }`}
                                      >
                                        {renderCellEntry(
                                          cell,
                                          cIdx,
                                          template.tablePreview.headers.length,
                                          isStatusCol,
                                          isEntityCol,
                                          template.theme.highlightValue
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>

                          {/* 4. TOTAL / SUMMARY ROW AT THE BOTTOM */}
                          {template.tablePreview.totalRow && (
                            <tfoot>
                              <tr className="bg-slate-900 border-t-2 border-slate-700 text-xs font-bold">
                                <td className="px-2 py-2.5 text-center font-mono text-[10px] text-emerald-400 bg-slate-950/80 border-r border-slate-800">
                                  Σ
                                </td>
                                {template.tablePreview.totalRow.map((totCell, tIdx) => {
                                  const isFirst = tIdx === 0;
                                  const isStatusCol = template.tablePreview.statusColumnIndex === tIdx;
                                  const isNumeric = isNumericOrCurrency(totCell);

                                  return (
                                    <td
                                      key={tIdx}
                                      className={`px-3.5 py-2.5 whitespace-nowrap border-r border-slate-800 ${
                                        isStatusCol
                                          ? "text-center"
                                          : isNumeric
                                          ? "text-right"
                                          : "text-left"
                                      }`}
                                    >
                                      {isFirst ? (
                                        <span className="text-xs font-black uppercase tracking-wider text-white">
                                          {String(totCell)}
                                        </span>
                                      ) : isStatusCol ? (
                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 uppercase">
                                          {String(totCell)}
                                        </span>
                                      ) : isNumeric ? (
                                        <span
                                          className={`text-sm sm:text-base font-black font-mono tabular-nums ${template.theme.highlightValue}`}
                                        >
                                          {String(totCell)}
                                        </span>
                                      ) : (
                                        <span className="text-xs font-bold text-slate-300">
                                          {String(totCell)}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
                        <span>Sample data</span>
                        <span>Macro-free Excel layout</span>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: EXECUTIVE VISUAL GRAPHS & KPIS */}
                  {currentView === "GRAPH" && (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full bg-gradient-to-r ${template.theme.primaryGradient}`}
                          />
                          <span>{template.chartPreview.chartType}</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                          Unicode In-Cell Graph Included
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {template.chartPreview.items.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400 truncate max-w-[220px]">
                                {item.label}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-200 font-semibold">
                                  {item.displayValue}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ({item.percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                                style={{ width: `${Math.min(100, item.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Sparkline syntax: [████████░░░░]</span>
                        <span>Instant rendering in Excel &amp; Sheets</span>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: WORKBOOK SHEETS STRUCTURE */}
                  {currentView === "SHEETS" && (
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-semibold text-slate-300">
                        Worksheet Hierarchy &amp; Schema:
                      </span>
                      <div className="space-y-2">
                        {template.sheets.map((sheet, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-400">
                                  {sIdx + 1}
                                </span>
                                <span className="font-mono font-bold text-white">
                                  {sheet.sheetName}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                {sheet.data.length} sample rows
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 pl-7 flex items-center justify-between">
                              <span>
                                Schema:{" "}
                                <span className="text-slate-300 font-mono">
                                  {sheet.sheetName.includes("Summary")
                                    ? "Executive KPI & In-Cell Bar Graphs"
                                    : "Formula-Linked Transaction Ledger"}
                                </span>
                              </span>
                              <span className="text-[10px] text-emerald-400 font-mono">
                                Unlocked .XLSX
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer & Action */}
                <div className="p-6 bg-slate-950/60 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono text-slate-400 block truncate max-w-[260px]">
                      {template.fileName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Standard OpenXML format (.xlsx)
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Universal Compatibility Banner */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block text-sm">Excel workbook format</strong>
              <p className="text-slate-400 mt-0.5">
                The vault contains macro-free .xlsx files.
              </p>
            </div>
          </div>
          <Link
            href="/app"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 hover:border-slate-600 transition whitespace-nowrap flex items-center gap-2"
          >
            <span>Launch Extractor Workspace</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Footer */}
        <footer className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">GridVault Pro</span>
            <span>&bull;</span>
            <span>Workbook previews</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-slate-300">
              Home
            </Link>
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300">
              Terms &amp; License
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
