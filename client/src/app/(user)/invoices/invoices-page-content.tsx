import type { InvoiceListQuery } from '@invoicetrackr/types';

import { getInvoices } from '@/api/invoice';
import InvoiceTable from '@/components/invoice/invoice-table';
import { isResponseError } from '@/lib/utils/error';

type Props = {
  userId: number;
  query: InvoiceListQuery;
  isEmailVerified: boolean;
  preferredLanguage: string;
};

export default async function InvoicesPageContent({
  userId,
  query,
  isEmailVerified,
  preferredLanguage
}: Props) {
  const invoicesResp = await getInvoices(userId, query);

  if (isResponseError(invoicesResp)) throw new Error('Failed to fetch data');

  return (
    <InvoiceTable
      invoices={invoicesResp.data.invoices}
      pagination={invoicesResp.data.pagination}
      query={query}
      userId={userId}
      isEmailVerified={isEmailVerified}
      preferredLanguage={preferredLanguage}
    />
  );
}
