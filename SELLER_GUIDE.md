# GridVault Pro — Founder & Seller Operations Guide

Welcome to **GridVault Pro** ($100 Lifetime Document-to-Spreadsheet Suite). This document contains everything you need to package, brand, deploy, configure payments on Lemon Squeezy, and drive your first $10,000 in sales.

---

## 1. Product Overview & Unit Economics

* **Retail Pricing:**
  * **Solo Tier ($69 One-Time):** Decoy price point, 25 files/batch, 4 B2C spreadsheet workbooks.
  * **Hero Pro Tier ($100 One-Time):** 500 files/batch, all 8 master spreadsheets, multi-tax splits (GST/VAT/Sales Tax), math check engine, duplicate suppression, commercial license. *(Over 80% of buyers select this tier)*.
  * **Agency Tier ($249 One-Time):** Unlimited batch, 10 team seats, VIP prompt customizer.
* **Hosting Cost:** ~$0/month on Vercel Hobby or Cloudflare Pages.
* **Compute Overhead:** $0.00 to you! Users bring their own Google Gemini or OpenAI API key.
* **Net Profit Margin:** **>94%** after Lemon Squeezy processing fees.

---

## 2. Lemon Squeezy Store Setup (Step-by-Step)

### Step 2.1: Create Products in Lemon Squeezy
1. Log into your [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com).
2. Go to **Products** > **New Product**.
3. Create the 3 Products:
   - **Name:** `GridVault Pro (Lifetime License)`
   - **Pricing Model:** Single payment → `$100.00`
   - **Description:** "Automated Document, Invoice & Receipt-to-Excel Extractor + 8 Turnkey Master Workbooks (BYOK)."
   - Check **"Generate License Keys"**:
     - Activation limit: `3` (Allows buyer to use on laptop, desktop, and work device).
4. Repeat for the **Solo Tier ($69)** with activation limit `1` and **Agency Tier ($249)** with activation limit `10`.

### Step 2.2: Obtain API Key for Verification
1. In Lemon Squeezy, navigate to **Settings** > **API Keys**.
2. Click **Create API Key** and name it `GridVault Production Key`.
3. Copy the key and store it in your deployment environment variables if using server-side webhook checks.

---

## 3. Production Deployment Guide (Vercel)

### 3.1 One-Click Deployment via Vercel CLI or GitHub
1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: complete GridVault Pro release"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/gridvault-pro.git
   git push -u origin main
   ```
2. Import the project into [Vercel](https://vercel.com/new).
3. Framework Preset: **Next.js**.
4. Root Directory: `./` (or `gridvault-pro`).
5. Click **Deploy**. Your app will be live on `https://your-app.vercel.app` in under 90 seconds.

---

## 4. 30-Day Marketing & Launch Playbook ($10,000 Target)

### Phase 1: Days 1–10 (Short-Form Video Proof)
* **Video Concept (30-second screen recording):**
  * *Hook:* "Stop paying $35/month to extract receipts into Excel."
  * *Visual:* Show 50 PDFs/images dragged into GridVault Pro.
  * *Action:* Show the live confidence table populating in real time, auto-highlighting a math error in amber and a duplicate bill in red.
  * *Climax:* Click "Export 3-Tab Excel Workbook" and open the clean pivot dashboard in Microsoft Excel.
  * *CTA:* "Get lifetime access for $100 once. Link in bio."
* **Platforms:** TikTok, YouTube Shorts, Instagram Reels, LinkedIn.

### Phase 2: Days 11–20 (Community & Lifetime Deal Launch)
* **Reddit Distribution:**
  * **r/smallbusiness:** "How we eliminated our $360/year Dext/Expensify bills with a BYOK micro-app."
  * **r/excel:** "Built a tool that turns crumpled supplier bills directly into 3-tab pivot workbooks with GST/VAT split."
  * **r/freelance:** "Taxes suck: Here is an automated receipt extractor that costs $0 in subscriptions."
* **Product Hunt:**
  * Launch tag: *GridVault Pro — Anti-Subscription Receipt OCR for Excel*.
  * Offer an early-bird promo code (e.g. `PH50` for $50 off the Agency tier).

### Phase 3: Days 21–30 (The CPA & Bookkeeper Affiliate Flywheel)
* Set up a **30% Affiliate Commission ($30 per sale)** inside Lemon Squeezy Affiliates.
* Reach out to 50 YouTube Excel creators and freelance bookkeepers on LinkedIn:
  > *"Hey [Name], loved your Excel pivot tutorial. I built GridVault Pro—a $100 lifetime utility that turns batches of receipts into 3-tab audit workbooks. Many of your audience are sick of paying Lido/Expensify $30/mo. We offer 30% lifetime affiliate commissions ($30/sale). Would you like a free review key?"*

---

## 5. Security & Founder Testing Master Keys

* **Founder Master License Key:** `GVPRO-FOUNDER-2026-LIFETIME`
* **Demo Sandbox Key:** `DEMO-SANDBOX-PRO-KEY`
* Both keys automatically bypass the Lemon Squeezy API check and grant unrestricted Pro Lifetime access for testing and demonstrations.
