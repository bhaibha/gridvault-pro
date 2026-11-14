// components/DemoSandbox.tsx
"use client";

import React, { useState } from "react";
import { Sparkles, FileSpreadsheet, CheckCircle2, AlertTriangle, Copy, Download, RefreshCw } from "lucide-react";
import { getSampleStressTestBatch } from "@/lib/test-samples";
import { ExtractedDocument } from "@/lib/extraction-engine";
import { exportMasterWorkbook } from "@/lib/excel-export";

export function DemoSandbox() {
  const [sampleDocs, setSampleDocs] = useState<ExtractedDocument[]>(getSampleStressTestBatch());
  const [selectedDocId, setSelectedDocId] = useState<string>("doc-sample-01");
  const [isExporting, setIsExporting] = useState(false);

  const selectedDoc = sampleDocs.find((d) => d.id === selectedDocId) || sampleDocs[0];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportMasterWorkbook(sampleDocs, "GST", "GridVault_Demo_Audit");
      setIsExporting(false);
    }, 400);
  };

  const handleFixMath = (docId: string) => {
    setSampleDocs((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        // Fix total to subtotal + taxes: 7200 + 648 + 648 = 8496
        const correctedTotal = Number((doc.subtotal + doc.cgst + doc.sgst).toFixed(2));
        return {
          ...doc,
          totalAmount: correctedTotal,
          mathVerified: true,
          confidence: 0.99,
          notesOrEmail: "Total reconciled manually by auditor: 7,200 + 1,296 = 8,496",
        };
      })
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Verification Sandbox</span>
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
            Experience the Split-Screen Audit Engine Live
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Test how GridVault automatically flags math errors, suppresses duplicate bills, and builds 3-tab Excel workbooks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSampleDocs(getSampleStressTestBatch())}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExporting ? "Generating..." : "Download 3-Tab .XLSX"}</span>
          </button>
        </div>
      </div>

      {/* Document Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {sampleDocs.map((doc) => {
          const isSelected = doc.id === selectedDocId;
          return (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 border ${
                isSelected
                  ? "bg-slate-800 border-emerald-500/60 text-white shadow"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span>{doc.fileName}</span>
              {doc.isDuplicate ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  DUPLICATE
                </span>
              ) : !doc.mathVerified ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  MATH CHECK
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  VERIFIED
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Split Inspector Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950 border border-slate-800/80 rounded-2xl p-4 sm:p-6">
        {/* Document Metadata & Status Column */}
        <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-800/80 pb-6 lg:pb-0 lg:pr-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Audit Classification
            </span>
            {selectedDoc.isDuplicate ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Excluded Duplicate
              </span>
            ) : !selectedDoc.mathVerified ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Math Mismatch Detected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reconciled ({Math.round(selectedDoc.confidence * 100)}%)</span>
              </span>
            )}
          </div>

          <div className="bg-slate-900/90 rounded-xl p-4 space-y-2.5 border border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">File Name:</span>
              <span className="font-mono text-slate-200 font-semibold">{selectedDoc.fileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Document Type:</span>
              <span className="font-semibold text-emerald-400">{selectedDoc.docType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Invoice / Ref:</span>
              <span className="font-mono text-slate-200">{selectedDoc.invoiceOrRefNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tax Reg / GSTIN:</span>
              <span className="font-mono text-slate-200">{selectedDoc.taxId || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="text-slate-200">{selectedDoc.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Duplicate Hash:</span>
              <span className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]">
                {selectedDoc.duplicateHash}
              </span>
            </div>
          </div>

          {!selectedDoc.mathVerified && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Subtotal + Tax Mismatch</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The thermal receipt had a faded footer ($7,200 Subtotal + $1,296 Tax = $8,496, but read as $8,800).
                GridVault downgraded confidence to 55%.
              </p>
              <button
                onClick={() => handleFixMath(selectedDoc.id)}
                className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition"
              >
                1-Click Reconcile Math ($8,496)
              </button>
            </div>
          )}

          {selectedDoc.isDuplicate && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              <strong>Duplicate Bill Suppressed:</strong> This invoice matches an earlier upload by date, vendor, and amount.
              It will be excluded from the master spend tally in the Executive Summary.
            </div>
          )}
        </div>

        {/* Extracted Financial Ledger & Line Items */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Extracted Tabular Ledger
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Currency: {selectedDoc.currency}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400">Subtotal</span>
              <p className="text-base font-bold font-mono text-white mt-0.5">
                {selectedDoc.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400">CGST (Central)</span>
              <p className="text-base font-bold font-mono text-slate-300 mt-0.5">
                {selectedDoc.cgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400">SGST / VAT</span>
              <p className="text-base font-bold font-mono text-slate-300 mt-0.5">
                {(selectedDoc.sgst + selectedDoc.vatOrSalesTax).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400">Total Amount</span>
              <p className={`text-base font-bold font-mono mt-0.5 ${
                !selectedDoc.mathVerified ? "text-amber-400" : "text-emerald-400"
              }`}>
                {selectedDoc.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-300">
              Itemized Line Items ({selectedDoc.lineItems.length})
            </div>
            <div className="divide-y divide-slate-800/80 text-xs">
              {selectedDoc.lineItems.length > 0 ? (
                selectedDoc.lineItems.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-800/40">
                    <div>
                      <p className="font-medium text-slate-200">{item.description}</p>
                      {item.sku && <span className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</span>}
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-slate-400">{item.quantity} x {item.unitPrice.toFixed(2)}</span>
                      <p className="font-bold text-white">{item.lineTotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs">
                  {selectedDoc.docType === "BUSINESS_CARD"
                    ? `Contact Details: ${selectedDoc.notesOrEmail}`
                    : "No granular line items extracted for this document."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
