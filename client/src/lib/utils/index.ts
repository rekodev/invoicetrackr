export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const validateInvoiceId = (invoiceId: string) => {
  const regex = /^[A-Za-z]{2,8}[1-9][0-9]*$/;
  return regex.test(invoiceId);
};

export { splitInvoiceId, getDaysUntilDueDate, calculateServiceTotal, calculateInvoiceTotals } from '@invoicetrackr/pdf/calculations';
