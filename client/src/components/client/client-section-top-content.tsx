'use client';

import {
  Button,
  CloseButton,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  Input,
  buttonVariants
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
      <DropdownTrigger
        className={buttonVariants({
          variant: 'secondary',
          className: 'hidden items-center justify-center sm:flex'
        })}
      >
        <span>{t('type_filter')}</span>
        <ChevronDownIcon className="min-w-4 max-w-4 text-sm" />
      </DropdownTrigger>
      <DropdownPopover>
        <DropdownMenu
          disallowEmptySelection
          aria-label={t('a11y.columns_label')}
          selectionMode="multiple"
          selectedKeys={typeFilters}
          onSelectionChange={(keys) =>
            setTypeFilters(
              keys === 'all'
                ? new Set()
                : new Set(keys as Set<InvoicePartyBusinessType>)
            )
          }
        >
          {filters.map((filter) => (
            <DropdownItem
              key={filter}
              id={filter}
              textValue={tTypes(filter as 'business' | 'individual')}
              className="capitalize"
            >
              {tTypes(filter as 'business' | 'individual')}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </DropdownPopover>
    </Dropdown>
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <div className="flex w-full items-center gap-2 sm:max-w-[44%]">
            <MagnifyingGlassIcon className="h-4 w-4" />
            <Input
              variant="secondary"
              className="w-full"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={onSearch}
            />
            {searchTerm && <CloseButton aria-label="Clear" onPress={onClear} />}
          </div>
          <div className="flex gap-3">
            {renderTypeFilterSelect()}
            <Button onPress={handleAddNewClient}>
              {t('add_new')}
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-default-400 text-sm">{totalClientsText}</span>
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
