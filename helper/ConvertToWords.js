export function ConvertToWords(amount) {
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "Ten",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertBelowHundred(num) {
    if (num === 0) {
      return "";
    } else if (num < 10) {
      return units[num];
    } else if (num < 20) {
      return teens[num - 10];
    } else {
      const tenDigit = Math.floor(num / 10);
      const unitDigit = num % 10;
      return `${tens[tenDigit]} ${units[unitDigit]}`;
    }
  }

  function convertBelowThousand(num) {
    const hundredDigit = Math.floor(num / 100);
    const belowHundred = num % 100;
    const belowHundredWords = convertBelowHundred(belowHundred);
    if (hundredDigit === 0) {
      return belowHundredWords;
    } else {
      return `${units[hundredDigit]} Hundred${
        belowHundredWords ? ` and ${belowHundredWords}` : ""
      }`;
    }
  }

  let words = "";
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100); // Assuming 2 decimal places

  if (integerPart === 0 && decimalPart === 0) {
    words = "Zero";
  } else {
    if (integerPart > 0) {
      const crore = Math.floor(integerPart / 10000000);
      const lakh = Math.floor((integerPart % 10000000) / 100000);
      const thousand = Math.floor((integerPart % 100000) / 1000);
      const hundreds = Math.floor((integerPart % 1000) / 100);
      const tensPart = integerPart % 100;

      if (crore > 0) {
        words += `${convertBelowHundred(crore)} Crores `;
      }
      if (lakh > 0) {
        words += `${convertBelowThousand(lakh)} Lakhs `;
      }
      if (thousand > 0) {
        words += `${convertBelowThousand(thousand)} Thousand `;
      }
      if (hundreds > 0) {
        words += `${convertBelowHundred(hundreds)} Hundred `;
      }
      if (tensPart > 0) {
        words += `${convertBelowHundred(tensPart)} `;
      }
    }

    if (decimalPart > 0) {
      words += `and ${convertBelowHundred(decimalPart)} Paise`;
    }
  }

  return `Rupees ${words.trim()} Only`;
}

// Helper function to extract the numeric value from percentage strings like "9%"
export const extractTaxRate = (label) => {
  if (typeof label !== "string") return 0;
  const match = label.match(/(\d+)%/);
  return match ? parseFloat(match[1]) : 0;
};
