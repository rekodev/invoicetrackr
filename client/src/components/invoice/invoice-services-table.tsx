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
import { InvoiceBody, InvoiceServiceBody } from '@invoicetrackr/types';
import { Key, useEffect, useMemo } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Currency } from '@/lib/types/currency';
import { getCurrencySymbol } from '@/lib/utils/currency';

const INITIAL_GRAND_TOTAL = 0;

type Props = {
  invoiceServices?: Array<InvoiceServiceBody>;
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
  } = useFormContext<InvoiceBody>();
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
    append({ id: 0, amount: 0, description: '', quantity: 0, unit: '' });

    // Clear errors if there are no services
    if (!serviceAmounts.length) clearErrors('services');
  };

  const handleRemoveService = (index: number) => {
    remove(index);
  };

  const renderBottomContent = () => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Button variant="faded" color="secondary" onPress={handleAddService}>
        <PlusIcon className="h-5 w-5" />
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
        return <div aria-label={t('a11y.number_label')}>{index + 1}</div>;
      case 'description':
        return (
          <Input
            className="min-w-44"
            aria-label={t('a11y.description_label')}
            type="text"
            maxLength={200}
            defaultValue={
              (fields[index] as InvoiceServiceBody).description || ''
            }
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
            aria-label={t('a11y.unit_label')}
            type="text"
            maxLength={20}
            defaultValue={(fields[index] as InvoiceServiceBody).unit || ''}
            variant="bordered"
            {...register(`services.${index}.unit`)}
            isInvalid={!!errors.services?.[index]?.unit}
            errorMessage={errors.services?.[index]?.unit?.message}
          />
        );
      case 'quantity':
        return (
          <Input
            aria-label={t('a11y.quantity_label')}
            type="number"
            defaultValue={
              (fields[index] as InvoiceServiceBody).quantity?.toString() || ''
            }
            variant="bordered"
            {...register(`services.${index}.quantity`)}
            isInvalid={!!errors.services?.[index]?.quantity}
            errorMessage={errors.services?.[index]?.quantity?.message}
          />
        );
      case 'amount':
        return (
          <Input
            aria-label={t('a11y.amount_label')}
            type="number"
            defaultValue={
              (fields[index] as InvoiceServiceBody).amount?.toString() || ''
            }
            variant="bordered"
            {...register(`services.${index}.amount`)}
            isInvalid={!!errors.services?.[index]?.amount}
            errorMessage={errors.services?.[index]?.amount?.message}
          />
        );
      case 'actions':
        return (
          <div
            aria-label={t('a11y.actions_label')}
            className="relative flex items-center gap-2"
          >
            <Tooltip color="danger" content={t('delete_service')}>
              <Button
                onPress={() => handleRemoveService(index)}
                variant="light"
                className="text-danger min-w-min cursor-pointer p-3 text-lg active:opacity-50"
              >
                <TrashIcon className="h-5 w-5" />
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
        aria-label={t('a11y.table_label')}
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
