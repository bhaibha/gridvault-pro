// components/WelcomeModal.tsx
"use client";

import React, { useState } from "react";
import {
  Sparkles,
  KeyRound,
  FileSpreadsheet,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSampleData: () => void;
  onOpenKeyModal: () => void;
  hasKey: boolean;
  customerName?: string;
}

export function WelcomeModal({
  isOpen,
  onClose,
  onLoadSampleData,
  onOpenKeyModal,
  hasKey,
  customerName = "Valued Customer",
}: WelcomeModalProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl flex flex-col p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg sm:text-xl tracking-tight">
                  Welcome to GridVault Pro
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  LIFETIME SUITE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Zero-subscription invoice &amp; receipt extraction into native Excel workbooks
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

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: 1, label: "License Status" },
            { num: 2, label: "Free AI Setup" },
            { num: 3, label: "Sample Test-Drive" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num as 1 | 2 | 3)}
              className={`p-2.5 rounded-xl border text-left transition ${
                activeStep === s.num
                  ? "bg-slate-850 border-emerald-500/50 shadow-md"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    activeStep === s.num
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {s.num}
                </span>
                <span className="text-xs font-semibold text-white">
                  {s.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4 py-2">
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm text-white">
                      Active Customer License
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    VERIFIED &bull; PRO LIFETIME
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Registered to: <strong className="text-white">{customerName}</strong>. Your license includes commercial usage, up to 500 documents per batch, all 8 master audit workbooks, and lifetime updates.
                </p>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Want to set up your AI Key next?</span>
                <button
                  onClick={() => setActiveStep(2)}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Proceed to Step 2 &rarr;
                </button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Bring Your Own Key (BYOK) Architecture</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      hasKey
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {hasKey ? "Key Configured" : "Not Set Yet"}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <p>
                    By bringing your own API key, you eliminate 100% of SaaS recurring markup. Your keys are encrypted client-side using <strong>AES-GCM 256-bit Web Crypto</strong> directly in your browser.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 space-y-1.5">
                    <div className="flex items-center justify-between text-white font-semibold">
                      <span>Google Gemini 2.0 Flash (Recommended)</span>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Get Free Key</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      100% Free for 15 requests per minute! No credit card required.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onOpenKeyModal}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>{hasKey ? "Update AI API Key" : "Configure API Key Now"}</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Skip to live testing?</span>
                <button
                  onClick={() => setActiveStep(3)}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Proceed to Step 3 &rarr;
                </button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Instant Test-Drive: Load 5 Realistic Sample Bills</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Don&apos;t have invoices on hand right now? Click below to instantly populate the workspace with 5 realistic vendor bills, itemized line items, math reconciliation checks, and multi-tax splits.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Real-time Math Verification</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Duplicate Hash Suppression</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>3-Tab Native Excel (.xlsx)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Google Sheets Push</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLoadSampleData();
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <Zap className="w-4 h-4 text-slate-950 fill-current" />
                  <span>Load 5 Sample Bills &amp; Launch Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>You can reopen this tour anytime from the toolbar.</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
