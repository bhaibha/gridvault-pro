// app/app/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  KeyRound,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Trash2,
  Download,
  Filter,
  ExternalLink,
  ShieldCheck,
  Building2,
  RefreshCw,
  Eye,
  X,
  FileText,
  Sparkles,
  Zap,
  Layers,
  HelpCircle,
  Archive,
} from "lucide-react";

import {
  ExtractedDocument,
  extractDocumentWithAI,
  computeDuplicateHash,
  sanitizeNumber,
  DocType,
} from "@/lib/extraction-engine";
import {
  saveEncryptedApiKey,
  loadDecryptedApiKey,
  getSavedProvider,
} from "@/lib/crypto-vault";
import { exportMasterWorkbook, exportAsCsv, TaxReportingMode } from "@/lib/excel-export";
import { getSampleStressTestBatch } from "@/lib/test-samples";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { VaultModal } from "@/components/VaultModal";
import { CustomTemplateStudio } from "@/components/CustomTemplateStudio";
import { GoogleSheetsModal } from "@/components/GoogleSheetsModal";
import { WelcomeModal } from "@/components/WelcomeModal";
import { downloadFullCustomerVaultZip } from "@/lib/bundle-packager";
import { CustomTemplate } from "@/lib/custom-template-store";
import {
  pushRowsToGoogleSheet,
  getSavedGoogleSheetWebhook,
} from "@/lib/google-sheets-sync";

