// components/GoogleSheetsModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  X,
  Zap,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  GOOGLE_APPS_SCRIPT_TEMPLATE,
  getSavedGoogleSheetWebhook,
  saveGoogleSheetWebhook,
  clearGoogleSheetWebhook,
  testGoogleSheetConnection,
} from "@/lib/google-sheets-sync";

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: (url: string) => void;
}

export function GoogleSheetsModal({
  isOpen,
  onClose,
  onConnected,
}: GoogleSheetsModalProps) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [sheetName, setSheetName] = useState("2026 Master Business Ledger");
  const [copiedScript, setCopiedScript] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedGoogleSheetWebhook();
      if (saved) {
        setWebhookUrl(saved);
        setTestStatus("success");
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleTestAndSave = async () => {
    if (!webhookUrl.trim().startsWith("https://script.google.com")) {
      alert("Please paste a valid Google Apps Script Web App URL (starts with https://script.google.com)");
      return;
    }

    setIsTesting(true);
    const ok = await testGoogleSheetConnection(webhookUrl);
    setIsTesting(false);

    if (ok) {
      saveGoogleSheetWebhook(webhookUrl, sheetName);
      setTestStatus("success");
      if (onConnected) onConnected(webhookUrl);
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setTestStatus("error");
    }
  };

  const handleDisconnect = () => {
    clearGoogleSheetWebhook();
    setWebhookUrl("");
    setTestStatus("idle");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg">
                  Direct Google Sheets Live Sync Hub
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Push extracted bills &amp; receipts directly into any live Google Sheet with 1 click
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 30-Second Setup Instructions */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
                30-Second Zero-Friction Setup:
              </span>
              <a
                href="https://sheets.new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
              >
                <span>Open New Google Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ol className="space-y-2 text-slate-300 list-decimal list-inside leading-relaxed">
              <li>
                In your Google Sheet, click <strong>Extensions &gt; Apps Script</strong>.
              </li>
              <li>
                Delete existing text, click the button below to <strong>Copy Script</strong>, paste it into Apps Script, and click <strong>Save</strong> (Disk icon).
              </li>
              <li>
                Click <strong>Deploy &gt; New Deployment</strong>, choose <strong>Web App</strong>, set <em>Who has access</em> to <strong>&ldquo;Anyone&rdquo;</strong>, and click Deploy.
              </li>
              <li>
                Paste your generated <strong>Web App URL</strong> below!
              </li>
            </ol>

            <button
              onClick={handleCopyScript}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              {copiedScript ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Google Apps Script Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>1-Click Copy Google Apps Script Snippet</span>
                </>
              )}
            </button>
          </div>

          {/* Webhook Connection Input */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Google Apps Script Webhook URL
              </label>
              <input
                type="text"
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white placeholder-slate-600 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400 text-[11px]">
                Target Sheet Name (Optional Label)
              </label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
              />
            </div>

            {testStatus === "success" && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Connected to Google Sheet: {sheetName}</span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="text-[11px] text-slate-400 hover:text-rose-400 underline"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={handleTestAndSave}
            disabled={isTesting || !webhookUrl}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            {isTesting ? (
              <span>Verifying Connection...</span>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Save &amp; Connect Google Sheet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
