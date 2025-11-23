import { cookies, headers } from 'next/headers';
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

export default async function CreateInvoicePage() {
  const cookieStore = await cookies();
  const language = cookieStore.get('locale')?.value || 'en';

  const headersList = await headers();
  const acceptLanguage = headersList.get('Accept-Language') || 'en-US,en;q=0.9';

  const locale = acceptLanguage
    .split(',')[0]
    .split(';')[0]
    .substring(0, 2)
    .toLowerCase();

  const currency = language === 'lt' ? 'eur' : locale === 'en' ? 'usd' : 'eur';

  return <FreeInvoiceForm language={language} currency={currency} />;
}
