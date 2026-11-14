// components/VaultModal.tsx
"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  X,
  Check,
  Building2,
  User,
  Table,
  ChevronDown,
  ChevronUp,
  Archive,
} from "lucide-react";
import {
  TEMPLATE_VAULT,
  downloadTemplateWorkbook,
  downloadAllTemplates,
} from "@/lib/template-generator";
import { downloadFullCustomerVaultZip } from "@/lib/bundle-packager";

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getStatusBadgeClass(val: string | number): string {
  const str = String(val).toUpperCase();
  if (
    str.includes("PAID") ||
    str.includes("ACTIVE") ||
    str.includes("APPROVED") ||
    str.includes("RESOLVED") ||
    str.includes("QUALIFIED") ||
    str.includes("COMPLETED")
  ) {
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  }
  if (
    str.includes("PENDING") ||
    str.includes("PROCESSING") ||
    str.includes("RENEW") ||
    str.includes("REVIEW")
  ) {
    return "bg-amber-500/20 text-amber-300 border-amber-500/40";
  }
  if (
    str.includes("OVER") ||
    str.includes("CANCEL") ||
    str.includes("EXPIRED") ||
    str.includes("DENIED") ||
    str.includes("HIGH RISK")
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

  if (isStatusCol) {
    return (
      <span
        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border tracking-wider uppercase shadow-sm ${getStatusBadgeClass(
          str
        )}`}
      >
        {str}
      </span>
    );
  }

  if (isEntityCol) {
    return (
      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
        {str}
      </span>
    );
  }

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
            ? "text-xs font-black text-rose-400"
            : isPositive
            ? "text-xs font-black text-emerald-400"
            : isTotalCol
            ? `text-xs font-black ${highlightClass}`
            : "text-[11px] font-bold text-slate-200"
        }`}
      >
        {str}
      </span>
    );
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono font-semibold text-amber-300/90 whitespace-nowrap">
        {str}
      </span>
    );
  }

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
      <span className="inline-block px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-500/30 text-[10px] font-mono font-bold text-sky-300 whitespace-nowrap">
        {str}
      </span>
    );
  }

  if (str.endsWith("%")) {
    return (
      <span className="text-[11px] font-mono font-bold text-emerald-400 whitespace-nowrap">
        {str}
      </span>
    );
  }

  return <span className="text-[11px] font-medium text-slate-300">{str}</span>;
}

