// app/app/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Trash2,
  Download,
  Filter,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
  X,
  FileText,
  Sparkles,
} from "lucide-react";

import {
  ExtractedDocument,
  DocType,
  PURCHASE_DOCUMENT_TYPES,
  reconcilesAmount,
  computeDuplicateHash,
  sanitizeNumber,
} from "@/lib/extraction-engine";
import { exportMasterWorkbook, exportAsCsv, safeExcelString, TaxReportingMode } from "@/lib/excel-export";
import { getSampleStressTestBatch } from "@/lib/test-samples";
import { reviewStatus, summarizeSpend } from "@/lib/ledger-review";
import { BATCH_LIMIT, FILE_LIMIT_BYTES, DOCUMENT_TYPES } from "@/lib/workspace-limits";

export default function WorkspacePage() {
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseVerified, setLicenseVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [docType, setDocType] = useState<"INVOICE" | "RECEIPT">("INVOICE");
  const [taxMode, setTaxMode] = useState<TaxReportingMode>("GST");
  const [filterReviewOnly, setFilterReviewOnly] = useState(false);
  const processing = useRef(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState("Ready. Drop files or load instant sample batch.");
  const [dragActive, setDragActive] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState<ExtractedDocument[]>([]);
  const [inspectDoc, setInspectDoc] = useState<ExtractedDocument | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedDocs = JSON.parse(localStorage.getItem("gridvault_ledger_v1") ?? "[]");
      if (Array.isArray(savedDocs)) setDocuments(savedDocs);
    } catch {
      // A previously saved workspace may be unavailable.
    }
    fetch("/api/verify-license", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => setLicenseVerified(result.valid === true))
      .catch(() => {});
  }, []);

  // Recalculates duplicates and persists to localStorage
  const updateLedger = (updated: ExtractedDocument[]) => {
    const seenHashes = new Set<string>();
    const deduped = updated.map((doc) => {
      const hash = computeDuplicateHash(
        doc.date,
        doc.vendorOrContact,
        doc.invoiceOrRefNo,
        doc.totalAmount
      ) + ":" + doc.currency + ":" + doc.docType;
      const hasIdentity = doc.date && doc.vendorOrContact && doc.invoiceOrRefNo && doc.invoiceOrRefNo !== "N/A";
      const isDup = Boolean(hasIdentity && seenHashes.has(hash));
      if (hasIdentity) seenHashes.add(hash);
      return { ...doc, duplicateHash: hash, isDuplicate: isDup };
    });

    setDocuments(deduped);
    try {
      localStorage.setItem("gridvault_ledger_v1", JSON.stringify(deduped));
    } catch {
      // The current ledger is still available for export.
    }
  };

  const handleVerifyLicense = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const keyHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(licenseKey.trim()));
      const fingerprint = Array.from(new Uint8Array(keyHash), (byte) => byte.toString(16).padStart(2, "0")).join("");
      const activationStorageKey = `gridvault_activation_${fingerprint}`;
      const instanceId = localStorage.getItem(activationStorageKey);
      const response = await fetch("/api/verify-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey,
          instanceId,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setProgressText(result.error);
        return;
      }
      setLicenseVerified(true);
      localStorage.setItem(activationStorageKey, result.instanceId);
      setLicenseKey("");
      setProgressText("Pro license active.");
    } catch {
      setProgressText("License activation could not be completed. Try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    if (processing.current || !files.length) return;
    if (!licenseVerified) {
      setProgressText("Activate your Pro license to upload documents, or try the sample batch.");
      return;
    }
    if (files.length > BATCH_LIMIT) {
      setProgressText(`Select up to ${BATCH_LIMIT} files per batch.`);
      return;
    }

    processing.current = true;
    setIsProcessing(true);
    const extracted: ExtractedDocument[] = [];
    const failures: string[] = [];
    try {
      for (const file of Array.from(files)) {
        setProgressText(`Processing ${file.name}…`);
        try {
          if (!DOCUMENT_TYPES.includes(file.type) || !file.size || file.size > FILE_LIMIT_BYTES) {
            throw new Error("Use PDF, JPG, PNG, or WEBP up to 3 MB.");
          }
          const form = new FormData();
          form.set("document", file);
          form.set("docType", docType);
          const response = await fetch("/api/extract", { method: "POST", body: form });
          if (response.status === 401) setLicenseVerified(false);
          const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          extracted.push(result.doc);
        } catch (error) {
          failures.push(`${file.name}: ${error instanceof Error ? error.message : "Extraction failed."}`);
        }
      }
      if (extracted.length) updateLedger([...documents.filter((doc) => !doc.id.startsWith("doc-sample-")), ...extracted]);
      setProgressText([`Extracted ${extracted.length} of ${files.length} documents.`, ...failures].join(" "));
    } finally {
      processing.current = false;
      setIsProcessing(false);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Inline cell editing with instant math verification
  const handleCellChange = (
    id: string,
    field: "subtotal" | "cgst" | "sgst" | "igst" | "vatOrSalesTax" | "roundOff" | "totalAmount" |
      "date" | "vendorOrContact" | "invoiceOrRefNo" | "docType",
    value: string
  ) => {
    if (processing.current) return;
    const updated = documents.map((doc) => {
      if (doc.id !== id) return doc;
      if (field === "docType") return { ...doc, docType: value as DocType };
      if (field === "date" || field === "vendorOrContact" || field === "invoiceOrRefNo") {
        return { ...doc, [field]: value };
      }
      const copy = { ...doc, [field]: sanitizeNumber(value) };
      return { ...copy, mathVerified: reconcilesAmount(copy) };
    });

    updateLedger(updated);
  };

  const handleDeleteRow = (id: string) => {
    if (processing.current) return;
    updateLedger(documents.filter((d) => d.id !== id));
  };

  const handleLoadStressTest = () => {
    if (processing.current) return;
    if (documents.some((doc) => !doc.id.startsWith("doc-sample-")) &&
        !confirm("Replace the current ledger with sample data? Export your work first if you need to keep it.")) return;
    updateLedger(getSampleStressTestBatch());
    setProgressText("Loaded 5 stress-test documents (1 Verified B2B, 1 Math Check, 1 Duplicate, 1 Travel, 1 Lead).");
  };

  const handleClearWorkspace = () => {
    if (processing.current) return;
    if (confirm("Are you sure you want to clear all extracted rows from this workspace?")) {
      updateLedger([]);
      setProgressText("Workspace cleared.");
    }
  };

  // Copy Tab-Separated Values for 1-click paste into Google Sheets
  const handleCopyGoogleSheets = () => {
    if (documents.length === 0) return;
    const header = [
      "Doc_ID",
      "Date",
      "Status",
      "Type",
      "Vendor_Or_Contact",
      "Invoice_Ref",
      "Category",
      "Currency",
      "Subtotal",
      taxMode === "GST" ? "CGST\tSGST\tIGST\tTotal_Tax" : "Tax",
      "Round_Off",
      "Grand_Total",
      "Confidence",
    ].join("\t");

    const tsvText = (value: string) => safeExcelString(value.replace(/[\t\r\n]/g, " "));
    const rows = documents.map((doc) => {
      const totalTax = doc.cgst + doc.sgst + doc.igst + doc.vatOrSalesTax;
      const tax = taxMode === "GST" ? [doc.cgst, doc.sgst, doc.igst, totalTax] : [totalTax];
      return [
        doc.id, doc.date, reviewStatus(doc), doc.docType, doc.vendorOrContact, doc.invoiceOrRefNo,
        doc.category, doc.currency, doc.subtotal, ...tax, doc.roundOff ?? 0, doc.totalAmount,
        `${Math.round(doc.confidence * 100)}%`,
      ].map((value) => typeof value === "string" ? tsvText(value) : value).join("\t");
    });

    navigator.clipboard.writeText([header, ...rows].join("\n"))
      .then(() => setProgressText("Copied ledger. You can paste it into Google Sheets."))
      .catch(() => setProgressText("Clipboard unavailable. Use Excel or CSV export."));
  };

  const totals = summarizeSpend(documents);
  const flaggedDocs = documents.filter((doc) => reviewStatus(doc) !== "VERIFIED");
  const reviewCount = flaggedDocs.length;
  const visibleDocs = filterReviewOnly ? flaggedDocs : documents;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. TOP COMMAND BAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">GridVault Pro</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  WORKSPACE
                </span>
              </div>
            </Link>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{licenseVerified ? "Pro license active" : "Sample workspace"}</span>
            </div>
          </div>

          {/* Controls: Mode Selectors & Modals */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as "INVOICE" | "RECEIPT")}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-200 outline-none focus:border-emerald-500 transition"
            >
              <option value="INVOICE">Preset: Vendor Invoices</option>
              <option value="RECEIPT">Preset: Itemized Receipts</option>
            </select>

            <select
              value={taxMode}
              onChange={(e) => setTaxMode(e.target.value as TaxReportingMode)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-200 outline-none focus:border-emerald-500 transition"
            >
              <option value="GST">Tax Mode: GST Split (CGST/SGST/IGST)</option>
              <option value="VAT">Tax Mode: Global VAT / Sales Tax</option>
              <option value="SIMPLE">Tax Mode: Universal Simple</option>
            </select>

            {licenseVerified ? (
              <a href="/api/vault" className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 text-xs font-semibold">
                Download workbook vault
              </a>
            ) : (
              <Link href="/templates" className="px-3 py-1.5 text-emerald-300 text-xs font-semibold">
                Preview workbook vault
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dropzone & Settings (4 cols) */}
        <section className="lg:col-span-4 space-y-5">
          {/* Batch Dropzone Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Batch Document Ingestion
              </h2>
              <span className="text-[11px] text-slate-500">Up to {BATCH_LIMIT} files</span>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? "border-emerald-400 bg-emerald-500/10"
                  : "border-slate-700 hover:border-emerald-500/50 bg-slate-950/60"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-md">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {isProcessing ? "Extracting Batch..." : "Drag & drop files or click to upload"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  PDF, JPG, PNG, WEBP · 3 MB per file · Sent to Gemini for extraction
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={DOCUMENT_TYPES.join(",")}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  void processFiles(files);
                }}
                className="hidden"
                disabled={isProcessing}
              />
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleLoadStressTest}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Load Stress-Test Batch (5 Docs)</span>
              </button>

            </div>

            {/* Progress feed */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isProcessing ? "bg-emerald-400 animate-ping" : "bg-slate-600"
                }`}
              />
              <span role="status" className="break-words">{progressText}</span>
            </div>
          </div>

          {/* Lemon Squeezy License Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              License &amp; Device Verification
            </span>
            <div className="space-y-1.5">
              <label htmlFor="license-key" className="text-slate-400">Purchase license key</label>
              <div className="flex gap-2">
                <input
                  id="license-key"
                  type="password"
                  autoComplete="off"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-white"
                />
                <button
                  onClick={handleVerifyLicense}
                  disabled={isVerifying || !licenseKey.trim()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs whitespace-nowrap"
                >
                  {isVerifying ? "Verifying…" : "Activate"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{licenseVerified ? "Pro license active" : "Sample mode"}</span>
            </div>
          </div>
        </section>

        {/* Right Column: Ledger, Metrics & Confidence Grid (8 cols) */}
        <section className="lg:col-span-8 space-y-4">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                Reconciled spend
              </span>
              {totals.length ? totals.map(([currency, total]) => (
                <p key={currency} className="font-mono text-white mt-1">
                  {currency} {total.spend.toFixed(2)}
                </p>
              )) : <p className="mt-1 text-slate-400">No reconciled invoices or receipts</p>}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                Extracted tax
              </span>
              {totals.length ? totals.map(([currency, total]) => (
                <p key={currency} className="font-mono text-emerald-400 mt-1">
                  {currency} {total.tax.toFixed(2)}
                </p>
              )) : <p className="mt-1 text-slate-400">No reconciled invoices or receipts</p>}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                  Flagged for review
                </span>
                <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {reviewCount}
                </p>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Check flags and excluded document types
                </span>
              </div>
              <button
                onClick={() => setFilterReviewOnly(!filterReviewOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  filterReviewOnly
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                {filterReviewOnly ? "Showing Flagged" : "Filter Flagged"}
              </button>
            </div>
          </div>

          {/* Interactive Confidence Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Table Header Controls */}
            <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-white">
                  Interactive Confidence Ledger
                </h3>
                <p className="text-xs text-slate-400">
                  Edit ledger values to rerun the math check. Compare flagged rows with the original documents.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyGoogleSheets}
                  disabled={documents.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
                  title="Copy TSV data to clipboard for 1-click paste into Google Sheets"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy TSV</span>
                </button>

                <button
                  onClick={() => exportAsCsv(documents, taxMode)}
                  disabled={documents.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition disabled:opacity-40"
                >
                  Export CSV
                </button>

                <button
                  onClick={() => exportMasterWorkbook(documents, taxMode)}
                  disabled={documents.length === 0}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition disabled:opacity-40"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export 3-Tab .XLSX</span>
                </button>

                <button
                  onClick={handleClearWorkspace}
                  disabled={documents.length === 0}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                  title="Clear Workspace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  {/* Column Naming Headers */}
                  <tr className="bg-slate-900 text-slate-200 border-b border-slate-700/80 font-black text-[11px] uppercase tracking-wider">
                    <th className="w-8 px-2 py-2.5 text-center font-mono text-slate-500 border-r border-slate-700/60">•</th>
                    <th className="p-3 border-r border-slate-700/60">Status / Type</th>
                    <th className="p-3 border-r border-slate-700/60">Date</th>
                    <th className="p-3 border-r border-slate-700/60">Vendor / Contact</th>
                    <th className="p-3 border-r border-slate-700/60">Invoice / Ref</th>
                    <th className="p-3 text-right border-r border-slate-700/60">Subtotal</th>
                    {taxMode === "GST" ? (
                      <>
                        <th className="p-3 text-right border-r border-slate-700/60">CGST</th>
                        <th className="p-3 text-right border-r border-slate-700/60">SGST</th>
                      </>
                    ) : (
                      <th className="p-3 text-right border-r border-slate-700/60">Tax</th>
                    )}
                    <th className="p-3 text-right border-r border-slate-700/60">Round-off</th>
                    <th className="p-3 text-right border-r border-slate-700/60">Grand Total</th>
                    <th className="p-3 text-center border-r border-slate-700/60">Inspect</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-sans">
                  {visibleDocs.map((doc, rIdx) => {
                    const status = reviewStatus(doc);
                    const needsReview = status !== "VERIFIED";
                    const isDup = doc.isDuplicate;

                    const rowBg = isDup
                      ? "bg-rose-950/20 hover:bg-rose-950/30"
                      : needsReview
                      ? "bg-amber-950/20 hover:bg-amber-950/30"
                      : "hover:bg-slate-850/60";

                    return (
                      <tr key={doc.id} className={`${rowBg} transition group`}>
                        {/* Row Index */}
                        <td className="px-2 py-2 text-center font-mono text-[10px] text-slate-600 border-r border-slate-800 bg-slate-950 select-none">
                          {rIdx + 1}
                        </td>

                        {/* Status badge */}
                        <td className="p-2.5 whitespace-nowrap border-r border-slate-800/80">
                          {isDup ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              DUPLICATE
                            </span>
                          ) : needsReview ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              {status.replaceAll("_", " ")}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              {Math.round(doc.confidence * 100)}% OK
                            </span>
                          )}
                          <select
                            aria-label={`Document type for ${doc.invoiceOrRefNo}`}
                            className="mt-1 block max-w-36 rounded bg-slate-900 px-1 py-1 text-[11px] text-slate-300"
                            value={doc.docType}
                            disabled={isProcessing}
                            onChange={(event) => handleCellChange(doc.id, "docType", event.target.value)}
                          >
                            {!PURCHASE_DOCUMENT_TYPES.some((type) => type === doc.docType) && (
                              <option value={doc.docType}>{doc.docType.replaceAll("_", " ")}</option>
                            )}
                            {PURCHASE_DOCUMENT_TYPES.map((type) => (
                              <option key={type} value={type}>{type.replaceAll("_", " ")}</option>
                            ))}
                          </select>
                        </td>

                        {/* Date */}
                        <td className="p-2 border-r border-slate-800/80">
                          <input
                            type="text"
                            value={doc.date}
                            onChange={(e) => handleCellChange(doc.id, "date", e.target.value)}
                            className="bg-transparent border border-transparent focus:border-slate-600 rounded px-1.5 py-1 w-24 font-mono text-amber-300 font-semibold text-xs outline-none"
                          />
                        </td>

                        {/* Vendor / Contact Naming */}
                        <td className="p-2 border-r border-slate-800/80">
                          <input
                            type="text"
                            value={doc.vendorOrContact}
                            onChange={(e) =>
                              handleCellChange(doc.id, "vendorOrContact", e.target.value)
                            }
                            className="bg-transparent border border-transparent focus:border-slate-600 rounded px-1.5 py-1 w-44 text-white font-bold text-sm outline-none group-hover:text-emerald-300 transition truncate"
                          />
                        </td>

                        {/* Invoice Ref */}
                        <td className="p-2 border-r border-slate-800/80">
                          <input
                            type="text"
                            value={doc.invoiceOrRefNo}
                            onChange={(e) =>
                              handleCellChange(doc.id, "invoiceOrRefNo", e.target.value)
                            }
                            className="bg-transparent border border-transparent focus:border-slate-600 rounded px-1.5 py-1 w-28 font-mono text-sky-300 font-semibold text-xs outline-none"
                          />
                        </td>

                        {/* Subtotal */}
                        <td className="p-2 text-right border-r border-slate-800/80">
                          <input
                            type="number"
                            step="0.01"
                            value={doc.subtotal}
                            onChange={(e) =>
                              handleCellChange(doc.id, "subtotal", e.target.value)
                            }
                            className="bg-transparent border border-transparent focus:border-slate-600 rounded px-1.5 py-1 w-24 text-right font-mono font-bold tabular-nums text-slate-200 outline-none text-xs"
                          />
                        </td>

                        {/* Tax Columns */}
                        {taxMode === "GST" ? (
                          <>
                            <td className="p-2 text-right border-r border-slate-800/80">
                              <input
                                type="number"
                                step="0.01"
                                value={doc.cgst}
                                onChange={(e) =>
                                  handleCellChange(doc.id, "cgst", e.target.value)
                                }
                                className="bg-transparent border border-transparent focus:border-slate-600 rounded px-1.5 py-1 w-20 text-right font-mono tabular-nums text-slate-300 outline-none text-xs"
                              />
                            </td>
                            <td className="p-2 text-right border-r border-slate-800/80">
                              <input
                                type="number"
                                step="0.01"
                                value={doc.sgst}
                                onChange={(e) =>
                                  handleCellChange(doc.id, "sgst", e.target.value)
                                }
                                className="bg-transparent border border-transparent focus:border-slate-600 rounded px-1.5 py-1 w-20 text-right font-mono tabular-nums text-slate-300 outline-none text-xs"
                              />
                            </td>
                          </>
                        ) : (
                          <td className="p-2 text-right border-r border-slate-800/80">
                            <input
                              type="number"
                              step="0.01"
                              value={doc.vatOrSalesTax}
                              onChange={(e) =>
                                handleCellChange(doc.id, "vatOrSalesTax", e.target.value)
                              }
                              className="bg-transparent border border-transparent focus:border-slate-600 rounded px-1.5 py-1 w-20 text-right font-mono tabular-nums text-slate-300 outline-none text-xs"
                            />
                          </td>
                        )}

                        <td className="p-2 text-right border-r border-slate-800/80">
                          <input
                            aria-label={`Round-off for ${doc.invoiceOrRefNo}`}
                            type="number"
                            step="0.01"
                            defaultValue={doc.roundOff ?? 0}
                            disabled={isProcessing}
                            onBlur={(event) => {
                              if (event.target.validity.badInput) {
                                event.target.value = String(doc.roundOff ?? 0);
                                return;
                              }
                              const roundOff = sanitizeNumber(event.target.value);
                              event.target.value = String(roundOff);
                              if (roundOff !== (doc.roundOff ?? 0)) handleCellChange(doc.id, "roundOff", event.target.value);
                            }}
                            className="w-20 rounded bg-transparent px-1.5 py-1 text-right font-mono text-slate-300"
                          />
                        </td>

                        {/* Grand Total */}
                        <td className="p-2 text-right border-r border-slate-800/80">
                          <input
                            type="number"
                            step="0.01"
                            value={doc.totalAmount}
                            onChange={(e) =>
                              handleCellChange(doc.id, "totalAmount", e.target.value)
                            }
                            className={`bg-transparent border border-transparent focus:border-slate-600 rounded px-1.5 py-1 w-24 text-right font-mono font-black text-sm tabular-nums outline-none ${
                              needsReview ? "text-amber-400" : "text-emerald-400"
                            }`}
                          />
                        </td>

                        {/* Inspect details */}
                        <td className="p-2 text-center border-r border-slate-800/80">
                          <button
                            onClick={() => setInspectDoc(doc)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                            title="Inspect Line Items & Metadata"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>

                        {/* Delete Row */}
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleDeleteRow(doc.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                            title="Delete Row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {visibleDocs.length === 0 && (
                    <tr>
                      <td colSpan={taxMode === "GST" ? 11 : 10} className="p-10 text-center text-slate-500">
                        No documents in workspace. Drop files on the left or click
                        &ldquo;Load Stress-Test Batch&rdquo; to test.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* 3. SPLIT-SCREEN INSPECTOR MODAL */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-base">
                    Document Audit Inspector: {inspectDoc.fileName}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {inspectDoc.id} • Type: {inspectDoc.docType}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              {/* Header metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Vendor / Entity</span>
                  <p className="font-bold text-white mt-0.5">{inspectDoc.vendorOrContact}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Invoice / Ref</span>
                  <p className="font-mono font-bold text-white mt-0.5">{inspectDoc.invoiceOrRefNo}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Tax ID / GSTIN</span>
                  <p className="font-mono text-slate-200 mt-0.5">{inspectDoc.taxId || "N/A"}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Confidence</span>
                  <p className="font-bold text-emerald-400 mt-0.5">
                    {Math.round(inspectDoc.confidence * 100)}%
                  </p>
                </div>
              </div>

              {/* Line items detail */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">
                  Granular Line Items ({inspectDoc.lineItems.length})
                </span>
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
                  {inspectDoc.lineItems.length > 0 ? (
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Description</th>
                          <th className="p-2.5">SKU</th>
                          <th className="p-2.5 text-right">Qty</th>
                          <th className="p-2.5 text-right">Unit Rate</th>
                          <th className="p-2.5 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {inspectDoc.lineItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 text-white">{item.description}</td>
                            <td className="p-2.5 font-mono text-slate-400">{item.sku || "—"}</td>
                            <td className="p-2.5 text-right font-mono text-slate-300">{item.quantity}</td>
                            <td className="p-2.5 text-right font-mono text-slate-300">{item.unitPrice.toFixed(2)}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-white">{item.lineTotal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-slate-500">
                      No separate line-item rows extracted. Header transaction total:{" "}
                      <span className="font-bold text-white">
                        {inspectDoc.currency} {inspectDoc.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes / Duplicate Hash */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 font-semibold">Notes / Raw Details:</span>
                <p className="text-slate-300">{inspectDoc.notesOrEmail || "None recorded."}</p>
                <div className="pt-1 text-[11px] text-slate-500 font-mono">
                  Hash: {inspectDoc.duplicateHash}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
