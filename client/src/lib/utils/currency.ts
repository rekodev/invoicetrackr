export const getCurrencySymbol = (currencyCode: string) => {
  switch (currencyCode) {
    case "eur":
      return "€";
    case "usd":
      return "$";
    default:
      return "$";
  }
};