export function VaultModal({ isOpen, onClose }: VaultModalProps) {
  const [activeCategory, setActiveCategory] = useState<"ALL" | "B2B" | "B2C">("ALL");
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<string>("");

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadFullCustomerVaultZip((pct) => {
        setZipProgress(`${pct}%`);
      });
    } catch (err) {
      console.error(err);
      alert("Failed to package zip. Please try again.");
    } finally {
      setIsZipping(false);
      setZipProgress("");
    }
  };

  const handleDownload = (id: string) => {
    downloadTemplateWorkbook(id);
    setDownloadedIds((prev) => new Set(prev).add(id));
  };

  const handleDownloadAll = () => {
    downloadAllTemplates();
    setDownloadedIds(new Set(TEMPLATE_VAULT.map((t) => t.id)));
  };

  const toggleTablePreview = (id: string) => {
    setExpandedTableId((prev) => (prev === id ? null : id));
  };

  const filtered =
    activeCategory === "ALL"
      ? TEMPLATE_VAULT
      : TEMPLATE_VAULT.filter((t) => t.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col p-6 sm:p-7 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg sm:text-xl tracking-tight">
                The Turnkey Spreadsheet Vault (8 Color-Differentiated Workbooks)
              </h3>
              <p className="text-xs text-slate-400">
                Pre-formatted native Excel (.xlsx) workbooks with executive KPI dashboards &amp; styled tables
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Download All */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeCategory === "ALL"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              All 8 Workbooks
            </button>
            <button
              onClick={() => setActiveCategory("B2B")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeCategory === "B2B"
                  ? "bg-indigo-600 text-white font-bold shadow"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>B2B Corporate (4)</span>
            </button>
            <button
              onClick={() => setActiveCategory("B2C")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeCategory === "B2C"
                  ? "bg-teal-600 text-white font-bold shadow"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>B2C Prosumer (4)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isZipping ? `Packaging (${zipProgress})...` : "Download Vault (.zip)"}</span>
            </button>

            <button
              onClick={handleDownloadAll}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>All (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Grid of Workbooks */}
        <div className="overflow-y-auto space-y-3.5 pr-1 max-h-[55vh]">
          {filtered.map((template) => {
            const isDownloaded = downloadedIds.has(template.id);
            const isTableExpanded = expandedTableId === template.id;

            return (
              <div
                key={template.id}
                className="rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition overflow-hidden shadow-lg"
              >
                {/* Colored Top Accent Bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${template.theme.primaryGradient}`} />

                <div className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-white">{template.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            template.category === "B2B"
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                              : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                          }`}
                        >
                          {template.category} • {template.targetUser}
                        </span>
                        {template.badge && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${template.theme.badgeClass}`}
                          >
                            {template.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-0.5">
                        <span>File: {template.fileName}</span>
                        <span>•</span>
                        <span>Sheets: {template.sheets.map((s) => s.sheetName).join(", ")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleTablePreview(template.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition"
                      >
                        <Table className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isTableExpanded ? "Hide Table" : "Preview Table"}</span>
                        {isTableExpanded ? (
                          <ChevronUp className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDownload(template.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                          isDownloaded
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        }`}
                      >
                        {isDownloaded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Downloaded</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>.XLSX</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Colored Table Preview */}
                  {isTableExpanded && (
                    <div className="pt-2 animate-in fade-in duration-200 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${template.theme.primaryGradient}`} />
                        <span className="font-bold text-white">{template.tablePreview.title}</span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-950 shadow-inner">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            {/* Column Letter Row (A, B, C...) */}
                            <tr className="bg-slate-950 border-b border-slate-800 text-[9px] font-mono text-slate-500 font-bold">
                              <th className="w-7 px-1.5 py-0.5 text-center bg-slate-950 border-r border-slate-800/80">#</th>
                              {template.tablePreview.headers.map((_, hIdx) => (
                                <th
                                  key={hIdx}
                                  className="px-2.5 py-0.5 text-center uppercase tracking-widest border-r border-slate-800/80"
                                >
                                  {SPREADSHEET_COLS[hIdx] || String.fromCharCode(65 + hIdx)}
                                </th>
                              ))}
                            </tr>

                            {/* Column Naming Header */}
                            <tr className={`${template.theme.headerBg} border-b ${template.theme.headerBorder}`}>
                              <th className="w-7 px-1.5 py-2 text-center text-[9px] font-mono text-slate-400 border-r border-slate-700/50">
                                •
                              </th>
                              {template.tablePreview.headers.map((h, i) => (
                                <th
                                  key={i}
                                  className={`px-3 py-2 text-[10px] font-black ${template.theme.headerText} uppercase tracking-wider whitespace-nowrap border-r border-slate-700/50 ${
                                    i > 2 ? "text-right" : "text-left"
                                  }`}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-sans">
                            {template.tablePreview.rows.slice(0, 4).map((row, rIdx) => {
                              const isZebra = rIdx % 2 === 1;
                              return (
                                <tr
                                  key={rIdx}
                                  className={`transition hover:bg-slate-850/80 group ${
                                    isZebra ? template.theme.zebraBg : "bg-slate-950/80"
                                  }`}
                                >
                                  <td className="px-1.5 py-1.5 text-center font-mono text-[9px] text-slate-600 border-r border-slate-800/80 bg-slate-950 select-none">
                                    {rIdx + 1}
                                  </td>
                                  {row.map((cell, cIdx) => {
                                    const isStatus = template.tablePreview.statusColumnIndex === cIdx;
                                    const isEntityCol =
                                      (cIdx === 1 && template.tablePreview.headers[0].includes("Date")) ||
                                      (cIdx === 0 &&
                                        !template.tablePreview.headers[0].includes("Date") &&
                                        !template.tablePreview.headers[0].includes("Code"));
                                    const isNumeric = isNumericOrCurrency(cell);

                                    return (
                                      <td
                                        key={cIdx}
                                        className={`px-3 py-1.5 whitespace-nowrap border-r border-slate-800/80 ${
                                          isStatus
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
                                          isStatus,
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

                          {/* Total Summary Footer */}
                          {template.tablePreview.totalRow && (
                            <tfoot>
                              <tr className="bg-slate-900 border-t-2 border-slate-700 text-xs font-bold">
                                <td className="px-1.5 py-2 text-center font-mono text-[9px] text-emerald-400 bg-slate-950 border-r border-slate-800">
                                  Σ
                                </td>
                                {template.tablePreview.totalRow.map((totCell, tIdx) => {
                                  const isFirst = tIdx === 0;
                                  const isStatusCol = template.tablePreview.statusColumnIndex === tIdx;
                                  const isNumeric = isNumericOrCurrency(totCell);

                                  return (
                                    <td
                                      key={tIdx}
                                      className={`px-3 py-2 whitespace-nowrap border-r border-slate-800 ${
                                        isStatusCol
                                          ? "text-center"
                                          : isNumeric
                                          ? "text-right"
                                          : "text-left"
                                      }`}
                                    >
                                      {isFirst ? (
                                        <span className="text-[10px] font-black uppercase tracking-wider text-white">
                                          {String(totCell)}
                                        </span>
                                      ) : isStatusCol ? (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 uppercase">
                                          {String(totCell)}
                                        </span>
                                      ) : isNumeric ? (
                                        <span
                                          className={`text-xs font-black font-mono tabular-nums ${template.theme.highlightValue}`}
                                        >
                                          {String(totCell)}
                                        </span>
                                      ) : (
                                        <span className="text-[11px] font-bold text-slate-300">
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
                    </div>
                  )}

                  {/* Summary Bar Charts (compact) */}
                  {!isTableExpanded && template.chartPreview && (
                    <div className="pt-1.5">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {template.chartPreview.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] flex items-center justify-between gap-2"
                          >
                            <span className="text-slate-400 truncate">{item.label}</span>
                            <span className="font-mono font-bold text-white whitespace-nowrap">
                              {item.displayValue}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-xs text-slate-500">
          All workbooks are unlocked, macro-free, and 100% compatible with Microsoft Excel 2016-365, Google Sheets, and Apple Numbers.
        </div>
      </div>
    </div>
  );
}
