import { ClientModel } from '@/types/models/client';

import InvoicePartyCard from './InvoicePartyCard';

export const testSender: ClientModel = {
  id: 1,
  address: '21 Jump St.',
  businessNumber: '123456789',
  businessType: 'business',
  firstName: 'John',
  lastName: 'Doe',
  type: 'receiver',
};

const clients = [testSender, testSender, testSender, testSender, testSender];

const ClientSection = () => {
  return (
    <section>
      <div className='grid gap-2 grid-cols-1 sm:grid-cols-2'>
        {clients.map((client) => (
          <InvoicePartyCard
            key={client.id}
            type='receiver'
            address={client.address}
            businessNumber={client.businessNumber}
            businessType={client.businessType}
            firstName={client.firstName}
            lastName={client.lastName}
          />
        ))}
      </div>
    </section>
  );
};

export default ClientSection;
