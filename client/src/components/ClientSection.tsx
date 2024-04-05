'use client';

import { Spinner } from '@nextui-org/react';
import { useState } from 'react';

import useClientSearchAndFilter from '@/hooks/useClientSearchAndFilter';
import useGetClients from '@/hooks/useGetClients';
import { ClientModel } from '@/types/models/client';

import ClientSectionBottomContent from './ClientSectionBottomContent';
import ClientSectionTopContent from './ClientSectionTopContent';
import DeleteClientModal from './DeleteClientModal';
import EditClientModal from './EditClientModal';
import InvoicePartyCard from './InvoicePartyCard';

const PER_PAGE = 8;

const ClientSection = () => {
  const { clients, isClientsLoading } = useGetClients();
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

  const renderClient = (client: ClientModel, index: number) => {
    const isItemInCurrentPageRange =
      index >= (page - 1) * PER_PAGE && index < page * PER_PAGE;

    if (!isItemInCurrentPageRange) return;

    return (
      <InvoicePartyCard
        key={client.id}
        partyData={client}
        onEdit={handleEditClient}
        onDelete={handleOpenDeleteClientModal}
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
      {currentClientData && isEditClientModalOpen && (
        <EditClientModal
          isOpen={isEditClientModalOpen}
          onClose={handleCloseEditClientModal}
          clientData={currentClientData}
        />
      )}
      {currentClientData && isDeleteClientModalOpen && (
        <DeleteClientModal
          clientData={currentClientData}
          isOpen={isDeleteClientModalOpen}
          onClose={handleCloseDeleteClientModal}
          onSuccess={handleCloseDeleteClientModal}
        />
      )}
    </section>
  );
};

export default ClientSection;
