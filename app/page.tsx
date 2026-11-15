// app/page.tsx

import React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Layers,
  Sparkles,
  HelpCircle,
  Lock,
  Download,
  Building2,
  User,
  ChevronDown,
} from "lucide-react";
import { LandingNavbar } from "@/components/LandingNavbar";
import { DemoSandbox } from "@/components/DemoSandbox";
import { PricingCards } from "@/components/PricingCards";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  const faqs = [
    {
      q: "What can I try before buying?",
      a: "Open the workspace and load five sample documents. Review a duplicate and a math mismatch, edit the ledger, and download the Excel export without a license.",
    },
    {
      q: "Where are uploaded files processed?",
      a: "GridVault sends uploaded invoices and receipts to Google Gemini using a paid API project configured by the operator. You do not need to enter your own API key. The ledger is saved in this browser.",
    },
    {
      q: "What happens after I buy?",
      a: "Lemon Squeezy issues your license key. Enter it in the GridVault workspace to activate uploads and download the workbook vault.",
    },
    {
      q: "What is the refund policy?",
      a: "You can request a full refund for any reason within 30 days of purchase. See Terms & License for how to request one.",
    },
    {
      q: "Can I use the results in Google Sheets?",
      a: "Import the Excel file or use Copy TSV and paste the ledger into your Sheet.",
    },
    {
      q: "What should I review before using the workbook?",
      a: "Compare the extracted fields and tax amounts with the original documents. The math and duplicate checks help you spot exceptions.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <LandingNavbar />

      {/* 1. HERO SECTION */}
      <header className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-emerald-500/15 to-teal-500/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          {/* Pill hook */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400 shadow-lg">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>For Excel-based bookkeeping</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">Sample workspace available</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Turn invoices and receipts into{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              Excel workbooks
            </span>{" "}

          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Extract invoice fields and line items, review flagged totals and duplicates, and export an editable Excel workbook.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Launch Live Workspace</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/templates"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Preview Excel workbooks</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Math checks</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Duplicate flags</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Three-tab Excel export</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Totals by currency</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. LIVE INTERACTIVE DEMO SANDBOX */}
      <section id="demo" className="py-12 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <DemoSandbox />
        </div>
      </section>

      {/* 5. THE $100 VALUE MULTIPLIER: 8 TURNKEY SPREADSHEETS */}
      <section id="features" className="py-20 border-t border-slate-900 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Workbook vault
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Eight Excel workbooks included with Pro
            </h2>
            <p className="text-sm text-slate-400">
              Use these sample layouts as a starting point for organizing your records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* B2B Workbooks Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">The B2B Business Owner Vault</h3>
                  <p className="text-xs text-slate-400">4 Master Workbooks for Business Ops &amp; CPAs</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">1. Vendor &amp; Tax Reconciliation Ledger</span>
                  <p className="text-slate-400">
                    Organize supplier invoice details and extracted tax amounts.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">2. Project &amp; Job-Costing Material Tracker</span>
                  <p className="text-slate-400">
                    Record material costs by project and track them against a budget.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">3. Monthly P&amp;L &amp; Cash-Flow Dashboard</span>
                  <p className="text-slate-400">
                    Record cash-flow and profit-and-loss figures.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">4. B2B Networking &amp; Business Card CRM</span>
                  <p className="text-slate-400">
                    Record business contacts and follow-up details.
                  </p>
                </div>
              </div>
            </div>

            {/* B2C Workbooks Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">The B2C Prosumer &amp; Personal Vault</h3>
                  <p className="text-xs text-slate-400">4 Master Workbooks for Tax Prep &amp; Household Budget</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">5. Annual Tax-Deduction &amp; Audit Organizer</span>
                  <p className="text-slate-400">
                    Organize receipts and expenses for tax preparation.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">6. Household Budget &amp; Subscription Leak Finder</span>
                  <p className="text-slate-400">
                    List subscriptions and recurring expenses.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">7. Home Renovation &amp; Asset Warranty Tracker</span>
                  <p className="text-slate-400">
                    Record contractor bills, appliance details, and warranty dates.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">8. Multi-Currency Travel &amp; Expense Claim</span>
                  <p className="text-slate-400">
                    Record travel expenses, currencies, and reimbursement amounts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/templates"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Preview the workbook vault</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. DUAL-SEGMENT PRICING */}
      <section id="pricing" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              One-Time Lifetime Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              GridVault Pro
            </h2>
            <p className="text-sm text-slate-400">
              Try the sample workflow before buying.
            </p>
          </div>

          <PricingCards />
        </div>
      </section>

      {/* 7. OBJECTION-BUSTING FAQ */}
      <section className="py-20 border-t border-slate-900 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">Got Questions? We&apos;ve Got Answers.</h2>
          </div>

          <div className="space-y-3 pt-4">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group rounded-2xl border border-slate-800 bg-slate-900">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-semibold text-white hover:text-emerald-400">
                  {q}
                  <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 group-open:rotate-180" />
                </summary>
                <p className="border-t border-slate-800/60 px-5 py-4 text-sm text-slate-300">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-300">GridVault Pro</span>
            <span>— Commercial Document-to-Spreadsheet Micro-App</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/app" className="hover:text-slate-300">
              Web App
            </Link>
            <Link href="/templates" className="hover:text-slate-300">
              Spreadsheet Vault
            </Link>
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300">
              Terms &amp; License
            </Link>
            <a href="/#demo" className="hover:text-slate-300">
              Sample demo
            </a>
            <a href="#pricing" className="hover:text-slate-300">
              Pricing
            </a>
          </div>
          <div className="text-center sm:text-right">
            &copy; {new Date().getFullYear()} GridVault Pro. Invoice and receipt review.
          </div>
        </div>
      </footer>

      {/* Spreadsheet Vault Modal */}
    </div>
  );
}
