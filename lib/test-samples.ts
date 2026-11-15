// lib/test-samples.ts
import { ExtractedDocument, computeDuplicateHash } from "./extraction-engine";

export function getSampleStressTestBatch(): ExtractedDocument[] {
  const doc1Date = "2026-11-04";
  const doc1Vendor = "Apex Industrial Supplies Ltd";
  const doc1Ref = "INV-2026-9041";
  const steelSubtotal = 36017;
  const steelTaxPerComponent = 3241.53;
  const doc1Total = 42500.06;

  const doc2Date = "2026-11-05";
  const doc2Vendor = "Metro Electricals & Hardware";
  const doc2Ref = "RCP-4482";
  const doc2Total = 8800; // Intentional math discrepancy: Subtotal 7200 + Tax 1296 = 8496 != 8800

  const doc3Date = "2026-11-04";
  const doc3Vendor = "Apex Industrial Supplies Ltd";
  const doc3Ref = "INV-2026-9041"; // Duplicate of Doc 1
  const doc3Total = doc1Total;

  const doc4Date = "2026-11-06";
  const doc4Vendor = "Grand Continental Hotel & Dining";
  const doc4Ref = "EUR-88310";
  const doc4Total = 345.5;

  const doc5Date = "2026-11-07";
  const doc5Vendor = "Sarah Jenkins - VP Enterprise Sales";
  const doc5Ref = "BC-LEAD-01";
  const doc5Total = 0.0;

  const hash1 = computeDuplicateHash(doc1Date, doc1Vendor, doc1Ref, doc1Total);
  const hash2 = computeDuplicateHash(doc2Date, doc2Vendor, doc2Ref, doc2Total);
  const hash3 = computeDuplicateHash(doc3Date, doc3Vendor, doc3Ref, doc3Total);
  const hash4 = computeDuplicateHash(doc4Date, doc4Vendor, doc4Ref, doc4Total);
  const hash5 = computeDuplicateHash(doc5Date, doc5Vendor, doc5Ref, doc5Total);

  return [
    {
      id: "doc-sample-01",
      fileName: "Apex_Industrial_Structural_Steel.pdf",
      docType: "INVOICE",
      date: doc1Date,
      vendorOrContact: doc1Vendor,
      invoiceOrRefNo: doc1Ref,
      taxId: "27AABCA1234F1Z8",
      category: "Materials",
      currency: "INR",
      subtotal: steelSubtotal,
      cgst: steelTaxPerComponent,
      sgst: steelTaxPerComponent,
      igst: 0,
      vatOrSalesTax: 0,
      totalAmount: doc1Total,
      confidence: 0.98,
      mathVerified: true,
      isDuplicate: false,
      duplicateHash: hash1,
      notesOrEmail: "PO-8820 - Paid via RTGS Net 30",
      lineItems: [
        {
          description: "TMT Steel Rebars Fe 550D (12mm)",
          sku: "TMT-550-12",
          quantity: 25,
          unitPrice: 850,
          lineTotal: 21250,
        },
        {
          description: "Structural I-Beams (ISMB 200)",
          sku: "BEAM-200",
          quantity: 10,
          unitPrice: 1476.7,
          lineTotal: 14767,
        },
      ],
    },
    {
      id: "doc-sample-02",
      fileName: "Blurry_Thermal_Plumbing_Receipt.jpg",
      docType: "RECEIPT",
      date: doc2Date,
      vendorOrContact: doc2Vendor,
      invoiceOrRefNo: doc2Ref,
      taxId: "27MMBCA9876G1Z2",
      category: "Materials",
      currency: "INR",
      subtotal: 7200,
      cgst: 648,
      sgst: 648,
      igst: 0,
      vatOrSalesTax: 0,
      totalAmount: doc2Total, // Math discrepancy triggers MATH CHECK & drops confidence
      confidence: 0.55,
      mathVerified: false,
      isDuplicate: false,
      duplicateHash: hash2,
      notesOrEmail: "Thermal receipt faded at footer; subtotal+tax (8496) != total (8800)",
      lineItems: [
        {
          description: "CPVC High-Pressure Pipe 1-inch (10-pack)",
          sku: "CPVC-1IN",
          quantity: 4,
          unitPrice: 1800,
          lineTotal: 7200,
        },
      ],
    },
    {
      id: "doc-sample-03",
      fileName: "Apex_Industrial_Structural_Steel_COPY.pdf",
      docType: "INVOICE",
      date: doc3Date,
      vendorOrContact: doc3Vendor,
      invoiceOrRefNo: doc3Ref, // Exact duplicate invoice
      taxId: "27AABCA1234F1Z8",
      category: "Materials",
      currency: "INR",
      subtotal: steelSubtotal,
      cgst: steelTaxPerComponent,
      sgst: steelTaxPerComponent,
      igst: 0,
      vatOrSalesTax: 0,
      totalAmount: doc3Total,
      confidence: 0.98,
      mathVerified: true,
      isDuplicate: true, // Tagged duplicate
      duplicateHash: hash3,
      notesOrEmail: "Duplicate file uploaded by accounting assistant",
      lineItems: [],
    },
    {
      id: "doc-sample-04",
      fileName: "Berlin_Tech_Summit_Hotel_Bill.pdf",
      docType: "RECEIPT",
      date: doc4Date,
      vendorOrContact: doc4Vendor,
      invoiceOrRefNo: doc4Ref,
      taxId: "DE318920194",
      category: "Travel",
      currency: "EUR",
      subtotal: 290.34,
      cgst: 0,
      sgst: 0,
      igst: 0,
      vatOrSalesTax: 55.16,
      totalAmount: doc4Total,
      confidence: 0.96,
      mathVerified: true,
      isDuplicate: false,
      duplicateHash: hash4,
      notesOrEmail: "Corp Amex ending 4091 - Breakfast included",
      lineItems: [
        {
          description: "Deluxe King Room (2 Nights)",
          sku: "ROOM-DLX",
          quantity: 2,
          unitPrice: 130,
          lineTotal: 260,
        },
        {
          description: "City Tourism Surcharge",
          sku: "TAX-CITY",
          quantity: 1,
          unitPrice: 30.34,
          lineTotal: 30.34,
        },
      ],
    },
    {
      id: "doc-sample-05",
      fileName: "Enterprise_Partner_Card_Scan.png",
      docType: "BUSINESS_CARD",
      date: doc5Date,
      vendorOrContact: doc5Vendor,
      invoiceOrRefNo: doc5Ref,
      taxId: "",
      category: "Lead",
      currency: "USD",
      subtotal: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      vatOrSalesTax: 0,
      totalAmount: 0,
      confidence: 0.99,
      mathVerified: true,
      isDuplicate: false,
      duplicateHash: hash5,
      notesOrEmail: "Email: sarah.jenkins@example.com | Cell: +1 (415) 555-0132 | CloudScale AI Infrastructure",
      lineItems: [],
    },
  ];
}
