import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, Dispatch, SetStateAction, useCallback } from 'react';

import { ADD_NEW_INVOICE_PAGE } from '@/constants/pages';
import { columns, statusOptions } from '@/data';
import { capitalize } from '@/utils';

import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { PlusIcon } from './icons/PlusIcon';
import SearchIcon from './icons/SearchIcon';

type Props = {
  filterValue: string;
  setFilterValue: Dispatch<SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  visibleColumns: Set<string> | 'all';
  setVisibleColumns: Dispatch<SetStateAction<Set<string> | 'all'>>;
  setPage: Dispatch<SetStateAction<number>>;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  invoicesLength: number;
};

const InvoiceTableTopContent = ({
  filterValue,
  setFilterValue,
  visibleColumns,
  setVisibleColumns,
  statusFilter,
  setStatusFilter,
  setPage,
  setRowsPerPage,
  invoicesLength,
}: Props) => {
  const router = useRouter();

  const handleAddNewInvoice = () => {
    router.push(ADD_NEW_INVOICE_PAGE);
  };

  const onSearchChange = useCallback(
    (value: string) => {
      if (value) {
        setFilterValue(value);
        setPage(1);
      } else {
        setFilterValue('');
      }
    },
    [setPage, setFilterValue]
  );

  const onClear = useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, [setPage, setFilterValue]);

  const onRowsPerPageChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(event.target.value));
      setPage(1);
    },
    [setPage, setRowsPerPage]
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between gap-3 items-end'>
        <Input
          isClearable
          className='w-full sm:max-w-[44%]'
          placeholder='Search by name...'
          startContent={<SearchIcon width={16} height={16} />}
          value={filterValue}
          onClear={() => onClear()}
          onValueChange={onSearchChange}
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
              selectedKeys={statusFilter}
              selectionMode='multiple'
              onSelectionChange={setStatusFilter as any}
            >
              {statusOptions.map((status) => (
                <DropdownItem key={status.uid} className='capitalize'>
                  {capitalize(status.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger className='hidden sm:flex'>
              <Button
                endContent={<ChevronDownIcon className='text-small' />}
                variant='flat'
              >
                Columns
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label='Table Columns'
              closeOnSelect={false}
              selectedKeys={visibleColumns}
              selectionMode='multiple'
              onSelectionChange={setVisibleColumns as any}
            >
              {columns.map((column) => (
                <DropdownItem key={column.uid} className='capitalize'>
                  {capitalize(column.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button
            color='secondary'
            endContent={<PlusIcon width={16} height={16} />}
            onClick={handleAddNewInvoice}
          >
            Add New
          </Button>
        </div>
      </div>
      <div className='flex justify-between items-center'>
        <span className='text-default-400 text-small'>
          Total {invoicesLength} invoices
        </span>
        <label className='flex items-center text-default-400 text-small'>
          Rows per page:
          <select
            className='bg-transparent outline-none text-default-400 text-small'
            onChange={onRowsPerPageChange}
          >
            <option value='5'>5</option>
            <option value='10' selected>
              10
            </option>
            <option value='15'>15</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default InvoiceTableTopContent;
