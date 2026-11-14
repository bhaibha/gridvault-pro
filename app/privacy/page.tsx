// app/privacy/page.tsx
import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Server, Key, EyeOff } from "lucide-react";
import { LandingNavbar } from "@/components/LandingNavbar";

export const metadata = {
  title: "Privacy Policy & Zero-Knowledge Architecture | GridVault Pro",
  description:
    "GridVault Pro provides a Zero-Knowledge, client-side processing architecture. Your financial records, receipts, and API keys are never stored on our servers.",
};

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Knowledge Architecture Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy &amp; Security Protocol
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            Effective Date: November 09, 2026. GridVault Pro was engineered for CPAs, CFOs, and business owners who cannot tolerate third-party SaaS providers reading or storing sensitive financial documents.
          </p>
        </div>

        {/* Security Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">Client-Side Encryption</h4>
            <p className="text-xs text-slate-400">
              Your API keys are encrypted using AES-GCM 256-bit PBKDF2 Web Crypto directly inside your local browser.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Server className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">Zero Server Ingestion</h4>
            <p className="text-xs text-slate-400">
              Uploaded receipts and PDFs never touch our backend databases. Files are converted directly in client memory.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <EyeOff className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">No Data Mining</h4>
            <p className="text-xs text-slate-400">
              We do not train models on your invoices, sell ledger data to brokers, or store vendor banking references.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">1. Information We Do NOT Collect</h3>
            <p>
              Unlike subscription OCR providers that maintain centralized databases of your receipts, supplier line items, and bank transaction references, <strong>GridVault Pro operates on a zero-liability client execution model</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>We do NOT store or log the text, images, or PDFs you upload into the workspace.</li>
              <li>We do NOT log vendor names, tax identification numbers, or bank account credentials.</li>
              <li>We do NOT retain unencrypted AI API keys on any remote server.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">2. Bring Your Own Key (BYOK) Data Transmission</h3>
            <p>
              When you submit a document for extraction, the payload is transmitted directly from your client browser to your designated model provider endpoint (Google Cloud Vertex/Gemini or OpenAI API) using your personal private API key:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                <strong>Google Gemini:</strong> Processed in accordance with Google Cloud&apos;s Enterprise Privacy Policy. Free tier API requests are subject to Google AI Studio standard terms.
              </li>
              <li>
                <strong>OpenAI:</strong> Processed in accordance with OpenAI API data usage policies (OpenAI does not use API data to train models).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">3. Local Storage &amp; Cryptographic Vault</h3>
            <p>
              To eliminate the need to enter your API key on every session, GridVault Pro stores an encrypted ciphertext token in your browser&apos;s <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">localStorage</code>. The decryption key is derived exclusively in memory from your purchase license key using PBKDF2 with 100,000 hashing rounds. If you clear your browser cookies and storage, all local records are permanently wiped.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">4. Payment Processing</h3>
            <p>
              Payments are securely processed via <strong>Lemon Squeezy</strong> (Merchant of Record) or <strong>Gumroad</strong>. We never view or store your full credit card numbers, CVVs, or billing credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">5. Contact Security Officer</h3>
            <p>
              For enterprise security reviews, custom SOC2 vendor assessments, or privacy questions:
              <br />
              <strong>Email:</strong> <span className="text-emerald-400">security@gridvaultpro.com</span>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
