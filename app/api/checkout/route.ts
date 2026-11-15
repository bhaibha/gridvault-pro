import { NextResponse } from "next/server";
import { checkoutUrl } from "@/lib/checkout";

export const dynamic = "force-dynamic";

export function GET() {
  const checkout = checkoutUrl();
  if (!checkout) {
    return NextResponse.json({ error: "Checkout is currently unavailable." }, { status: 503 });
  }
  return NextResponse.redirect(checkout);
}
