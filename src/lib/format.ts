/**
 * Shared formatting utilities for currency, dates, and subscription amounts.
 * Single source of truth for display formatting across pages and components.
 */

export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

const timeOptions: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

export function formatDate(
  date: string | null,
  options: Intl.DateTimeFormatOptions = timeOptions
): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", options);
}

export function formatSubscriptionAmount(amount: number, currency: string): string {
  return currency === "USD"
    ? formatCurrency(amount, "USD")
    : `${amount.toFixed(2)} ${currency}`;
}
