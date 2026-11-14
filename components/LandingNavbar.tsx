// components/LandingNavbar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { FileSpreadsheet, KeyRound, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">GridVault Pro</span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                $100 Lifetime
              </span>
            </div>
            <span className="text-[11px] text-slate-400 -mt-0.5 hidden sm:inline">
              Document-to-Spreadsheet Suite
            </span>
          </div>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
          <a href="#features" className="hover:text-emerald-400 transition-colors">
            Features
          </a>
          <a href="#roi-calculator" className="hover:text-emerald-400 transition-colors">
            ROI Calculator
          </a>
          <a href="#comparison" className="hover:text-emerald-400 transition-colors">
            Comparison
          </a>
          <Link href="/templates" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <span>8 Master Templates</span>
            <span className="px-1.5 py-0.5 text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-semibold">
              FREE VAULT
            </span>
          </Link>
          <a href="#pricing" className="hover:text-emerald-400 transition-colors">
            Pricing
          </a>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30"
          >
            <span>Launch Web App</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
