'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Selection
} from '@heroui/react';
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { ClientBody, InvoicePartyBusinessType } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';

import ClientFormDialog from './client-form-dialog';

const filters = ['business', 'individual'];

type Props = {
  userId: number;
  clients: Array<ClientBody> | undefined;
  searchTerm: string;
  onSearch: (_event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  typeFilters: Set<InvoicePartyBusinessType>;
  setTypeFilters: Dispatch<SetStateAction<Set<InvoicePartyBusinessType>>>;
};

const ClientSectionTopContent = ({
  userId,
  clients,
  searchTerm,
  onSearch,
  onClear,
  typeFilters,
  setTypeFilters
}: Props) => {
  const t = useTranslations('clients.top_content');
  const tTypes = useTranslations('clients.form_dialog.business_types');
  const [isAddNewClientModalOpen, setIsAddNewClientModalOpen] = useState(false);

  const handleAddNewClient = () => {
    setIsAddNewClientModalOpen(true);
  };

  const handleCloseAddNewClientModal = () => {
    setIsAddNewClientModalOpen(false);
  };

  const totalClientsText = clients
    ? clients.length === 1
      ? t('total_singular')
      : t('total_plural', { count: clients.length })
    : t('total_plural', { count: 0 });

  const renderTypeFilterSelect = () => (
    <Dropdown>
      <DropdownTrigger className="hidden sm:flex">
        <Button
          endContent={<ChevronDownIcon className="text-small" />}
          variant="flat"
        >
          {t('type_filter')}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label={t('a11y.columns_label')}
        closeOnSelect={false}
        selectionMode="multiple"
        selectedKeys={typeFilters}
        onSelectionChange={setTypeFilters as (_keys: Selection) => any}
      >
        {filters.map((filter) => (
          <DropdownItem key={filter} className="capitalize">
            {tTypes(filter as 'business' | 'individual')}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder={t('search_placeholder')}
            startContent={<MagnifyingGlassIcon className="h-4 w-4" />}
            value={searchTerm}
            onChange={onSearch}
            onClear={onClear}
          />
          <div className="flex gap-3">
            {renderTypeFilterSelect()}
            <Button
              color="secondary"
              endContent={<PlusIcon className="h-4 w-4" />}
              onPress={handleAddNewClient}
            >
              {t('add_new')}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            {totalClientsText}
          </span>
        </div>
      </div>

      <ClientFormDialog
        userId={userId}
        isOpen={isAddNewClientModalOpen}
        onClose={handleCloseAddNewClientModal}
      />
    </>
  );
};

export default ClientSectionTopContent;
