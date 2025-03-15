import { InvoiceService } from "../types/models/invoice";

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const validateInvoiceId = (invoiceId: string) => {
  const regex = /^[A-Za-z]{3}[1-9][0-9]*$/;
  return regex.test(invoiceId);
};

export const splitInvoiceId = (invoiceId: string) => {
  const series = invoiceId?.slice(0, 3);
  const number = invoiceId?.slice(3);

  return [series, number];
};

export const getDaysUntilDueDate = (date: string, dueDate: string) => {
  const date1 = new Date(date);
  const date2 = new Date(dueDate);

  const diffTime = date2.getTime() - date1.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays;
};

export const calculateServiceTotal = (services: Array<InvoiceService>) =>
  services.reduce((acc, currentValue) => acc + Number(currentValue.amount), 0);
