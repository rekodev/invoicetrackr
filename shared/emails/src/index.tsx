import React from 'react';
import { render } from '@react-email/render';
import { InvoiceEmail, type InvoiceEmailProps } from './invoice-email';

export const renderInvoiceEmail = (props: InvoiceEmailProps) => {
  return render(<InvoiceEmail {...props} />);
};

export { InvoiceEmail };
export type { InvoiceEmailProps };
