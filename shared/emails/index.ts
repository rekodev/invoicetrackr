import { render } from '@react-email/render';
import InvoiceEmail from './emails/invoice-email.js';

export { InvoiceEmail };

export const renderInvoiceEmail = (props: {
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  senderName: string;
  message: string;
  translations: {
    title: string;
    subtitle: string;
    detailsTitle: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    from: string;
    attachmentTitle: string;
    attachmentMessage: string;
    footer: string;
    copyright: string;
  };
}) => {
  return render(InvoiceEmail(props));
};
