import { getLatestInvoices } from '@/api';

import ClientCard from '../ui/client-card';

type Props = {
  userId: number;
  currency: string;
};

const LatestInvoices = async ({ userId, currency }: Props) => {
  const {
    data: { invoices },
  } = await getLatestInvoices(userId);

  return (
    <div className='flex flex-col gap-6'>
      <h2 className='text-2xl'>Latest Invoices</h2>
      <div className='flex flex-col gap-2'>
        {invoices?.map((invoiceData) => (
          <ClientCard
            key={invoiceData.id}
            currency={currency}
            client={{
              email: invoiceData.email,
              name: invoiceData.name,
            }}
            amount={invoiceData.totalAmount}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestInvoices;
