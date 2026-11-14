// components/PricingCards.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-8">
      {/* Decoy Solo Tier ($69) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition relative">
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Solo Prosumer
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-white font-mono">$69</span>
              <span className="text-slate-400 text-xs uppercase tracking-wide">
                One-Time / Lifetime
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Ideal for freelancers and individuals organizing tax receipts and personal finances.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Up to <strong>25 files</strong> per batch upload</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>4 B2C Spreadsheet Vault Workbooks</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Google Gemini & OpenAI BYOK Vault</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Basic Single-Tax (VAT/Sales) output</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>1 Device License (Lemon Squeezy)</span>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <Link
            href="/app?plan=solo"
            className="w-full block text-center py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Get Solo License ($69)
          </Link>
        </div>
      </div>

      {/* Hero Pro Bundle ($100) - MOST POPULAR */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500 rounded-3xl p-8 flex flex-col justify-between shadow-2xl shadow-emerald-500/10 relative scale-105 z-10">
        {/* Badge */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Most Popular — Best Value</span>
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Hero Pro Suite
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-extrabold text-white font-mono">$100</span>
              <span className="text-slate-400 text-xs uppercase tracking-wide">
                One-Time / Lifetime
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Complete automated extraction utility for business owners, contractors, and bookkeepers.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3.5 text-xs text-slate-200">
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span><strong>500 files</strong> per batch with concurrency queue</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Complete <strong>8 Master Workbooks</strong> (B2B + B2C Vault)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Global Multi-Tax Splits (CGST/SGST/IGST/VAT/Sales)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Math Reconciliation & Amber Flagging</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Cryptographic Duplicate Invoice Suppression</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>AES-GCM 256-bit Client-Side Encrypted Key Vault</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>3 Device Commercial License (Lemon Squeezy)</span>
            </div>
          </div>
        </div>

        <div className="pt-8 space-y-2">
          <Link
            href="/app?plan=pro"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
          >
            <span>Get Hero Pro License ($100)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>30-Day Money-Back Guarantee. Zero Subscriptions.</span>
          </p>
        </div>
      </div>

      {/* Agency / Team Tier ($249) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition relative">
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Agency & Accounting Teams
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-white font-mono">$249</span>
              <span className="text-slate-400 text-xs uppercase tracking-wide">
                One-Time / Lifetime
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Built for accounting firms, bookkeepers, and agencies handling dozens of client portals.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span><strong>Unlimited</strong> batch sizes & multi-client profiles</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Everything in Hero Pro Tier</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>10 Team Seats with individual license keys</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Custom Schema Prompt Engineering Support</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Direct WhatsApp & VIP Email CPA Support</span>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <Link
            href="/app?plan=agency"
            className="w-full block text-center py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Get Agency License ($249)
          </Link>
        </div>
      </div>
    </div>
  );
}
