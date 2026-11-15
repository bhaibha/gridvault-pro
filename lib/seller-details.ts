export function sellerDetails() {
  const legalName = process.env.GRIDVAULT_SELLER_LEGAL_NAME?.trim();
  const supportEmail = process.env.GRIDVAULT_SUPPORT_EMAIL?.trim();
  if (!legalName || !supportEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) return null;
  return { legalName, supportEmail };
}
