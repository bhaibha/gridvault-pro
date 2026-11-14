// app/terms/page.tsx
import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, RefreshCcw, AlertTriangle } from "lucide-react";
import { LandingNavbar } from "@/components/LandingNavbar";

export const metadata = {
  title: "Terms of Service & Commercial License | GridVault Pro",
  description:
    "GridVault Pro terms of service, commercial licensing terms, and 30-day money-back guarantee.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <LandingNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Title */}
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
            <FileText className="w-4 h-4" />
            <span>Commercial Software License Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service &amp; Commercial Rights
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            Effective Date: November 09, 2026. Please read these terms carefully before purchasing or downloading GridVault Pro.
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">Lifetime Ownership</h4>
            <p className="text-xs text-slate-400">
              Pay once for $100. Never pay monthly software subscriptions or seat renewal fees.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <RefreshCcw className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">30-Day Money-Back</h4>
            <p className="text-xs text-slate-400">
              Request a refund within 30 days of purchase.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">Commercial Rights</h4>
            <p className="text-xs text-slate-400">
              Audit client books, prepare commercial tax schedules, and export without royalty fees.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">1. License Grant &amp; Permitted Use</h3>
            <p>
              Upon purchase, GridVault Pro grants you a non-exclusive, perpetual, non-transferable worldwide license to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Deploy and run the GridVault Pro workspace on up to three (3) personal or company devices simultaneously.</li>
              <li>Process supported invoices and receipts within the workspace limits.</li>
              <li>Customize, modify, and format all eight (8) master spreadsheet workbooks for internal business and client accounting.</li>
              <li>Deliver final client audit workbooks, tax schedules, and financial reports without licensing attribution.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">2. Prohibited Uses</h3>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Resell, redistribute, share, lease, or sub-license the standalone master template `.xlsx` files to third parties or public template marketplaces.</li>
              <li>Redistribute customer license keys.</li>
              <li>Offer GridVault Pro as a publicly hosted multi-tenant SaaS extraction service without an enterprise agency license.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">3. 30-Day Money-Back Guarantee</h3>
            <p>
              We stand behind GridVault Pro with a strict <strong>30-Day No-Questions-Asked Money-Back Guarantee</strong>. If the software fails to process your receipts or if you are unsatisfied for any reason, email <span className="text-emerald-400">support@gridvaultpro.com</span> within 30 days of purchase for a prompt 100% refund processed via Lemon Squeezy.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">4. Disclaimer of Accounting &amp; Tax Advice</h3>
            <p>
              GridVault Pro is an automated optical document extraction utility. While our math verification engine cross-checks totals and tax splits (Subtotal + Tax = Total), all extracted ledgers should be reviewed by qualified corporate bookkeepers, CPAs, or tax advisors prior to official statutory tax filings.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">5. Governing Law</h3>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
