'use client';

import { Button } from '@nextui-org/react';
import { useState } from 'react';

import useClientSearchAndFilter from '@/lib/hooks/client/useClientSearchAndFilter';
import useGetClients from '@/lib/hooks/client/useGetClients';
import { ClientModel } from '@/lib/types/models/client';

import ClientSectionBottomContent from './ClientSectionBottomContent';
import ClientSectionTopContent from './ClientSectionTopContent';
import DeleteClientModal from './DeleteClientModal';
import EditClientModal from './EditClientModal';
import TrashIcon from '../icons/TrashIcon';
import InvoicePartyCard from '../invoice/InvoicePartyCard';
import Loader from '../ui/loader';

const PER_PAGE = 8;

type Props = {
  userId: number;
};

const ClientSection = ({ userId }: Props) => {
  const { clients, isClientsLoading } = useGetClients({ userId });
  const {
    page,
    setPage,
    filteredItems,
    searchTerm,
    typeFilters,
    setTypeFilters,
    handleSearch,
    handleClearSearch,
  } = useClientSearchAndFilter(clients);

  const [currentClientData, setCurrentClientData] = useState<ClientModel>();
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isDeleteClientModalOpen, setIsDeleteClientModalOpen] = useState(false);

  const handleCloseEditClientModal = () => {
    setIsEditClientModalOpen(false);
  };

  const handleOpenDeleteClientModal = (clientData: ClientModel) => {
    setCurrentClientData(clientData);
    setIsDeleteClientModalOpen(true);
  };

  const handleCloseDeleteClientModal = () => {
    setIsDeleteClientModalOpen(false);
  };

  const handleEditClient = (clientData: ClientModel) => {
    setCurrentClientData(clientData);
    setIsEditClientModalOpen(true);
  };

  const renderClientCardActions = (clientData: ClientModel) => (
    <div className='absolute right-2 top-2 flex gap-1.5 z-10'>
      <Button
        className='min-w-unit-10 w-unit-16 h-unit-8 cursor-pointer'
        variant='bordered'
        onPress={() => handleEditClient(clientData)}
      >
        Edit
      </Button>
      <Button
        isIconOnly
        variant='bordered'
        color='danger'
        className='min-w-unit-8 w-unit-8 h-unit-8 cursor-pointer'
        onPress={() => handleOpenDeleteClientModal(clientData)}
      >
        <TrashIcon height={4} width={4} />
      </Button>
    </div>
  );

  const renderClient = (client: ClientModel, index: number) => {
    const isItemInCurrentPageRange =
      index >= (page - 1) * PER_PAGE && index < page * PER_PAGE;

    if (!isItemInCurrentPageRange) return;

    return (
      <InvoicePartyCard
        partyType={client.type}
        key={client.id}
        partyData={client}
        renderActions={() => renderClientCardActions(client)}
      />
    );
  };

  const renderSectionContent = () => {
    if (isClientsLoading) return <Loader />;

    if (!isClientsLoading && !clients?.length)
      return <div className='min-h-[480px]'>No clients found</div>;

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
        userId={userId}
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
      {currentClientData && isEditClientModalOpen && (
        <EditClientModal
          userId={userId}
          isOpen={isEditClientModalOpen}
          onClose={handleCloseEditClientModal}
          clientData={currentClientData}
        />
      )}
      {currentClientData && isDeleteClientModalOpen && (
        <DeleteClientModal
          userId={userId}
          clientData={currentClientData}
          isOpen={isDeleteClientModalOpen}
          onClose={handleCloseDeleteClientModal}
        />
      )}
    </section>
  );
};

export default ClientSection;
