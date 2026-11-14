// components/ApiKeyModal.tsx
"use client";

import React, { useState } from "react";
import { KeyRound, ShieldCheck, ExternalLink, X, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { saveEncryptedApiKey, clearEncryptedApiKey } from "@/lib/crypto-vault";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseKey: string;
  currentProvider: "gemini" | "openai";
  onProviderChange: (p: "gemini" | "openai") => void;
  onSaved: () => void;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  licenseKey,
  currentProvider,
  onProviderChange,
  onSaved,
}: ApiKeyModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, message: "Please paste a valid API key." });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      if (currentProvider === "gemini") {
        const testRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKeyInput.trim()}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Respond with the word: OK" }] }],
            }),
          }
        );
        if (!testRes.ok) {
          const err = await testRes.text();
          throw new Error(`Google Gemini validation failed (${testRes.status}): ${err.slice(0, 100)}`);
        }
      } else {
        const testRes = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKeyInput.trim()}` },
        });
        if (!testRes.ok) {
          throw new Error(`OpenAI validation failed (${testRes.status})`);
        }
      }

      // If test passes, encrypt with AES-GCM 256-bit into browser localStorage
      await saveEncryptedApiKey(apiKeyInput.trim(), licenseKey, currentProvider);
      setTestResult({
        success: true,
        message: "Key verified successfully and encrypted with AES-GCM 256-bit in your browser.",
      });
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Key validation failed.";
      setTestResult({ success: false, message: msg });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Client-Side AI Vault</h3>
              <p className="text-xs text-slate-400">Zero-liability AES-GCM 256-bit storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Your AI Provider
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onProviderChange("gemini")}
              className={`p-3 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                currentProvider === "gemini"
                  ? "bg-emerald-500/10 border-emerald-500 text-white shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">Google Gemini</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                  RECOMMENDED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Gemini 2.5 Flash: Free tier includes ~500 docs/month for $0.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onProviderChange("openai")}
              className={`p-3 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                currentProvider === "openai"
                  ? "bg-emerald-500/10 border-emerald-500 text-white shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className="font-bold">OpenAI</span>
              <p className="text-[11px] text-slate-400 mt-1">
                GPT-4o-mini: High accuracy, ~$0.002 per invoice.
              </p>
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-300">
              Paste {currentProvider === "gemini" ? "Google Gemini" : "OpenAI"} API Key
            </label>
            <a
              href={
                currentProvider === "gemini"
                  ? "https://aistudio.google.com/app/apikey"
                  : "https://platform.openai.com/api-keys"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <input
            type="password"
            placeholder={
              currentProvider === "gemini"
                ? "AIzaSy..."
                : "sk-proj-..."
            }
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 outline-none transition"
          />
        </div>

        {/* Status result */}
        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
              testResult.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Encryption Assurance Notice */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Zero Server Liability:</strong> Your API key is encrypted directly in your browser using PBKDF2 + AES-GCM 256-bit. It is never stored on any remote database or server.
          </span>
        </div>

        {/* Action Button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTestAndSave}
            disabled={isTesting}
            className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
          >
            {isTesting ? (
              <span>Verifying & Encrypting...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Encrypt Vault</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
