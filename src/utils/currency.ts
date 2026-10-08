/**
 * Indian Rupee (INR) Currency Utility & Formatter
 * Compliant with Indian Numbering System (Lakhs, Crores, Paisa)
 */

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

/**
 * Formats a number to Indian Rupees (e.g. ₹24,500, ₹1,50,000)
 */
export const formatINR = (
  amount: number | null | undefined,
  showPaisaOrOptions?: boolean | { showPaisa?: boolean; compact?: boolean }
): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  const isObject = typeof showPaisaOrOptions === 'object' && showPaisaOrOptions !== null;
  const compact = isObject ? showPaisaOrOptions.compact : false;
  const showPaisa = isObject ? showPaisaOrOptions.showPaisa : (showPaisaOrOptions === true);

  if (compact) {
    const abs = Math.abs(amount);
    if (abs >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
    if (abs >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
  }

  const fractionDigits = showPaisa ? 2 : (Number.isInteger(amount) ? 0 : 2);
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(amount);
};

/**
 * Formats explicitly with 2 decimal paisa (e.g. ₹24,500.00)
 */
export const formatINRPaisa = (amount: number | null | undefined): string => {
  return formatINR(amount, true);
};

/**
 * Formats large amounts without truncating
 */
export const formatINRLarge = (amount: number | null | undefined): string => {
  return formatINR(amount, false);
};
