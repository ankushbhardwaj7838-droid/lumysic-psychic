/**
 * International Currency & IP/Geo Detection Engine
 * Supports USA (USD $), UK (GBP £), Dubai/UAE (AED), India (INR ₹), Europe (EUR €), Canada (CAD CA$), Australia (AUD A$)
 */

export interface CountryInfo {
  code: string; // ISO 2-letter
  dialCode: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  rateMultiplierFromGBP: number;
}

export const COUNTRIES: CountryInfo[] = [
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', rateMultiplierFromGBP: 1.30 },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', rateMultiplierFromGBP: 1.00 },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates (Dubai)', flag: '🇦🇪', currency: 'AED', currencySymbol: 'AED ', rateMultiplierFromGBP: 4.75 },
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹', rateMultiplierFromGBP: 105.0 },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: 'CA$', rateMultiplierFromGBP: 1.75 },
  { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺', currency: 'AUD', currencySymbol: 'A$', rateMultiplierFromGBP: 1.95 },
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪', currency: 'EUR', currencySymbol: '€', rateMultiplierFromGBP: 1.18 },
  { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€', rateMultiplierFromGBP: 1.18 },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', currencySymbol: 'SAR ', rateMultiplierFromGBP: 4.88 },
  { code: 'QA', dialCode: '+974', name: 'Qatar', flag: '🇶🇦', currency: 'QAR', currencySymbol: 'QAR ', rateMultiplierFromGBP: 4.73 },
  { code: 'KW', dialCode: '+965', name: 'Kuwait', flag: '🇰🇼', currency: 'KWD', currencySymbol: 'KWD ', rateMultiplierFromGBP: 0.40 },
  { code: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', currencySymbol: 'S$', rateMultiplierFromGBP: 1.74 },
  { code: 'NZ', dialCode: '+64', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', currencySymbol: 'NZ$', rateMultiplierFromGBP: 2.12 },
  { code: 'IE', dialCode: '+353', name: 'Ireland', flag: '🇮🇪', currency: 'EUR', currencySymbol: '€', rateMultiplierFromGBP: 1.18 },
  { code: 'ES', dialCode: '+34', name: 'Spain', flag: '🇪🇸', currency: 'EUR', currencySymbol: '€', rateMultiplierFromGBP: 1.18 },
  { code: 'IT', dialCode: '+39', name: 'Italy', flag: '🇮🇹', currency: 'EUR', currencySymbol: '€', rateMultiplierFromGBP: 1.18 },
  { code: 'NL', dialCode: '+31', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', currencySymbol: '€', rateMultiplierFromGBP: 1.18 },
  { code: 'CH', dialCode: '+41', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', currencySymbol: 'CHF ', rateMultiplierFromGBP: 1.15 },
  { code: 'ZA', dialCode: '+27', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', currencySymbol: 'R ', rateMultiplierFromGBP: 23.5 },
  { code: 'PK', dialCode: '+92', name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', currencySymbol: 'Rs ', rateMultiplierFromGBP: 360.0 },
  { code: 'BD', dialCode: '+880', name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT', currencySymbol: 'Tk ', rateMultiplierFromGBP: 152.0 },
];

export const CURRENCY_CONFIG: Record<string, { symbol: string; rate: number; name: string }> = {
  USD: { symbol: '$', rate: 1.30, name: 'US Dollar' },
  GBP: { symbol: '£', rate: 1.00, name: 'British Pound' },
  AED: { symbol: 'AED ', rate: 4.75, name: 'UAE Dirham' },
  INR: { symbol: '₹', rate: 105.0, name: 'Indian Rupee' },
  EUR: { symbol: '€', rate: 1.18, name: 'Euro' },
  CAD: { symbol: 'CA$', rate: 1.75, name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', rate: 1.95, name: 'Australian Dollar' },
  SAR: { symbol: 'SAR ', rate: 4.88, name: 'Saudi Riyal' },
  QAR: { symbol: 'QAR ', rate: 4.73, name: 'Qatari Riyal' },
  SGD: { symbol: 'S$', rate: 1.74, name: 'Singapore Dollar' },
};

/**
 * Detects user country & currency based on stored preference, IP/Server headers, or timezone heuristics
 */
export async function detectUserGeo(): Promise<CountryInfo> {
  // 1. Check if user already manually selected
  const savedCurrency = localStorage.getItem('astral_currency');
  const savedCountryCode = localStorage.getItem('astral_country');

  if (savedCountryCode) {
    const found = COUNTRIES.find(c => c.code === savedCountryCode);
    if (found) return found;
  }
  if (savedCurrency) {
    const found = COUNTRIES.find(c => c.currency === savedCurrency);
    if (found) return found;
  }

  // 2. Try server-side IP detection endpoint
  try {
    const res = await fetch('/api/geo', { signal: AbortSignal.timeout(1800) });
    if (res.ok) {
      const data = await res.json();
      if (data.country) {
        const match = COUNTRIES.find(c => c.code.toUpperCase() === data.country.toUpperCase());
        if (match) {
          localStorage.setItem('astral_country', match.code);
          localStorage.setItem('astral_currency', match.currency);
          return match;
        }
      }
    }
  } catch {
    // fallback to client heuristics
  }

  // 3. Fallback to client browser timezone heuristic
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const tzLower = tz.toLowerCase();
    if (tzLower.includes('dubai') || tzLower.includes('abu_dhabi') || tzLower.includes('muscat')) {
      return COUNTRIES.find(c => c.code === 'AE')!;
    }
    if (tzLower.includes('london') || tzLower.includes('belfast') || tzLower.includes('europe/london')) {
      return COUNTRIES.find(c => c.code === 'GB')!;
    }
    if (tzLower.includes('kolkata') || tzLower.includes('calcutta') || tzLower.includes('india')) {
      return COUNTRIES.find(c => c.code === 'IN')!;
    }
    if (
      tzLower.includes('new_york') || 
      tzLower.includes('los_angeles') || 
      tzLower.includes('chicago') || 
      tzLower.includes('denver') || 
      tzLower.includes('phoenix') ||
      tzLower.startsWith('america/')
    ) {
      return COUNTRIES.find(c => c.code === 'US')!;
    }
    if (tzLower.includes('toronto') || tzLower.includes('vancouver') || tzLower.includes('edmonton')) {
      return COUNTRIES.find(c => c.code === 'CA')!;
    }
    if (tzLower.includes('sydney') || tzLower.includes('melbourne') || tzLower.includes('brisbane') || tzLower.includes('perth')) {
      return COUNTRIES.find(c => c.code === 'AU')!;
    }
    if (tzLower.includes('paris') || tzLower.includes('berlin') || tzLower.includes('rome') || tzLower.includes('madrid')) {
      return COUNTRIES.find(c => c.code === 'FR') || COUNTRIES.find(c => c.code === 'DE')!;
    }
  } catch {
    // ignore
  }

  // Default to US (USD) or GB (GBP)
  return COUNTRIES.find(c => c.code === 'US') || COUNTRIES[0];
}

/**
 * Format rate per minute dynamically into the user's currency
 */
export function formatCurrencyPrice(baseGbpRate: number, currencyCode: string = 'USD'): {
  currentPrice: string;
  originalPrice: string;
  symbol: string;
  currentNumber: number;
} {
  const conf = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  const multiplier = conf.rate;
  const symbol = conf.symbol;

  if (currencyCode === 'INR') {
    // For INR, scale to standard mobile app rates e.g. ₹30 - ₹45/min
    const discounted = Math.round(baseGbpRate * 15);
    const original = Math.round(discounted * 2.8);
    return {
      currentPrice: `${symbol}${discounted}`,
      originalPrice: `${symbol}${original}`,
      symbol,
      currentNumber: discounted
    };
  }

  if (currencyCode === 'AED') {
    const converted = baseGbpRate * multiplier;
    const discounted = converted.toFixed(2);
    const original = (converted * 2.2).toFixed(2);
    return {
      currentPrice: `${symbol}${discounted}`,
      originalPrice: `${symbol}${original}`,
      symbol,
      currentNumber: Number(discounted)
    };
  }

  if (currencyCode === 'GBP') {
    const discounted = baseGbpRate.toFixed(2);
    const original = (baseGbpRate * 2.2).toFixed(2);
    return {
      currentPrice: `${symbol}${discounted}`,
      originalPrice: `${symbol}${original}`,
      symbol,
      currentNumber: baseGbpRate
    };
  }

  // Default USD, CAD, AUD, EUR
  const converted = baseGbpRate * multiplier;
  const discounted = converted.toFixed(2);
  const original = (converted * 2.2).toFixed(2);
  return {
    currentPrice: `${symbol}${discounted}`,
    originalPrice: `${symbol}${original}`,
    symbol,
    currentNumber: Number(discounted)
  };
}
