// Exchange rates (USD as base currency, updated May 2026)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  CAD: 1.36,
  EUR: 0.92,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CAD: 'C$',
  EUR: '€',
};

export type Currency = 'USD' | 'CAD' | 'EUR';

/**
 * Convert a price from USD to the target currency
 * @param priceUSD - Price in USD
 * @param targetCurrency - Target currency (default: USD)
 * @returns Converted price
 */
export function convertPrice(priceUSD: number | null, targetCurrency: Currency = 'USD'): number | null {
  if (priceUSD === null) return null;
  return priceUSD * EXCHANGE_RATES[targetCurrency];
}

/**
 * Convert a price between any two supported currencies.
 */
export function convertCurrencyPrice(price: number | null, fromCurrency: Currency, toCurrency: Currency): number | null {
  if (price === null) return null;
  const priceInUSD = price / EXCHANGE_RATES[fromCurrency];
  return priceInUSD * EXCHANGE_RATES[toCurrency];
}

/**
 * Get the currency symbol for the given currency
 * @param currency - Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency] || '$';
}

/**
 * Format a price in the given currency
 * @param priceUSD - Price in USD
 * @param currency - Target currency
 * @returns Formatted price string (e.g., "$25.00")
 */
export function formatPrice(priceUSD: number | null, currency: Currency = 'USD'): string {
  const converted = convertPrice(priceUSD, currency);
  if (converted === null) return 'N/A';
  return `${getCurrencySymbol(currency)}${converted.toFixed(2)}`;
}
