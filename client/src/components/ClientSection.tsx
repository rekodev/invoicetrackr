'use client';

import { Spinner } from '@nextui-org/react';
import { ChangeEvent, useMemo, useState } from 'react';

import useGetClients from '@/hooks/useGetClients';
import { ClientModel } from '@/types/models/client';
import { InvoicePartyBusinessType } from '@/types/models/invoice';

import ClientSectionBottomContent from './ClientSectionBottomContent';
import ClientSectionTopContent from './ClientSectionTopContent';
import InvoicePartyCard from './InvoicePartyCard';

const PER_PAGE = 8;
const INVOICE_PARTY_BUSINESS_TYPES: Array<InvoicePartyBusinessType> = [
  'individual',
  'business',
];

const ClientSection = () => {
  const { clients, isClientsLoading } = useGetClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilters, setTypeFilters] = useState<Set<InvoicePartyBusinessType>>(
    new Set(INVOICE_PARTY_BUSINESS_TYPES)
  );

  const hasSearchFilter = Boolean(searchTerm);

  const filteredItems = useMemo(() => {
    if (!clients) return [];

    let filteredClients = [...clients];

    if (hasSearchFilter) {
      filteredClients = filteredClients.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filteredClients = filteredClients.filter((client) =>
      Array.from(typeFilters).includes(client.businessType)
    );

    return filteredClients;
  }, [clients, hasSearchFilter, searchTerm, typeFilters]);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const renderClient = (client: ClientModel, index: number) => {
    const isItemInCurrentPageRange =
      index >= (page - 1) * PER_PAGE && index < page * PER_PAGE;

    if (!isItemInCurrentPageRange) return;

    return (
      <InvoicePartyCard
        key={client.id}
        type='receiver'
        address={client.address}
        businessNumber={client.businessNumber}
        businessType={client.businessType}
        name={client.name}
      />
    );
  };

  const renderSectionContent = () => {
    if (isClientsLoading)
      return (
        <div className='min-h-[480px] h-0'>
          <Spinner color='secondary' className='m-auto w-full h-full' />
        </div>
      );

    return (
      <div className='min-h-[480px]'>
        <div className='grid gap-4 grid-cols-1 sm:grid-cols-2'>
          {filteredItems?.map((client, index) => renderClient(client, index))}
        </div>
      </div>
    );
  };

  return (
    <section className='flex flex-col gap-4'>
      <ClientSectionTopContent
        clients={filteredItems}
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        typeFilters={typeFilters}
        setTypeFilters={setTypeFilters}
      />
      {renderSectionContent()}
      <ClientSectionBottomContent
        page={page}
        setPage={setPage}
        clientsLength={filteredItems?.length}
      />
    </section>
  );
};

export default ClientSection;
