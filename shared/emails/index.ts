import { render } from '@react-email/render';
import InvoiceEmail from './emails/invoice-email.js';

export { InvoiceEmail };

export const renderInvoiceEmail = (props: {
  invoiceNumber?: string;
  amount?: string;
  dueDate?: string;
  senderName?: string;
  message?: string;
}) => {
  return render(InvoiceEmail(props));
};
