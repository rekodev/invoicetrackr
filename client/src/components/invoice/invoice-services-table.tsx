'use client';

import {
  Button,
  Chip,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip
} from '@heroui/react';
import { Key, useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Currency } from '@/lib/types/currency';
import { InvoiceFormData, InvoiceService } from '@/lib/types/models/invoice';
import { getCurrencySymbol } from '@/lib/utils/currency';

import DeleteIcon from '../icons/DeleteIcon';
import { PlusIcon } from '../icons/PlusIcon';

const INVOICE_SERVICE_COLUMNS = [
  { name: '#', uid: 'no' },
  { name: 'DESCRIPTION', uid: 'description' },
  { name: 'UNIT', uid: 'unit' },
  { name: 'QUANTITY', uid: 'quantity' },
  { name: 'AMOUNT', uid: 'amount' },
  { name: 'ACTION', uid: 'actions' }
];
const INITIAL_GRAND_TOTAL = 0;

type Props = {
  invoiceServices?: Array<InvoiceService>;
  isInvalid?: boolean;
  errorMessage?: string;
  currency: Currency;
};

const InvoiceServicesTable = ({
  invoiceServices,
  isInvalid,
  errorMessage,
  currency
}: Props) => {
  const t = useTranslations('components.invoice_services_table');
  const {
    register,
    control,
    watch,
    clearErrors,
    formState: { errors }
  } = useFormContext<InvoiceFormData>();
  const { fields, append, remove, replace } = useFieldArray({
    name: 'services',
    control
  });

  const INVOICE_SERVICE_COLUMNS = [
    { name: t('column_number'), uid: 'no' },
    { name: t('column_description'), uid: 'description' },
    { name: t('column_unit'), uid: 'unit' },
    { name: t('column_quantity'), uid: 'quantity' },
    { name: t('column_amount'), uid: 'amount' },
    { name: t('column_actions'), uid: 'actions' }
  ];

  // watching the entire services array doesn't work, individual services have to be selected
  const serviceAmounts = fields.map(
    (_field, index) =>
      watch(`services.${index}.amount`) * watch(`services.${index}.quantity`)
  );

  const totalAmount = useMemo(
    () =>
      serviceAmounts.reduce(
        (acc, amount) => acc + (Number(amount) || 0),
        INITIAL_GRAND_TOTAL
      ),
    [serviceAmounts]
  );

  useEffect(() => {
    if (!invoiceServices?.length) return;

    replace(invoiceServices);
  }, [invoiceServices, replace]);

  const handleAddService = () => {
    append({ amount: 0, description: '', quantity: 0, unit: '' });

    // Clear errors if there are no services
    if (!serviceAmounts.length) clearErrors('services');
  };

  const handleRemoveService = (index: number) => {
    remove(index);
  };

  const renderBottomContent = () => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Button variant="faded" color="secondary" onPress={handleAddService}>
        <PlusIcon height={2} width={2} />
        {t('add_service')}
      </Button>
      <div className="flex gap-6 self-end pr-3">
        <p>{t('grand_total')}:</p>
        <p>
          {getCurrencySymbol(currency)}
          {totalAmount.toFixed(2)}
        </p>
      </div>
    </div>
  );

  const renderCell = (columnKey: Key, index: number) => {
    switch (columnKey as (typeof INVOICE_SERVICE_COLUMNS)[number]['uid']) {
      case 'no':
        return <div aria-label={t('aria_number')}>{index + 1}</div>;
      case 'description':
        return (
          <Input
            className="min-w-44"
            aria-label={t('aria_description')}
            type="text"
            maxLength={200}
            defaultValue={fields[index].description || ''}
            variant="bordered"
            {...register(`services.${index}.description`)}
            isInvalid={!!errors.services?.[index]?.description}
            errorMessage={errors.services?.[index]?.description?.message}
          />
        );
      case 'unit':
        return (
          <Input
            className="min-w-44"
            aria-label={t('aria_unit')}
            type="text"
            maxLength={20}
            defaultValue={fields[index].unit || ''}
            variant="bordered"
            {...register(`services.${index}.unit`)}
            isInvalid={!!errors.services?.[index]?.unit}
            errorMessage={errors.services?.[index]?.unit?.message}
          />
        );
      case 'quantity':
        return (
          <Input
            aria-label={t('aria_quantity')}
            type="number"
            defaultValue={fields[index].quantity?.toString() || ''}
            variant="bordered"
            {...register(`services.${index}.quantity`)}
            isInvalid={!!errors.services?.[index]?.quantity}
            errorMessage={errors.services?.[index]?.quantity?.message}
          />
        );
      case 'amount':
        return (
          <Input
            aria-label={t('aria_amount')}
            type="number"
            defaultValue={fields[index].amount?.toString() || ''}
            variant="bordered"
            {...register(`services.${index}.amount`)}
            isInvalid={!!errors.services?.[index]?.amount}
            errorMessage={errors.services?.[index]?.amount?.message}
          />
        );
      case 'actions':
        return (
          <div
            aria-label={t('aria_actions')}
            className="relative flex items-center gap-2"
          >
            <Tooltip color="danger" content={t('delete_service')}>
              <Button
                onPress={() => handleRemoveService(index)}
                variant="light"
                className="text-danger min-w-min cursor-pointer p-3 text-lg active:opacity-50"
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
    <>
      <Table
        aria-label={t('aria_table')}
        bottomContent={renderBottomContent()}
        bottomContentPlacement="outside"
      >
        <TableHeader columns={INVOICE_SERVICE_COLUMNS}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={fields} className="bg-red-500">
          {fields.map((field, index) => (
            <TableRow key={index}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(columnKey, fields.indexOf(field))}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isInvalid && (
        <Chip
          className="mt-[-0.75rem]"
          size="sm"
          variant="light"
          color="danger"
        >
          {errorMessage}
        </Chip>
      )}
    </>
  );
};

export default InvoiceServicesTable;
