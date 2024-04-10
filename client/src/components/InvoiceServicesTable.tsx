import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from '@nextui-org/react';
import { Key } from 'react';

import { InvoiceService } from '@/types/models/invoice';

import DeleteIcon from './icons/DeleteIcon';
import { PlusIcon } from './icons/PlusIcon';

const INVOICE_SERVICE_COLUMNS = [
  { name: '#', uid: 'no' },
  { name: 'DESCRIPTION', uid: 'description', sortable: true },
  { name: 'UNIT', uid: 'unit', sortable: true },
  { name: 'QUANTITY', uid: 'quantity', sortable: true },
  { name: 'AMOUNT', uid: 'amount', sortable: true },
  { name: 'ACTION', uid: 'actions' },
];

const indexedMockItems: Array<InvoiceService & { id: number }> = [
  {
    id: 1,
    description:
      'nothing nothing nothing nothing nothing nothing nothingnothing',
    unit: 'project',
    quantity: 2,
    amount: 400,
  },
];

const InvoiceServicesTable = () => {
  const renderCell = (
    service: InvoiceService & { id: number },
    columnKey: Key
  ) => {
    const numberCell = columnKey === 'amount' || columnKey === 'quantity';
    const cellValue =
      service[columnKey as keyof Omit<InvoiceService, 'actions'>];

    if (columnKey === 'actions') {
      return (
        <div className='relative flex items-center gap-2'>
          <Tooltip disableAnimation color='danger' content='Delete service'>
            <span className='text-lg text-danger cursor-pointer active:opacity-50'>
              <DeleteIcon />
            </span>
          </Tooltip>
        </div>
      );
    }

    if (columnKey === 'no') return <span>{service.id}</span>;

    return (
      <Input
        type={numberCell ? 'number' : 'text'}
        variant='bordered'
        value={cellValue.toString()}
      />
    );
  };

  const renderBottomContent = () => (
    <div className='flex justify-between items-center'>
      <Button variant='bordered' color='secondary'>
        <PlusIcon height={2} width={2} />
        Add Service
      </Button>
      <div className='flex gap-6 pr-3'>
        <p>Grand Total:</p>
        <p>$3.00</p>
      </div>
    </div>
  );

  return (
    <Table bottomContent={renderBottomContent()}>
      <TableHeader columns={INVOICE_SERVICE_COLUMNS}>
        {(column) => (
          <TableColumn key={column.uid} allowsSorting={column.sortable}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={indexedMockItems}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default InvoiceServicesTable;
