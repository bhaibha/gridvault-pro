// components/RoiCalculator.tsx
"use client";

import React, { useState } from "react";
import { DollarSign, TrendingDown, Clock, ShieldCheck } from "lucide-react";

export function RoiCalculator() {
  const [monthlyDocs, setMonthlyDocs] = useState<number>(150);

  // SaaS Competitor Calculation (e.g. Lido / Dext average $35/mo base for 100 docs + $0.20 per extra page)
  const monthlySaaSCost = monthlyDocs <= 100 ? 35 : 35 + (monthlyDocs - 100) * 0.25;
  const annualSaaSCost = monthlySaaSCost * 12;

  // Manual Typing Cost: 4 minutes per invoice at $22/hour bookkeeper rate = ~$1.47 per invoice
  const annualManualCost = monthlyDocs * 1.47 * 12;

  // GridVault Pro BYOK Cost:
  // $100 one-time software license + ~$0.0018 per document on Gemini 2.5 Flash / GPT-4o-mini
  const annualTokenCost = monthlyDocs * 0.0018 * 12;
  const gridVaultTotalYear1 = 100 + annualTokenCost;

  // Net Savings
  const netSaaSSavingsYear1 = Math.max(0, annualSaaSCost - gridVaultTotalYear1);
  const netManualSavingsYear1 = Math.max(0, annualManualCost - gridVaultTotalYear1);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
        {/* Slider & Inputs */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Interactive Arbitrage Calculator</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Stop Renting Document OCR. Own the Pipeline.
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Recurring SaaS vendors charge you a 1,500% markup on raw cloud AI tokens.
            With GridVault Pro&apos;s BYOK engine, you pay direct wholesale token rates
            of ~$0.002 per page directly to Google or OpenAI.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">Monthly Invoices & Receipts</span>
              <span className="font-mono text-emerald-400 font-bold text-lg">
                {monthlyDocs.toLocaleString()} documents / mo
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={1500}
              step={10}
              value={monthlyDocs}
              onChange={(e) => setMonthlyDocs(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>20 docs (Freelancer)</span>
              <span>300 docs (Small Biz)</span>
              <span>1,500 docs (Agency/CPA)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Manual Hours Saved</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="font-mono font-bold text-white text-base">
                  {Math.round((monthlyDocs * 4 * 12) / 60)} hrs / yr
                </span>
              </div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400">Your Raw Token Bill</span>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-mono font-bold text-emerald-400 text-base">
                  ${annualTokenCost.toFixed(2)} / yr
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Output Box */}
        <div className="w-full lg:w-1/2 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <span className="text-sm font-semibold text-slate-200">Typical Monthly SaaS (Lido/Dext)</span>
                <p className="text-xs text-slate-500">$35/mo base + page overages</p>
              </div>
              <span className="text-lg font-mono font-bold text-rose-400">
                ${Math.round(annualSaaSCost).toLocaleString()} / yr
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <span className="text-sm font-semibold text-slate-200">Manual Data Entry Labor</span>
                <p className="text-xs text-slate-500">4 min / bill @ $22/hr bookkeeper</p>
              </div>
              <span className="text-lg font-mono font-bold text-amber-400">
                ${Math.round(annualManualCost).toLocaleString()} / yr
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">GridVault Pro (Year 1)</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    ONE-TIME
                  </span>
                </div>
                <p className="text-xs text-slate-500">$100 license + direct API tokens</p>
              </div>
              <span className="text-lg font-mono font-bold text-emerald-400">
                ${Math.round(gridVaultTotalYear1).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Big Savings Highlight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <TrendingDown className="w-4 h-4" />
              <span>Year 1 Net SaaS Cash Saved</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white mt-1">
              ${Math.round(netSaaSSavingsYear1).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pays for itself in your first 60 days. After Year 1, your software cost is $0.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
