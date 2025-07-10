'use client';

import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/react';
import { useState } from 'react';

import useClientSearchAndFilter from '@/lib/hooks/client/use-client-search-and-filter';
import useGetClients from '@/lib/hooks/client/use-get-clients';
import { ClientModel } from '@/lib/types/models/client';

import ClientSectionBottomContent from './client-section-bottom-content';
import ClientSectionTopContent from './client-section-top-content';
import DeleteClientModal from './delete-client-modal';
import EditClientModal from './edit-client-modal';
import InvoicePartyCard from '../invoice/invoice-party-card';
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
    handleClearSearch
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

  const renderMobileClientCardActions = (clientData: ClientModel) => (
    <Dropdown>
      <DropdownTrigger className="absolute right-2 top-2">
        <Button variant="light" size="sm" isIconOnly className="sm:hidden">
          <EllipsisVerticalIcon className="h-5 w-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem
          color="warning"
          key="edit-client"
          onPress={() => handleEditClient(clientData)}
        >
          <div className="flex items-center gap-1">
            <PencilIcon className="h-4 w-4" />
            Edit
          </div>
        </DropdownItem>
        <DropdownItem
          color="danger"
          key="remove-client"
          onPress={() => handleOpenDeleteClientModal(clientData)}
        >
          <div className="flex items-center gap-1">
            <TrashIcon className="h-4 w-4" />
            Remove
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  const renderClientCardActions = (clientData: ClientModel) => (
    <>
      {renderMobileClientCardActions(clientData)}
      <div className="absolute right-2 top-2 z-10 hidden gap-1.5 sm:flex">
        <Button
          isIconOnly
          className="min-w-unit-10 w-unit-16 h-unit-8 cursor-pointer"
          color="warning"
          variant="bordered"
          onPress={() => handleEditClient(clientData)}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          isIconOnly
          variant="bordered"
          color="danger"
          className="min-w-unit-8 w-unit-8 h-unit-8 cursor-pointer"
          onPress={() => handleOpenDeleteClientModal(clientData)}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </>
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
      return <div className="min-h-[480px]">No clients found</div>;

    return (
      <div className="min-h-[480px]">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredItems?.map((client, index) => renderClient(client, index))}
        </div>
      </div>
    );
  };

  return (
    <section className="flex flex-col gap-4">
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
