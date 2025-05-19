import { Currency } from '../types/currency';

export const getCurrencySymbol = (currencyCode: Currency | undefined) => {
  switch (currencyCode) {
    case 'eur':
      return '€';
    case 'usd':
      return '$';
    default:
      return '$';
  }
};

export function convertToSubcurrency(amount: number, factor = 100) {
  return Math.round(amount * factor);
}

export function getUserCurrency(): 'eur' | 'usd' {
  try {
    const locale = new Intl.Locale(navigator.language);
    const euroRegions = [
      'DE',
      'FR',
      'ES',
      'IT',
      'PT',
      'NL',
      'FI',
      'GR',
      'SK',
      'SI',
      'LV',
      'LT',
      'LU',
      'IE',
      'MT',
      'AT',
      'BE',
      'CY',
      'EE'
    ];
    return euroRegions.includes(locale.region || '') ? 'eur' : 'usd';
  } catch {
    return 'eur';
  }
}
