import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency
 */
export function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return "N/A";
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats a number with thousand separators
 */
export function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null) return "N/A";
  return new Intl.NumberFormat('en-GB').format(value);
}
