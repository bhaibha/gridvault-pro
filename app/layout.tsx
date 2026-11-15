// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GridVault Pro | $100 Lifetime Document-to-Spreadsheet Suite",
  description:
    "Extract invoice and receipt data into an editable Excel workbook for review.",
  keywords: [
    "receipt to excel",
    "invoice ocr",
    "pdf to spreadsheet",
    "lemon squeezy lifetime license",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
