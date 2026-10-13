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

export const formatMoney = (
  amount: string | number,
  locale: string,
  currency: string | null = 'eur'
) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: (currency || 'eur').toUpperCase()
  }).format(Number(amount));

export const formatPlainAmount = (amount: string, locale: string) =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false
  }).format(Number(amount));
