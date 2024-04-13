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
import { Key, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { InvoiceFormData } from '@/types/models/invoice';

import DeleteIcon from '../icons/DeleteIcon';
import { PlusIcon } from '../icons/PlusIcon';

const INVOICE_SERVICE_COLUMNS = [
  { name: '#', uid: 'no' },
  { name: 'DESCRIPTION', uid: 'description' },
  { name: 'UNIT', uid: 'unit' },
  { name: 'QUANTITY', uid: 'quantity' },
  { name: 'AMOUNT', uid: 'amount' },
  { name: 'ACTION', uid: 'actions' },
];

const INITIAL_GRAND_TOTAL = 0;

const InvoiceServicesTable = () => {
  const { register, control, watch } = useFormContext<InvoiceFormData>();
  const { fields, append, remove } = useFieldArray({
    name: 'services',
    control,
  });

  const handleAddService = () => {
    append({ amount: 0, description: '', quantity: 0, unit: '' });
  };

  const handleRemoveService = (index: number) => {
    remove(index);
  };

  // watching the entire services array doesn't work, individual services have to be selected
  const serviceAmounts = fields.map((_field, index) =>
    watch(`services.${index}.amount`)
  );

  const totalAmount = useMemo(
    () =>
      serviceAmounts.reduce(
        (acc, amount) => acc + (Number(amount) || 0),
        INITIAL_GRAND_TOTAL
      ),
    [serviceAmounts]
  );

  const renderBottomContent = () => (
    <div className='flex justify-between items-center'>
      <Button variant='bordered' color='secondary' onPress={handleAddService}>
        <PlusIcon height={2} width={2} />
        Add Service
      </Button>
      <div className='flex gap-6 pr-3'>
        <p>Grand Total:</p>
        <p>${totalAmount}</p>
      </div>
    </div>
  );

  const renderCell = (columnKey: Key, index: number) => {
    switch (columnKey as (typeof INVOICE_SERVICE_COLUMNS)[number]['uid']) {
      case 'no':
        return <div aria-label='Number'>{index + 1}</div>;
      case 'description':
        return (
          <Input
            aria-label='Description'
            type='text'
            defaultValue=''
            variant='bordered'
            {...register(`services.${index}.description`)}
          />
        );
      case 'unit':
        return (
          <Input
            aria-label='Unit'
            type='text'
            defaultValue=''
            variant='bordered'
            {...register(`services.${index}.unit`)}
          />
        );
      case 'quantity':
        return (
          <Input
            aria-label='Quantity'
            type='number'
            defaultValue=''
            variant='bordered'
            {...register(`services.${index}.quantity`)}
          />
        );
      case 'amount':
        return (
          <Input
            aria-label='Amount'
            type='number'
            defaultValue=''
            variant='bordered'
            {...register(`services.${index}.amount`)}
          />
        );
      case 'actions':
        return (
          <div
            aria-label='Actions'
            className='relative flex items-center gap-2'
          >
            <Tooltip disableAnimation color='danger' content='Delete service'>
              <Button
                onPress={() => handleRemoveService(index)}
                variant='light'
                className='text-lg text-danger cursor-pointer active:opacity-50 min-w-min p-3'
              >
                <DeleteIcon />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return;
    }
  };

  return (
    <Table
      aria-label='Invoice Services Table'
      bottomContent={renderBottomContent()}
    >
      <TableHeader columns={INVOICE_SERVICE_COLUMNS}>
        {(column) => <TableColumn key={column.uid}>{column.name}</TableColumn>}
      </TableHeader>
      <TableBody items={fields}>
        {(field) => (
          <TableRow key={field.id}>
            {(columnKey) => (
              <TableCell>
                {renderCell(columnKey, fields.indexOf(field))}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default InvoiceServicesTable;
