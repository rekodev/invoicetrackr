'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from '@nextui-org/react';
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';

import { ClientModel } from '@/types/models/client';
import { capitalize } from '@/utils';

import AddNewClientModal from './AddNewClientModal';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { PlusIcon } from './icons/PlusIcon';
import SearchIcon from './icons/SearchIcon';

const filters = ['name'];

type Props = {
  clients: Array<ClientModel> | undefined;
  searchTerm: string;
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
};

const ClientSectionTopContent = ({ clients, searchTerm, onSearch }: Props) => {
  const [isAddNewClientModalOpen, setIsAddNewClientModalOpen] = useState(false);

  const handleAddNewClient = () => {
    setIsAddNewClientModalOpen(true);
  };

  const handleCloseAddNewClientModal = () => {
    setIsAddNewClientModalOpen(false);
  };

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
          />
          <div className='flex gap-3'>
            <Dropdown>
              <DropdownTrigger className='hidden sm:flex'>
                <Button
                  endContent={<ChevronDownIcon className='text-small' />}
                  variant='flat'
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label='Table Columns'
                closeOnSelect={false}
                selectionMode='multiple'
              >
                {filters.map((filter) => (
                  <DropdownItem key={filter} className='capitalize'>
                    {capitalize(filter)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            {/* <Dropdown>
            <DropdownTrigger className='hidden sm:flex'>
              <Button
                endContent={<ChevronDownIcon className='text-small' />}
                variant='flat'
              >
                Columns
              </Button>
            </DropdownTrigger>
            {/* <DropdownMenu
              disallowEmptySelection
              aria-label='Table Columns'
              closeOnSelect={false}

              selectionMode='multiple'

            >
              {columns.map((column) => (
                <DropdownItem key={column.uid} className='capitalize'>
                  {capitalize(column.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown> */}
            <Button
              color='secondary'
              endContent={<PlusIcon width={16} height={16} />}
              onClick={handleAddNewClient}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-default-400 text-small'>
            {clients
              ? `Total ${clients.length} clients`
              : 'No clients to display'}
          </span>
        </div>
      </div>

      <AddNewClientModal
        isOpen={isAddNewClientModalOpen}
        onClose={handleCloseAddNewClientModal}
      />
    </>
  );
};

export default ClientSectionTopContent;
