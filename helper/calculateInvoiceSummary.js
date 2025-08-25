const round2 = (num) => Math.round(num * 100) / 100;

export default function calculateInvoiceSummary({
  items = [],
  gstType = "None", // "CGST", "SGST", "IGST", "None"
  cgstRate = 0,
  sgstRate = 0,
  igstRate = 0,
  fuelSurchargeRate = 0,
}) {
  let totalBeforeGST = 0;
  let taxableAmount = 0;
  let nonTaxableAmount = 0;

  const updatedItems = items.map((item) => {
    const total =
      item.total ??
      (item.unitPrice && item.quantity
        ? round2(parseFloat(item.unitPrice) * item.quantity)
        : 0);

    totalBeforeGST += total;

    // Set default applyGST to true if not specified
    const applyGST = item.applyGST !== false;

    if (applyGST) {
      taxableAmount += total;
    } else {
      nonTaxableAmount += total;
    }

    return { ...item, total, applyGST };
  });

  totalBeforeGST = round2(totalBeforeGST);
  taxableAmount = round2(taxableAmount);
  nonTaxableAmount = round2(nonTaxableAmount);

  let cgst = 0,
    sgst = 0,
    igst = 0,
    fuelSurcharge = 0;

  // Apply GST only to taxable items
  if (gstType === "CGST" || gstType === "SGST") {
    cgst = round2((cgstRate / 100) * taxableAmount);
    sgst = round2((sgstRate / 100) * taxableAmount);
  } else if (gstType === "IGST") {
    igst = round2((igstRate / 100) * taxableAmount);
  }

  if (fuelSurchargeRate > 0) {
    fuelSurcharge = round2((fuelSurchargeRate / 100) * taxableAmount);
  }

  // Calculate totalAmount before rounding
  const totalGSTAmount = round2(cgst + sgst + igst + fuelSurcharge);
  const totalAmount = round2(totalBeforeGST + totalGSTAmount);

  const decimalPart = totalAmount % 1;
  let roundingOff = decimalPart < 0.5 ? -decimalPart : 1 - decimalPart;
  roundingOff = parseFloat(roundingOff.toFixed(2));

  const grossAmount = round2(totalAmount + roundingOff);

  return {
    items: updatedItems,
    totalBeforeGST,
    taxableAmount, // Added for reference
    nonTaxableAmount, // Added for reference
    gstDetails: {
      type: gstType,
      cgstRate,
      sgstRate,
      igstRate,
      cgst,
      sgst,
      igst,
      fuelSurchargeRate,
      fuelSurcharge,
      totalGSTAmount, // Added this field
      totalAmount: grossAmount, // This should be the final gross amount
    },
    roundingOff,
    grossAmount,
  };
}
