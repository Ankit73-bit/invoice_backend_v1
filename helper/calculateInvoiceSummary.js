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

  const updatedItems = items.map((item) => {
    const total =
      item.total ??
      (item.unitPrice && item.quantity
        ? round2(parseFloat(item.unitPrice) * item.quantity)
        : 0);

    totalBeforeGST += total;
    return { ...item, total };
  });

  totalBeforeGST = round2(totalBeforeGST);

  let cgst = 0,
    sgst = 0,
    igst = 0,
    fuelSurcharge = 0;

  if (gstType === "CGST" || gstType === "SGST") {
    cgst = round2((cgstRate / 100) * totalBeforeGST);
    sgst = round2((sgstRate / 100) * totalBeforeGST);
  } else if (gstType === "IGST") {
    igst = round2((igstRate / 100) * totalBeforeGST);
  }

  if (fuelSurchargeRate > 0) {
    fuelSurcharge = round2((fuelSurchargeRate / 100) * totalBeforeGST);
  }

  // Calculate totalAmount before rounding
  const totalAmount = round2(
    totalBeforeGST + cgst + sgst + igst + fuelSurcharge
  );

  const decimalPart = totalAmount % 1;
  let roundingOff = decimalPart < 0.5 ? -decimalPart : 1 - decimalPart;

  roundingOff = parseFloat(roundingOff.toFixed(2));

  const grossAmount = round2(totalAmount + roundingOff);

  return {
    items: updatedItems,
    totalBeforeGST,
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
      totalAmount,
    },
    roundingOff,
    grossAmount,
  };
}
