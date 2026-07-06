import type { Currency } from '../types/currency';

export const getCurrencySymbol = (currencyCode: Currency | undefined) => {
  switch (currencyCode) {
    case 'eur':
      return '€';
    default:
      return '€';
  }
};

export function convertToSubcurrency(amount: number, factor = 100) {
  return Math.round(amount * factor);
}
