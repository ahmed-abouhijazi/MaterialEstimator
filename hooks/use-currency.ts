import { useLocale } from "@/lib/locale-context"
import { convertPrice, formatCurrency, getCurrencySymbol } from "@/lib/currency"

/**
 * Custom hook for currency conversion and formatting
 */
export function useCurrency() {
  const { currency } = useLocale()

  /**
   * Convert a price from product currency to user's preferred currency
   */
  const convertToUserCurrency = (amount: number, fromCurrency: string): number => {
    return convertPrice(amount, fromCurrency, currency)
  }

  /**
   * Format a price in user's currency
   */
  const formatPrice = (amount: number, fromCurrency?: string): string => {
    const convertedAmount = fromCurrency 
      ? convertToUserCurrency(amount, fromCurrency)
      : amount
    return formatCurrency(convertedAmount, currency)
  }

  /**
   * Get user's currency symbol
   */
  const symbol = getCurrencySymbol(currency)

  return {
    currency,
    symbol,
    convertToUserCurrency,
    formatPrice,
  }
}
