'use client';

import { Spinner } from '@nextui-org/react';
import { ChangeEvent, useState } from 'react';

import useGetClients from '@/hooks/useGetClients';
import { ClientModel } from '@/types/models/client';

import ClientSectionBottomContent from './ClientSectionBottomContent';
import ClientSectionTopContent from './ClientSectionTopContent';
import InvoicePartyCard from './InvoicePartyCard';

const PER_PAGE = 8;

const ClientSection = () => {
  const { clients, isClientsLoading } = useGetClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const renderClient = (client: ClientModel, index: number) => {
    const { name } = client;

    const normalizedName = name.toLowerCase();
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const isItemInCurrentPageRange =
      index >= (page - 1) * PER_PAGE && index < page * PER_PAGE;

    if (!normalizedName.includes(normalizedSearchTerm)) return;

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
          {clients?.map((client, index) => renderClient(client, index))}
        </div>
      </div>
    );
  };

  return (
    <section className='flex flex-col gap-4'>
      <ClientSectionTopContent
        clients={clients}
        searchTerm={searchTerm}
        onSearch={handleSearch}
      />
      {renderSectionContent()}
      <ClientSectionBottomContent
        page={page}
        setPage={setPage}
        clientsLength={clients?.length}
      />
    </section>
  );
};

export default ClientSection;
