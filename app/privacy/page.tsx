import { LandingNavbar } from "@/components/LandingNavbar";

export const metadata = { title: "Privacy | GridVault Pro" };

export default function PrivacyPage() {
  return (
    <>
      <LandingNavbar />
      <main className="mx-auto max-w-3xl p-8 space-y-6 text-sm text-slate-300">
        <h1 className="text-3xl font-bold text-white">Privacy</h1>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Document processing</h2>
          <p>When you upload a file, GridVault’s server sends it to Google Gemini for extraction. GridVault’s application does not save uploads to a database. The operator must configure a paid Gemini API project for customer uploads. Do not send invoices or other confidential files through an unpaid Gemini project. Google handles submitted content under its Gemini API terms.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Browser storage</h2>
          <p>The ledger is saved locally in this browser. Use Clear Workspace to remove the ledger from this browser or clear site data to remove both the ledger and browser activation data. Exported files remain where you save them.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Purchases and activation</h2>
          <p>Lemon Squeezy handles checkout. GridVault sends the purchase key to Lemon Squeezy for activation and stores a session cookie and activation ID in the browser.</p>
        </section>
      </main>
    </>
  );
}
