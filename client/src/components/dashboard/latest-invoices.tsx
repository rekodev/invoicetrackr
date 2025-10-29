import { getLatestInvoices } from '@/api';
import { Currency } from '@/lib/types/currency';

import ViewAllInvoicesButton from './view-all-invoices-button';
import ClientCard from '../ui/client-card';

type Props = {
  userId: number;
  currency: Currency;
};

const LatestInvoices = async ({ userId, currency }: Props) => {
  const {
    data: { invoices }
  } = await getLatestInvoices(userId);

  const renderEmptyState = () => {
    return <p className="text-default-400">No invoices to display.</p>;
  };

  return (
    <div className="flex w-full min-w-72 flex-col gap-6 xl:max-w-md">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-2xl">Latest Invoices</h2>
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