export default function WorkspacePage() {
  // License & Key state
  const [licenseKey, setLicenseKey] = useState("GVPRO-FOUNDER-2026-LIFETIME");
  const [licenseVerified, setLicenseVerified] = useState(true);
  const [customerName, setCustomerName] = useState("Founder / Lifetime Master Tier");
  const [provider, setProvider] = useState<"gemini" | "openai">("gemini");
  const [hasEncryptedKey, setHasEncryptedKey] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);
  const [isGSheetsModalOpen, setIsGSheetsModalOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isDownloadingVault, setIsDownloadingVault] = useState(false);
  const [activeCustomTemplate, setActiveCustomTemplate] = useState<CustomTemplate | null>(null);
  const [gsheetWebhook, setGsheetWebhook] = useState<string | null>(null);
  const [isSyncingGSheet, setIsSyncingGSheet] = useState(false);

  // Workspace configuration
  const [docType, setDocType] = useState<DocType>("INVOICE");
  const [taxMode, setTaxMode] = useState<TaxReportingMode>("GST");
  const [customPrompt, setCustomPrompt] = useState("");
  const [filterReviewOnly, setFilterReviewOnly] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState("Ready. Drop files or load instant sample batch.");
  const [dragActive, setDragActive] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState<ExtractedDocument[]>([]);
  const [inspectDoc, setInspectDoc] = useState<ExtractedDocument | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted documents, tour state & encrypted key on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDocs = localStorage.getItem("gridvault_ledger_v1");
      if (savedDocs) {
        try {
          setDocuments(JSON.parse(savedDocs));
        } catch {
          // Ignore parse errors
        }
      }

      // Check if first-time user needs welcome onboarding tour
      const hasSeenTour = localStorage.getItem("gridvault_tour_completed");
      if (!hasSeenTour) {
        setIsWelcomeOpen(true);
      }

      setProvider(getSavedProvider());

      loadDecryptedApiKey(licenseKey).then((key) => {
        if (key) {
          setHasEncryptedKey(true);
        }
      });

      const savedWebhook = getSavedGoogleSheetWebhook();
      if (savedWebhook) {
        setGsheetWebhook(savedWebhook);
      }
    }
  }, [licenseKey]);

  // Customer Fulfillment Vault (.zip) Handler
  const handleDownloadCustomerVault = async () => {
    try {
      setIsDownloadingVault(true);
      setProgressText("Packaging all 8 Master Spreadsheets, Google Apps Script & Commercial License...");
      await downloadFullCustomerVaultZip();
      setProgressText("GridVault_Pro_Fulfillment_Vault.zip downloaded successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Error generating fulfillment zip: " + (err?.message || "Unknown error"));
    } finally {
      setIsDownloadingVault(false);
    }
  };

  // Google Sheets Direct Live Push Handler
  const handlePushToGoogleSheet = async () => {
    if (!gsheetWebhook) {
      setIsGSheetsModalOpen(true);
      return;
    }
    if (documents.length === 0) {
      alert("No documents in workspace to push.");
      return;
    }

    setIsSyncingGSheet(true);
    setProgressText(`Pushing ${documents.length} verified rows to Google Sheet...`);

    const result = await pushRowsToGoogleSheet(gsheetWebhook, documents);
    setIsSyncingGSheet(false);

    if (result.success) {
      setProgressText(`Successfully pushed ${documents.length} row(s) directly to your live Google Sheet!`);
      alert(`Success! ${documents.length} row(s) were pushed directly to your Google Sheet in real time.`);
    } else {
      setProgressText(`Google Sheets sync error: ${result.error}`);
      alert(`Sync failed: ${result.error}. Check your Apps Script deployment URL.`);
    }
  };

  // Custom Template Schema Target Selection
  const handleSelectCustomTemplate = (tmpl: CustomTemplate) => {
    setActiveCustomTemplate(tmpl);
    setDocType("CUSTOM");
    const colsStr = tmpl.columns.map((c) => `${c.name} (${c.dataType})`).join(", ");
    setCustomPrompt(
      `Extract structured data matching these exact custom template columns: ${colsStr}. Template: ${tmpl.name}. Currency: ${tmpl.currency}.`
    );
    setProgressText(`Active extraction preset set to custom template: "${tmpl.name}".`);
  };

  // Recalculates duplicates and persists to localStorage
  const updateLedger = (updated: ExtractedDocument[]) => {
    const seenHashes = new Set<string>();
    const deduped = updated.map((doc) => {
      const hash = computeDuplicateHash(
        doc.date,
        doc.vendorOrContact,
        doc.invoiceOrRefNo,
        doc.totalAmount
      );
      const isDup = seenHashes.has(hash);
      seenHashes.add(hash);
      return { ...doc, duplicateHash: hash, isDuplicate: isDup };
    });

    setDocuments(deduped);
    if (typeof window !== "undefined") {
      localStorage.setItem("gridvault_ledger_v1", JSON.stringify(deduped));
    }
  };

  const handleVerifyLicense = async (keyToVerify: string) => {
    try {
      const res = await fetch("/api/verify-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: keyToVerify }),
      });
      const data = await res.json();
      if (data.valid) {
        setLicenseVerified(true);
        setCustomerName(data.customerName || "Pro Customer");
        setProgressText("Lemon Squeezy License active. Unlimited batches unlocked.");
      } else {
        setLicenseVerified(false);
        setProgressText(`License invalid: ${data.error}`);
      }
    } catch {
      setProgressText("License server unreachable. Operating in offline grace mode.");
    }
  };

  // Process uploaded files with batch throttling (concurrency of 3)
  const processFiles = async (files: FileList | File[]) => {
    const activeKey = await loadDecryptedApiKey(licenseKey);
    if (!activeKey) {
      setIsKeyModalOpen(true);
      setProgressText("Please save your OpenAI or Gemini API key in the Vault first.");
      return;
    }

    setIsProcessing(true);
    const fileList = Array.from(files);
    const newDocs: ExtractedDocument[] = [];
    const concurrency = 3;

    for (let i = 0; i < fileList.length; i += concurrency) {
      const chunk = fileList.slice(i, i + concurrency);
      setProgressText(
        `Extracting files ${i + 1} to ${Math.min(i + concurrency, fileList.length)} of ${fileList.length}...`
      );

      const results = await Promise.allSettled(
        chunk.map(async (file) => {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const resStr = String(reader.result || "");
              resolve(resStr.split(",")[1] || "");
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          return extractDocumentWithAI(
            base64,
            file.type || "image/jpeg",
            file.name,
            activeKey,
            provider,
            docType,
            customPrompt
          );
        })
      );

      results.forEach((res) => {
        if (res.status === "fulfilled") {
          newDocs.push(res.value);
        } else {
          console.error("Extraction error:", res.reason);
        }
      });
    }

    updateLedger([...documents, ...newDocs]);
    setIsProcessing(false);
    setProgressText(`Extracted ${newDocs.length} document(s) successfully.`);
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
    field: keyof ExtractedDocument,
    value: string | number
  ) => {
    const updated = documents.map((doc) => {
      if (doc.id !== id) return doc;
      const copy: Record<string, unknown> = { ...doc };

      if (
        [
          "subtotal",
          "cgst",
          "sgst",
          "igst",
          "vatOrSalesTax",
          "totalAmount",
        ].includes(field)
      ) {
        copy[field] = sanitizeNumber(value);
        const sub = copy.subtotal as number;
        const tax =
          (copy.cgst as number) +
          (copy.sgst as number) +
          (copy.igst as number) +
          (copy.vatOrSalesTax as number);
        const total = copy.totalAmount as number;
        const expected = Number((sub + tax).toFixed(2));

        const isReconciled = Math.abs(expected - total) <= 0.12;
        copy.mathVerified = isReconciled;
        if (isReconciled) {
          copy.confidence = 0.99;
        }
      } else {
        copy[field] = value;
      }

      return copy as unknown as ExtractedDocument;
    });

    updateLedger(updated);
  };

  const handleDeleteRow = (id: string) => {
    updateLedger(documents.filter((d) => d.id !== id));
  };

  const handleLoadStressTest = () => {
    const samples = getSampleStressTestBatch();
    updateLedger([...documents, ...samples]);
    setProgressText("Loaded 5 stress-test documents (1 Verified B2B, 1 Math Check, 1 Duplicate, 1 Travel, 1 Lead).");
  };

  const handleClearWorkspace = () => {
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
      "Vendor_Or_Contact",
      "Invoice_Ref",
      "Category",
      "Currency",
      "Subtotal",
      taxMode === "GST" ? "CGST\tSGST\tIGST" : "Tax",
      "Grand_Total",
      "Confidence",
    ].join("\t");

    const rows = documents.map((d) => {
      const taxCols =
        taxMode === "GST"
          ? `${d.cgst}\t${d.sgst}\t${d.igst}`
          : `${(d.cgst + d.sgst + d.igst + d.vatOrSalesTax).toFixed(2)}`;
      const status = d.isDuplicate
        ? "DUPLICATE"
        : !d.mathVerified
        ? "MATH_CHECK"
        : "VERIFIED";
      return `${d.id.slice(0, 8)}\t${d.date}\t${status}\t${d.vendorOrContact}\t${d.invoiceOrRefNo}\t${d.category}\t${d.currency}\t${d.subtotal}\t${taxCols}\t${d.totalAmount}\t${Math.round(d.confidence * 100)}%`;
    });

    const tsv = [header, ...rows].join("\n");
    navigator.clipboard.writeText(tsv);
    alert("Formatted ledger copied to clipboard! Paste directly into Google Sheets (Cmd/Ctrl + V).");
  };

  // Metric aggregates
  const activeDocs = documents.filter((d) => !d.isDuplicate);
  const netSpend = activeDocs.reduce((sum, d) => sum + d.totalAmount, 0);
  const netTax = activeDocs.reduce(
    (sum, d) => sum + d.cgst + d.sgst + d.igst + d.vatOrSalesTax,
    0
  );
  const reviewCount = documents.filter(
    (d) => !d.mathVerified || d.confidence < 0.9 || d.isDuplicate
  ).length;

  const visibleDocs = filterReviewOnly
    ? documents.filter((d) => !d.mathVerified || d.confidence < 0.9 || d.isDuplicate)
    : documents;

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
              <span>{customerName}</span>
            </div>
          </div>

          {/* Controls: Mode Selectors & Modals */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocType)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-200 outline-none focus:border-emerald-500 transition"
            >
              <option value="INVOICE">Preset: Vendor Invoices</option>
              <option value="RECEIPT">Preset: Itemized Receipts</option>
              <option value="BANK_STATEMENT">Preset: Bank Statements</option>
              <option value="BUSINESS_CARD">Preset: Business Cards / Leads</option>
              <option value="CUSTOM">Preset: Custom Schema</option>
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

            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                hasEncryptedKey
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{hasEncryptedKey ? "AI Vault (AES-256)" : "Set API Key"}</span>
            </button>

            <button
              onClick={() => setIsCustomStudioOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Custom Studio</span>
              {activeCustomTemplate && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              onClick={() => setIsGSheetsModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                gsheetWebhook
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-850 hover:bg-slate-800 text-slate-200 border-slate-700"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Sheets</span>
              {gsheetWebhook ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <span className="text-[10px] text-slate-500">Connect</span>
              )}
            </button>

            <button
              onClick={() => setIsVaultOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>8 Master Spreadsheets</span>
            </button>

            <button
              onClick={handleDownloadCustomerVault}
              disabled={isDownloadingVault}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              title="Download complete fulfillment package with all 8 master spreadsheets and scripts"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isDownloadingVault ? "Zipping..." : "Download Vault (.zip)"}</span>
            </button>

            <button
              onClick={() => setIsWelcomeOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Open Getting Started Onboarding Tour"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tour</span>
            </button>
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
              <span className="text-[11px] text-slate-500">Max 500 files</span>
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
                  PDFs, JPGs, PNGs, WEBP receipts &amp; invoices
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files && processFiles(e.target.files)}
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

              {docType === "CUSTOM" && (
                <div className="space-y-1 pt-2">
                  <label className="text-[11px] text-slate-400 font-medium">
                    Custom Prompt / Columns
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Extract PO number, shipping tracking ID, carrier..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Progress feed */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isProcessing ? "bg-emerald-400 animate-ping" : "bg-slate-600"
                }`}
              />
              <span className="truncate">{progressText}</span>
            </div>
          </div>

          {/* Lemon Squeezy License Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              License &amp; Device Verification
            </span>
            <div className="space-y-1.5">
              <label className="text-slate-400">License Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-white"
                />
                <button
                  onClick={() => handleVerifyLicense(licenseKey)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs whitespace-nowrap"
                >
                  Verify
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3 Device Commercial License Active</span>
            </div>
          </div>
        </section>

        {/* Right Column: Ledger, Metrics & Confidence Grid (8 cols) */}
        <section className="lg:col-span-8 space-y-4">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                Verified Spend (Excl. Dups)
              </span>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {netSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {activeDocs.length} valid transaction(s)
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                Claimable Input Tax
              </span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {netTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                GST / VAT claimable total
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                  Flagged for Audit
                </span>
                <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  {reviewCount}
                </p>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Math check or duplicates
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
                  Click any cell to edit. Math auto-reconciles in real time.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handlePushToGoogleSheet}
                  disabled={documents.length === 0 || isSyncingGSheet}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition disabled:opacity-40"
                  title="Directly append verified rows to your live Google Sheet"
                >
                  <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                  <span>{isSyncingGSheet ? "Syncing..." : "Push to Google Sheet"}</span>
                </button>

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
                  {/* Column Letter Indicator */}
                  <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-mono text-slate-500 font-bold">
                    <th className="w-8 px-2 py-1 text-center border-r border-slate-800">#</th>
                    <th className="px-3 py-1 text-center border-r border-slate-800">A</th>
                    <th className="px-3 py-1 text-center border-r border-slate-800">B</th>
                    <th className="px-3 py-1 text-center border-r border-slate-800">C</th>
                    <th className="px-3 py-1 text-center border-r border-slate-800">D</th>
                    <th className="px-3 py-1 text-center border-r border-slate-800">E</th>
                    {taxMode === "GST" ? (
                      <>
                        <th className="px-3 py-1 text-center border-r border-slate-800">F</th>
                        <th className="px-3 py-1 text-center border-r border-slate-800">G</th>
                        <th className="px-3 py-1 text-center border-r border-slate-800">H</th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 py-1 text-center border-r border-slate-800">F</th>
                        <th className="px-3 py-1 text-center border-r border-slate-800">G</th>
                      </>
                    )}
                    <th className="px-3 py-1 text-center border-r border-slate-800">•</th>
                    <th className="px-3 py-1 text-center">•</th>
                  </tr>

                  {/* Column Naming Headers */}
                  <tr className="bg-slate-900 text-slate-200 border-b border-slate-700/80 font-black text-[11px] uppercase tracking-wider">
                    <th className="w-8 px-2 py-2.5 text-center font-mono text-slate-500 border-r border-slate-700/60">•</th>
                    <th className="p-3 border-r border-slate-700/60">Status</th>
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
                    <th className="p-3 text-right border-r border-slate-700/60">Grand Total</th>
                    <th className="p-3 text-center border-r border-slate-700/60">Inspect</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-sans">
                  {visibleDocs.map((doc, rIdx) => {
                    const isMathErr = !doc.mathVerified && doc.docType !== "BUSINESS_CARD";
                    const isDup = doc.isDuplicate;

                    const rowBg = isDup
                      ? "bg-rose-950/20 hover:bg-rose-950/30"
                      : isMathErr
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
                          ) : isMathErr ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              MATH CHECK
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              {Math.round(doc.confidence * 100)}% OK
                            </span>
                          )}
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
                              isMathErr ? "text-amber-400" : "text-emerald-400"
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
                      <td colSpan={10} className="p-10 text-center text-slate-500">
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

      {/* 4. MODALS */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        licenseKey={licenseKey}
        currentProvider={provider}
        onProviderChange={setProvider}
        onSaved={() => {
          setHasEncryptedKey(true);
          setProgressText("Key encrypted with AES-GCM 256-bit.");
        }}
      />

      <VaultModal isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />

      <CustomTemplateStudio
        isOpen={isCustomStudioOpen}
        onClose={() => setIsCustomStudioOpen(false)}
        onSelectAsSchema={handleSelectCustomTemplate}
      />

      <GoogleSheetsModal
        isOpen={isGSheetsModalOpen}
        onClose={() => setIsGSheetsModalOpen(false)}
        onConnected={(url) => {
          setGsheetWebhook(url);
          setProgressText("Direct Google Sheets sync active.");
        }}
      />

      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => {
          setIsWelcomeOpen(false);
          if (typeof window !== "undefined") {
            localStorage.setItem("gridvault_tour_completed", "true");
          }
        }}
        onLoadSampleData={() => {
          handleLoadStressTest();
          setIsWelcomeOpen(false);
          if (typeof window !== "undefined") {
            localStorage.setItem("gridvault_tour_completed", "true");
          }
        }}
        onOpenKeyModal={() => {
          setIsWelcomeOpen(false);
          setIsKeyModalOpen(true);
        }}
        hasKey={hasEncryptedKey}
        customerName={customerName}
      />
    </div>
  );
}
