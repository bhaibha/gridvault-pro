# GridVault Pro ($100 Lifetime Document-to-Spreadsheet Suite)

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Commercial-emerald)](#)

GridVault Pro is a commercial-grade, zero-server-overhead document/receipt-to-spreadsheet application. It combines a client-side BYOK (Bring Your Own Key) web micro-app with an automated multi-tab Excel and Google Sheets vault.

---

## Key Highlights

- **Anti-Subscription Model:** Positioned at a $100 one-time lifetime price point to eliminate recurring $30-$500/mo SaaS bills.
- **Client-Side AES-GCM 256-Bit Vault:** Users connect their Google Gemini or OpenAI API keys securely in the browser. Zero server liability.
- **500-File Batch Concurrency Queue:** Client-side throttled file batching with live progress bars and drag-and-drop dropzone.
- **Automated Math Reconciliation:** Checks $\text{Subtotal} + \text{Tax} = \text{Total}$. Automatically downgrades confidence and triggers an amber `MATH CHECK` badge on discrepancies.
- **Cryptographic Duplicate Detection:** Fingerprints invoices (`Date_Vendor_RefNo_Total`) to identify and suppress duplicate supplier billing.
- **3-Tab Native Excel (.xlsx) Generator:** Built with SheetJS and hardened against CSV/Excel formula injection attacks.
  - Tab 1: `Executive_Summary`
  - Tab 2: `Verified_Ledger`
  - Tab 3: `Line_Items_Detail`
- **8 Turnkey Master Spreadsheet Workbooks:** 4 B2B workbooks (Tax Ledger, Job Costing, Cash Flow, Lead CRM) + 4 B2C workbooks (Tax Organizer, Subscription Leaks, Warranty Tracker, Travel Claims).

---

## Quickstart (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests (Vitest)
npm test

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- Marketing Landing Page & Sandbox: `http://localhost:3000/`
- Workspace Web App: `http://localhost:3000/app`
- Spreadsheet Vault: `http://localhost:3000/templates`

---

## Testing & QA Verification

Run the automated test suite:
```bash
npm test
```
The test suite covers:
- Currency and international number parsing (including European commas and Indian numbering).
- Idempotent duplicate hash generation.
- Formula injection protection (`=`, `+`, `-`, `@`).
- 3-tab workbook generation and duplicate exclusion logic.

---

## Production Build

```bash
npm run build
npm run start
```
Verified with 0 TypeScript errors and 0 lint warnings. Ready for immediate deployment to Vercel, Cloudflare Pages, or AWS Amplify.
