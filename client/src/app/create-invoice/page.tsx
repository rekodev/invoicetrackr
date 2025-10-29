import type { Metadata } from 'next';

import FreeInvoiceForm from '@/components/invoice/free-invoice-form';

export const metadata: Metadata = {
  title: 'Create a Free Invoice',
  description:
    'Generate professional invoices for free. Customize line items, add a signature, then download or share your invoice instantly.',
  alternates: { canonical: '/create-invoice' },
  openGraph: {
    title: 'Create a Free Invoice · InvoiceTrackr',
    description:
      'Generate professional invoices for free. Customize, preview, and download your invoice in minutes.',
    url: '/create-invoice'
  },
  robots: { index: true, follow: true }
};

export default function CreateInvoicePage() {
  return <FreeInvoiceForm />;
}
