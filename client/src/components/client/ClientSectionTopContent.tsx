'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Selection,
} from "@heroui/react";
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';

import { ClientModel } from '@/lib/types/models/client';
import { InvoicePartyBusinessType } from '@/lib/types/models/invoice';
import { capitalize } from '@/lib/utils';

import AddNewClientModal from './AddNewClientModal';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { PlusIcon } from '../icons/PlusIcon';
import SearchIcon from '../icons/SearchIcon';

const filters = ['business', 'individual'];

type Props = {
  userId: number;
  clients: Array<ClientModel> | undefined;
  searchTerm: string;
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
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
  setTypeFilters,
}: Props) => {
  const [isAddNewClientModalOpen, setIsAddNewClientModalOpen] = useState(false);

  const handleAddNewClient = () => {
    setIsAddNewClientModalOpen(true);
  };

  const handleCloseAddNewClientModal = () => {
    setIsAddNewClientModalOpen(false);
  };

  const renderTypeFilterSelect = () => (
    <Dropdown>
      <DropdownTrigger className='hidden sm:flex'>
        <Button
          endContent={<ChevronDownIcon className='text-small' />}
          variant='flat'
        >
          Type
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label='Table Columns'
        closeOnSelect={false}
        selectionMode='multiple'
        selectedKeys={typeFilters}
        onSelectionChange={setTypeFilters as (keys: Selection) => any}
      >
        {filters.map((filter) => (
          <DropdownItem key={filter} className='capitalize'>
            {capitalize(filter)}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <>
      <div className='flex flex-col gap-4'>
        <div className='flex justify-between gap-3 items-end'>
          <Input
            isClearable
            className='w-full sm:max-w-[44%]'
            placeholder='Search by name...'
            startContent={<SearchIcon width={16} height={16} />}
            value={searchTerm}
            onChange={onSearch}
            onClear={onClear}
          />
          <div className='flex gap-3'>
            {renderTypeFilterSelect()}
            <Button
              color='secondary'
              endContent={<PlusIcon width={16} height={16} />}
              onPress={handleAddNewClient}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-default-400 text-small'>
            {clients
              ? clients.length === 1
                ? `Total 1 client`
                : `Total ${clients.length} clients`
              : 'Total 0 clients'}
          </span>
        </div>
      </div>

      <AddNewClientModal
        userId={userId}
        isOpen={isAddNewClientModalOpen}
        onClose={handleCloseAddNewClientModal}
      />
    </>
  );
};

export default ClientSectionTopContent;
