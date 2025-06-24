export function getCurrentFinancialYear() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed (Jan = 0)

  if (month >= 3) {
    // April or later → new financial year
    return `${String(year).slice(2)}-${String(year + 1).slice(2)}`;
  } else {
    // Jan–Mar → still part of last financial year
    return `${String(year - 1).slice(2)}-${String(year).slice(2)}`;
  }
}
