// app/page.tsx
"use client";

import React, { useState } from "react";
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
import { RoiCalculator } from "@/components/RoiCalculator";
import { DemoSandbox } from "@/components/DemoSandbox";
import { PricingCards } from "@/components/PricingCards";
import { VaultModal } from "@/components/VaultModal";

export default function LandingPage() {
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Bring-Your-Own-Key (BYOK) work?",
      a: "Instead of paying us a monthly subscription with a 1,500% markup on cloud compute, you enter your own Google Gemini or OpenAI API key. Your key is encrypted directly inside your browser using AES-GCM 256-bit encryption and is never transmitted to or stored on our servers. You pay raw token rates directly to the provider—typically $0.0015 to $0.002 per invoice.",
    },
    {
      q: "How much will Google or OpenAI charge me to process receipts?",
      a: "Google Gemini 2.5 Flash offers a completely free tier of 15 requests per minute (up to ~500 to 1,000 documents per month for $0.00). If you exceed that or use OpenAI's GPT-4o-mini, 1,000 documents cost approximately $1.50 in direct tokens. In contrast, Lido charges $29/month for only 100 pages.",
    },
    {
      q: "Can anyone else see my financial documents or invoices?",
      a: "No. GridVault Pro is a zero-liability architecture. Your files are processed entirely in memory between your browser and the chosen AI provider's secure API. Extracted ledgers remain stored in your browser's private local storage until you export them to Excel or clear your workspace.",
    },
    {
      q: "What makes the 8 Master Spreadsheet Workbooks so valuable?",
      a: "Raw OCR output is just flat data. Our 8 turnkey workbooks (.xlsx) turn that data into actionable intelligence with pre-built pivot charts, tax deduction categories, vendor aging, job-costing variance, and warranty tracking. They work seamlessly across Microsoft Excel, Google Sheets, and Apple Numbers.",
    },
    {
      q: "What happens if a receipt is crumpled or blurry?",
      a: "GridVault Pro features automated mathematical reconciliation. If Subtotal + Tax does not match the Total Amount, the row is automatically flagged in Amber with a 'MATH CHECK' badge, and the confidence score is automatically downgraded. You can click any cell to edit it and reconcile the totals in real time.",
    },
    {
      q: "What is your refund guarantee?",
      a: "We offer a 30-Day No-Questions-Asked Money-Back Guarantee. If GridVault Pro does not save you hundreds of dollars and dozens of hours on invoice extraction, simply email support for a full refund.",
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
            <span>The Anti-Subscription OCR Movement</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">Own Your Extractor for $100 Once</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Turn Stacks of Invoices &amp; Receipts into{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              Audit-Ready Excel Workbooks
            </span>{" "}
            in 60 Seconds.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Stop paying $348/year for recurring OCR subscriptions. GridVault Pro pairs a
            client-side BYOK web micro-app with 8 turnkey B2B/B2C master spreadsheets.
            Enterprise line-item extraction with <strong>zero recurring compute markups</strong>.
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

            <button
              onClick={() => setIsVaultOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Explore 8 Master Spreadsheets</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero-Server Liability (AES-256)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Up to 500 Files Per Batch</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Native 3-Tab .XLSX &amp; Sheets</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>$100 Lifetime via Lemon Squeezy</span>
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

      {/* 3. COMPETITOR TEAR-DOWN TABLE */}
      <section id="comparison" className="py-20 border-t border-slate-900 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Market Gap Analysis
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why the $100 Lifetime Model Crushes SaaS Extractors
            </h2>
            <p className="text-sm text-slate-400">
              The document extraction market forces buyers to choose between overpriced monthly subscriptions or rigid bookkeeping software that refuses to output clean, granular spreadsheets.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="p-4 sm:p-5 font-semibold">Platform</th>
                  <th className="p-4 sm:p-5 font-semibold">Primary Output</th>
                  <th className="p-4 sm:p-5 font-semibold">Line-Item Extraction</th>
                  <th className="p-4 sm:p-5 font-semibold">Batch Upload Limit</th>
                  <th className="p-4 sm:p-5 font-semibold">Pricing Model</th>
                  <th className="p-4 sm:p-5 font-semibold">Year 1 Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr className="hover:bg-slate-800/40">
                  <td className="p-4 sm:p-5 font-bold text-white">Lido</td>
                  <td className="p-4 sm:p-5">Native xlsx</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-semibold">Yes</td>
                  <td className="p-4 sm:p-5">100 pages / mo</td>
                  <td className="p-4 sm:p-5 font-mono">$29 / month</td>
                  <td className="p-4 sm:p-5 font-mono font-bold text-rose-400">$348 / yr</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="p-4 sm:p-5 font-bold text-white">Expensify</td>
                  <td className="p-4 sm:p-5">Flat CSV only</td>
                  <td className="p-4 sm:p-5 text-rose-400">No (Headers only)</td>
                  <td className="p-4 sm:p-5">Mobile camera feed</td>
                  <td className="p-4 sm:p-5 font-mono">$5 / user / month</td>
                  <td className="p-4 sm:p-5 font-mono text-slate-400">$60 / user / yr</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="p-4 sm:p-5 font-bold text-white">Dext</td>
                  <td className="p-4 sm:p-5">Xero / QuickBooks lock-in</td>
                  <td className="p-4 sm:p-5 text-rose-400">No raw xlsx</td>
                  <td className="p-4 sm:p-5">50 docs / mo</td>
                  <td className="p-4 sm:p-5 font-mono">£22 / month</td>
                  <td className="p-4 sm:p-5 font-mono text-rose-400">~£264 ($340) / yr</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="p-4 sm:p-5 font-bold text-white">Veryfi</td>
                  <td className="p-4 sm:p-5">JSON API only</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-semibold">Yes</td>
                  <td className="p-4 sm:p-5">API calls</td>
                  <td className="p-4 sm:p-5 font-mono">$500 / month</td>
                  <td className="p-4 sm:p-5 font-mono text-rose-400">$6,000 / yr</td>
                </tr>
                <tr className="bg-emerald-950/30 border-2 border-emerald-500/50">
                  <td className="p-4 sm:p-5 font-extrabold text-emerald-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>GridVault Pro</span>
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-white">
                    3-Tab Native .xlsx + Sheets
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400">
                    Yes + SKU &amp; Rates
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-white">
                    500 files / batch
                  </td>
                  <td className="p-4 sm:p-5 font-mono font-extrabold text-emerald-400">
                    $100 Lifetime (BYOK)
                  </td>
                  <td className="p-4 sm:p-5 font-mono font-extrabold text-emerald-300">
                    $100 Once (~$1.50 in tokens)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE ROI CALCULATOR */}
      <section id="roi-calculator" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <RoiCalculator />
        </div>
      </section>

      {/* 5. THE $100 VALUE MULTIPLIER: 8 TURNKEY SPREADSHEETS */}
      <section id="features" className="py-20 border-t border-slate-900 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              The $100 Value Multiplier
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              8 Master Turnkey Spreadsheets Included Free
            </h2>
            <p className="text-sm text-slate-400">
              Raw data extraction feels like a $19 utility. Pairing the extractor with 8 pre-engineered, formula-driven master workbooks for B2B and B2C workflows creates an irresistible $100 offer.
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
                    Automatically computes claimable GST/VAT input tax credits, vendor aging, and flags duplicate supplier invoices before payment.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">2. Project &amp; Job-Costing Material Tracker</span>
                  <p className="text-slate-400">
                    Maps itemized material line items directly against project codes, site budgets, and billable client invoices.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">3. Monthly P&amp;L &amp; Cash-Flow Dashboard</span>
                  <p className="text-slate-400">
                    Parses bank statement PDFs into monthly burn rates, revenue growth, and operating expense pivot charts.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">4. B2B Networking &amp; Business Card CRM</span>
                  <p className="text-slate-400">
                    Converts conference card scans into a structured sales pipeline with auto-generated WhatsApp and email launch links.
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
                    Groups medical bills, charitable contributions, home office receipts, and freelance expenses into IRS/HMRC-ready brackets.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">6. Household Budget &amp; Subscription Leak Finder</span>
                  <p className="text-slate-400">
                    Audits monthly card statements to uncover forgotten subscriptions, hidden fees, and recurring spending leaks.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">7. Home Renovation &amp; Asset Warranty Tracker</span>
                  <p className="text-slate-400">
                    Logs contractor bills, appliance serial numbers, purchase dates, and automated warranty expiration countdown alerts.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-sm">8. Multi-Currency Travel &amp; Expense Claim</span>
                  <p className="text-slate-400">
                    Normalizes foreign currency receipts into your home currency for rapid employer reimbursement and travel accounting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => setIsVaultOpen(true)}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Preview &amp; Download Any Workbook Now</span>
            </button>
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
              Pay Once. Own Your Document Pipeline Forever.
            </h2>
            <p className="text-sm text-slate-400">
              Zero monthly invoices. Zero per-seat lock-in. Powered by client-side encrypted BYOK.
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
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-white hover:text-emerald-400 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180 text-emerald-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
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
            <a href="#roi-calculator" className="hover:text-slate-300">
              ROI Calculator
            </a>
            <a href="#pricing" className="hover:text-slate-300">
              Pricing
            </a>
          </div>
          <div className="text-center sm:text-right">
            &copy; {new Date().getFullYear()} GridVault Pro. Instant Lemon Squeezy / Gumroad fulfillment.
          </div>
        </div>
      </footer>

      {/* Spreadsheet Vault Modal */}
      <VaultModal isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
    </div>
  );
}
