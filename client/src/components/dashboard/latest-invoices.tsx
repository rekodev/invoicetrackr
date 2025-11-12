import { getTranslations } from 'next-intl/server';

import { Currency } from '@/lib/types/currency';
import { getLatestInvoices } from '@/api/invoice';
import { isResponseError } from '@/lib/utils/error';

import ClientCard from '../ui/client-card';
import ViewAllInvoicesButton from './view-all-invoices-button';

type Props = {
  userId: number;
  currency: Currency;
};

const LatestInvoices = async ({ userId, currency }: Props) => {
  const t = await getTranslations('dashboard.latest_invoices');
  const response = await getLatestInvoices(userId);

  if (isResponseError(response)) throw new Error('Failed to fetch data');

  const { invoices } = response.data;

  const renderEmptyState = () => {
    return <p className="text-default-400">{t('empty_state')}</p>;
  };

  return (
    <div className="flex w-full min-w-72 flex-col gap-6 xl:max-w-md">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-2xl">{t('title')}</h2>
        <ViewAllInvoicesButton />
      </div>
      <div className="flex flex-col gap-2">
        {invoices?.length
          ? invoices.map((invoiceData) => (
              <ClientCard
                truncate
                key={invoiceData.id}
                currency={currency}
                client={{
                  email: invoiceData.email,
                  name: invoiceData.name
                }}
                amount={invoiceData.totalAmount}
                hideIcon
              />
            ))
          : renderEmptyState()}
      </div>
    </div>
  );
};

export default LatestInvoices;
