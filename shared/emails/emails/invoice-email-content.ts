import type { InvoiceEmailContent } from '@invoicetrackr/types';

export type InvoiceEmailTemplateInput = {
  language: 'lt' | 'en';
  kind: 'invoice' | 'reminder';
  invoiceNumber: string;
  totalAmount: string;
  outstandingAmount: string;
  currency: string;
  dueDate: string;
  today: string;
};

export const getInvoiceEmailDefaults = ({ language, kind, invoiceNumber, totalAmount,
  outstandingAmount, currency, dueDate, today }: InvoiceEmailTemplateInput): Pick<InvoiceEmailContent, 'subject' | 'message'> => {
  const amount = `${kind === 'reminder' ? outstandingAmount : totalAmount} ${currency.toUpperCase()}`;
  if (language === 'lt') {
    return kind === 'reminder' ? {
      subject: `Priminimas dėl sąskaitos ${invoiceNumber}`,
      message: `Primename apie ${dueDate < today ? 'pradelstą ' : ''}sąskaitą ${invoiceNumber}. Apmokėjimo terminas: ${dueDate}. Neapmokėta suma: ${amount}. Prašome atlikti mokėjimą pagal sąskaitoje nurodytus banko rekvizitus.`
    } : {
      subject: `Sąskaita ${invoiceNumber} – ${amount}`,
      message: `Siunčiame sąskaitą ${invoiceNumber}, kurios suma ${amount}. Apmokėjimo terminas: ${dueDate}. Sąskaita pridėta PDF formatu. Mokėjimą prašome atlikti pagal sąskaitoje nurodytus banko rekvizitus.`
    };
  }
  return kind === 'reminder' ? {
    subject: `Payment reminder: invoice ${invoiceNumber}`,
    message: `This is a reminder about ${dueDate < today ? 'overdue ' : ''}invoice ${invoiceNumber}. Payment due date: ${dueDate}. Outstanding amount: ${amount}. Please pay using the bank details on the invoice.`
  } : {
    subject: `Invoice ${invoiceNumber} – ${amount}`,
    message: `Please find invoice ${invoiceNumber} attached as a PDF. Total: ${amount}. Payment due date: ${dueDate}. Please pay using the bank details on the invoice.`
  };
};

export const invoiceEmailToday = () => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Vilnius',
    year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
};

export const switchInvoiceEmailLanguage = (
  current: Pick<InvoiceEmailContent, 'subject' | 'message'>,
  previousDefaults: Pick<InvoiceEmailContent, 'subject' | 'message'>,
  nextDefaults: Pick<InvoiceEmailContent, 'subject' | 'message'>
) => ({
  subject: current.subject === previousDefaults.subject ? nextDefaults.subject : current.subject,
  message: current.message === previousDefaults.message ? nextDefaults.message : current.message
});
