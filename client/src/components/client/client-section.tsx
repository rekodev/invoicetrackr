'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/react';
import {
  EllipsisVerticalIcon,
  PencilIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ClientModel } from '@/lib/types/models/client';
import useClientSearchAndFilter from '@/lib/hooks/client/use-client-search-and-filter';

import ClientFormDialog from './client-form-dialog';
import ClientSectionBottomContent from './client-section-bottom-content';
import ClientSectionTopContent from './client-section-top-content';
import DeleteClientModal from './delete-client-modal';
import InvoicePartyCard from '../invoice/invoice-party-card';

const PER_PAGE = 8;

type Props = {
  userId: number;
  clients: Array<ClientModel>;
};

const ClientSection = ({ userId, clients }: Props) => {
  const t = useTranslations('clients');
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
            {t('edit')}
          </div>
        </DropdownItem>
        <DropdownItem
          color="danger"
          key="remove-client"
          onPress={() => handleOpenDeleteClientModal(clientData)}
        >
          <div className="flex items-center gap-1">
            <TrashIcon className="h-4 w-4" />
            {t('remove')}
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  const renderClientCardActions = (clientData: ClientModel) => (
    <>
      {renderMobileClientCardActions(clientData)}
      <div className="absolute right-2 top-2 z-10 hidden gap-0.5 sm:flex">
        <Button
          isIconOnly
          className="min-w-unit-10 w-unit-16 h-unit-8 cursor-pointer"
          color="default"
          variant="light"
          onPress={() => handleEditClient(clientData)}
          startContent={<PencilSquareIcon className="h-5 w-5" />}
        />
        <Button
          isIconOnly
          variant="light"
          color="danger"
          className="min-w-unit-8 w-unit-8 h-unit-8 cursor-pointer"
          onPress={() => handleOpenDeleteClientModal(clientData)}
          startContent={<TrashIcon className="h-5 w-5" />}
        />
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
    if (!clients?.length)
      return <div className="min-h-[480px]">{t('no_clients')}</div>;

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
        <ClientFormDialog
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
