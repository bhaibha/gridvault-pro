# GridVault Pro

GridVault Pro extracts invoice and receipt fields into a reviewable Excel ledger. The sample workspace and Excel export work without a license or an AI account.

## Run locally

```sh
npm ci
npm run dev
npm test
npm run build
```

Open http://localhost:3000. Load the five-document sample in the workspace and export the workbook. Reconciled invoice and receipt amounts are grouped by currency. The Document Ledger and Line Items tabs retain review flags. The eight additional workbooks are sample layouts with example data.

## Configure a paid pilot

Copy `.env.example` to `.env.local` for local testing or set the listed variables in the hosting dashboard. Use a different set for previews and production.

1. Create a one-time Lemon Squeezy Pro variant, enable license issuance and set its activation limit to three. Copy its checkout URL, store ID and variant ID. Start in test mode and set `GRIDVAULT_CHECKOUT_ENABLED=true` on the test deployment. Checkout stays disabled by default.
2. Generate a random session signing secret with `openssl rand -hex 32`. License approval is cached in a signed, HTTP-only cookie for one hour. After expiry, re-enter the purchase key in the same browser to revalidate its activation.
3. Configure `GEMINI_PAID_API_KEY` with a server-side key for a paid Gemini API project and verify that billing is active. The application cannot verify the project billing tier from the key. Choose provider usage limits and billing alerts suitable for the pilot. Before opening public checkout, add durable per-customer usage controls and request rate limits to the hosting environment. The current browser batch limit is not a server-side usage quota.
4. Verify a test purchase, valid and invalid keys, repeat activation in the same browser, download access, and upload of representative redacted PDFs and images. Set `GRIDVAULT_SELLER_LEGAL_NAME` to the confirmed legal seller name and `GRIDVAULT_SUPPORT_EMAIL` to a mailbox you control. Test receiving and replying from it, and confirm the refund process before taking live payments. Confirm the legal disclosures and any governing-law wording for the actual seller and markets served. Review the provider’s data terms for your deployment and the types of documents you intend to accept.

The current workspace accepts up to 25 files per batch and 3 MB per file. For Google Sheets, import the Excel workbook or paste TSV.
