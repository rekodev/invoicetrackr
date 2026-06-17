'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  buttonVariants
} from '@heroui/react';
import {
  EllipsisVerticalIcon,
  PencilIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { ClientBody } from '@invoicetrackr/types';
import EmptyState from '@/components/empty-state';
import useClientSearchAndFilter from '@/lib/hooks/client/use-client-search-and-filter';

import ClientCard from '../client-card';
import ClientFormDialog from './client-form-dialog';
import ClientSectionBottomContent from './client-section-bottom-content';
import ClientSectionTopContent from './client-section-top-content';
import DeleteClientModal from './delete-client-modal';

const PER_PAGE = 8;

type Props = {
  userId: number;
  clients: Array<ClientBody>;
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

  const [currentClientData, setCurrentClientData] = useState<ClientBody>();
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isDeleteClientModalOpen, setIsDeleteClientModalOpen] = useState(false);

  const handleCloseEditClientModal = () => {
    setIsEditClientModalOpen(false);
  };

  const handleOpenDeleteClientModal = (clientData: ClientBody) => {
    setCurrentClientData(clientData);
    setIsDeleteClientModalOpen(true);
  };

  const handleCloseDeleteClientModal = () => {
    setIsDeleteClientModalOpen(false);
  };

  const handleEditClient = (clientData: ClientBody) => {
    setCurrentClientData(clientData);
    setIsEditClientModalOpen(true);
  };

  const renderMobileClientCardActions = (clientData: ClientBody) => (
    <Dropdown>
      <DropdownTrigger
        className={buttonVariants({
          variant: 'tertiary',
          size: 'sm',
          className:
            'absolute right-2 top-2 flex items-center justify-center p-0 sm:hidden'
        })}
      >
        <EllipsisVerticalIcon className="h-5 w-5" />
      </DropdownTrigger>
      <DropdownPopover>
        <DropdownMenu>
          <DropdownItem
            key="edit-client"
            id="edit-client"
            textValue={t('edit')}
            onAction={() => handleEditClient(clientData)}
          >
            <div className="flex items-center gap-1">
              <PencilIcon className="h-4 w-4" />
              {t('edit')}
            </div>
          </DropdownItem>
          <DropdownItem
            key="remove-client"
            id="remove-client"
            textValue={t('remove')}
            variant="danger"
            onAction={() => handleOpenDeleteClientModal(clientData)}
          >
            <div className="flex items-center gap-1">
              <TrashIcon className="h-4 w-4" />
              {t('remove')}
            </div>
          </DropdownItem>
        </DropdownMenu>
      </DropdownPopover>
    </Dropdown>
  );

  const renderClientCardActions = (clientData: ClientBody) => (
    <>
      {renderMobileClientCardActions(clientData)}
      <div className="pointer-events-none absolute right-2 top-2 z-10 hidden gap-0.5 opacity-0 transition group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 sm:flex">
        <Button
          isIconOnly
          className="min-w-unit-10 w-unit-16 h-unit-8 cursor-pointer"
          variant="tertiary"
          size="sm"
          onPress={() => handleEditClient(clientData)}
        >
          <PencilSquareIcon className="h-4 w-4" />
        </Button>
        <Button
          isIconOnly
          variant="danger-soft"
          size="sm"
          className="min-w-unit-8 w-unit-8 h-unit-8 cursor-pointer"
          onPress={() => handleOpenDeleteClientModal(clientData)}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </>
  );

  const renderClient = (client: ClientBody, index: number) => {
    const isItemInCurrentPageRange =
      index >= (page - 1) * PER_PAGE && index < page * PER_PAGE;

    if (!isItemInCurrentPageRange) return;

    return (
      <ClientCard
        key={client.id}
        fullDetails
        client={client}
        actions={renderClientCardActions(client)}
      />
    );
  };

  const renderSectionContent = () => {
    if (!clients?.length)
      return (
        <EmptyState
          className="min-h-[480px]"
          title={t('empty_state.title')}
          description={t('empty_state.description')}
        />
      );

    if (!filteredItems?.length)
      return (
        <EmptyState
          className="min-h-[480px]"
          title={t('empty_state.no_results_title')}
          description={t('empty_state.no_results_description')}
        />
      );

    return (
      <>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems?.map((client, index) => renderClient(client, index))}
        </div>
        <ClientSectionBottomContent
          page={page}
          setPage={setPage}
          clientsLength={filteredItems?.length}
        />
      </>
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
      <div className="min-h-[480px]">{renderSectionContent()}</div>
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
