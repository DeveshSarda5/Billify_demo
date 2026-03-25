/**
 * Format amount as Indian Rupees
 * @param amount - The numeric amount to format
 * @returns Formatted string with ₹ symbol and commas
 */
export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

/**
 * Format amount as Indian Rupees without symbol (for chart tooltips)
 * @param amount - The numeric amount to format
 * @returns Formatted string with commas only
 */
export function formatINRValue(amount: number): string {
  return amount.toLocaleString("en-IN");
}

/**
 * Format currency using Intl.NumberFormat with Indian Rupees
 * @param amount - The numeric amount to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string with ₹ symbol and proper localization
 */
export function formatCurrency(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}
