export interface Currency {
  code: string
  symbol: string
  name: string
  conversionRate: number // Rate to USD
}

// Currency database with conversion rates to USD (January 2026)
export const currencies: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', conversionRate: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', conversionRate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', conversionRate: 0.79 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', conversionRate: 1.35 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', conversionRate: 1.52 },
  MAD: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', conversionRate: 10.15 },
}

// Map locations to their currencies
export const locationCurrencies: Record<string, string> = {
  'United States - Northeast': 'USD',
  'United States - Southeast': 'USD',
  'United States - Midwest': 'USD',
  'United States - Southwest': 'USD',
  'United States - West Coast': 'USD',
  'Canada': 'CAD',
  'United Kingdom': 'GBP',
  'Australia': 'AUD',
  'France': 'EUR',
  'Morocco': 'MAD',
  'Other': 'USD',
}

/**
 * Get currency for a location
 */
export function getCurrencyForLocation(location: string): Currency {
  const currencyCode = locationCurrencies[location] || 'USD'
  return currencies[currencyCode]
}

/**
 * Convert price from USD to target currency
 */
export function convertPrice(priceUSD: number, targetCurrency: string): number {
  const currency = currencies[targetCurrency]
  if (!currency) return priceUSD
  
  return priceUSD * currency.conversionRate
}

/**
 * Format price with currency symbol
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = currencies[currencyCode]
  if (!currency) return `$${amount.toFixed(2)}`
  
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  
  // Place symbol appropriately
  if (currencyCode === 'MAD') {
    return `${formatted} ${currency.symbol}`
  }
  
  return `${currency.symbol}${formatted}`
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  return currencies[currencyCode]?.symbol || '$'
}
