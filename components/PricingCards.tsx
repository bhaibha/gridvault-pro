import Link from "next/link";
import { BATCH_LIMIT } from "@/lib/workspace-limits";

import { checkoutUrl } from "@/lib/checkout";

export function PricingCards() {
  const canPurchase = Boolean(checkoutUrl());
  return (
    <div className="max-w-lg mx-auto rounded-3xl border-2 border-emerald-500 bg-slate-900 p-8">
      <h3 className="font-bold text-white text-xl">Pro license</h3>
      <p className="mt-2 text-3xl font-bold text-white">$100 <span className="text-sm text-slate-400">one-time</span></p>
      <ul className="my-6 space-y-2 text-sm text-slate-300">
        <li>Extract invoices and receipts, including line items</li>
        <li>Up to {BATCH_LIMIT} files per batch, up to 3 MB each</li>
        <li>Review flags and separate totals for each currency</li>
        <li>Excel and CSV export, plus eight Excel sample workbooks</li>
      </ul>
      {canPurchase ? (
        <a href="/api/checkout" className="block rounded-xl bg-emerald-500 px-4 py-3 text-center font-bold text-slate-950">
          Buy Pro via Lemon Squeezy
        </a>
      ) : (
        <p className="text-center text-sm text-slate-400">Checkout is currently unavailable.</p>
      )}
      <Link href="/app" className="block mt-4 text-center text-sm text-emerald-300">Try sample workspace or activate a license</Link>
    </div>
  );
}
