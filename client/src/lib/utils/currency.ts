export const getCurrencySymbol = (currencyCode: string) => {
  switch (currencyCode) {
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    default:
      return '$';
  }
};
