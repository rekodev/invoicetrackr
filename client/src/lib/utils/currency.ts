export const getCurrencySymbol = (currencyCode: string | undefined) => {
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
