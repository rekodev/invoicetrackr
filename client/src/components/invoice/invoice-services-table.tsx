'use client';

import {
  Button,
  Chip,
  FieldError,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableContent,
  TableHeader,
  TableRow,
  TableScrollContainer,
  TextField,
  Tooltip
} from '@heroui/react';
import { type ComponentProps, type Key, useEffect, useMemo } from 'react';
import type { InvoiceBody, InvoiceServiceBody } from '@invoicetrackr/types';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Currency } from '@/lib/types/currency';
import { calculateInvoiceTotals } from '@/lib/utils';
import { getCurrencySymbol } from '@/lib/utils/currency';

type Props = {
  invoiceServices?: Array<InvoiceServiceBody>;
  isInvalid?: boolean;
  errorMessage?: string;
  currency: Currency;
};

type ServiceInputProps = ComponentProps<typeof Input>;

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
    { name: t('column_vat_rate'), uid: 'vatRate' },
    { name: t('column_vat_exemption_reason'), uid: 'vatExemptionReason' },
    { name: t('column_line_total'), uid: 'lineTotal' },
    { name: t('column_actions'), uid: 'actions' }
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const services =
    useWatch({
      control,
      name: 'services'
    }) || [];

  const invoiceTotals = useMemo(
    () => calculateInvoiceTotals(services),
    [services]
  );

  const lineTotals = useMemo(
    () =>
      services.map((service) => {
        const amount = Number(service?.amount) || 0;
        const quantity = Number(service?.quantity) || 0;
        const vatRate = Number(service?.vatRate ?? 0) || 0;
        const subtotal = amount * quantity;

        return subtotal + subtotal * (vatRate / 100);
      }),
    [services]
  );

  useEffect(() => {
    if (!invoiceServices?.length) return;

    replace(invoiceServices);
  }, [invoiceServices, replace]);

  const handleAddService = () => {
    append({
      id: 0,
      amount: 0,
      description: '',
      quantity: 0,
      unit: '',
      vatRate: 0
    });

    // Clear errors if there are no services
    if (!services.length) clearErrors('services');
  };

  const handleRemoveService = (index: number) => {
    remove(index);
  };

  const renderServiceInput = ({
    isInvalid,
    errorMessage,
    inputProps
  }: {
    isInvalid: boolean;
    errorMessage?: string;
    inputProps: ServiceInputProps;
  }) => (
    <TextField isInvalid={isInvalid}>
      <Input {...inputProps} variant="secondary" />
      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );

  const renderBottomContent = () => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Button variant="secondary" onPress={handleAddService}>
        <PlusIcon className="h-5 w-5" />
        {t('add_service')}
      </Button>
      <div className="grid min-w-64 grid-cols-[1fr_auto] gap-x-6 gap-y-1 self-end pr-3 text-sm">
        <p className="text-default-500">{t('subtotal')}:</p>
        <p className="text-right">
          {getCurrencySymbol(currency)}
          {invoiceTotals.subtotalAmount}
        </p>
        <p className="text-default-500">{t('vat_total')}:</p>
        <p className="text-right">
          {getCurrencySymbol(currency)}
          {invoiceTotals.vatAmount}
        </p>
        <p className="font-medium">{t('grand_total')}:</p>
        <p className="text-right font-medium">
          {getCurrencySymbol(currency)}
          {invoiceTotals.totalAmount}
        </p>
      </div>
    </div>
  );

  const renderCell = (columnKey: Key, index: number) => {
    switch (columnKey as (typeof INVOICE_SERVICE_COLUMNS)[number]['uid']) {
      case 'no':
        return <div aria-label={t('a11y.number_label')}>{index + 1}</div>;
      case 'description':
        return renderServiceInput({
          isInvalid: !!errors.services?.[index]?.description,
          errorMessage: errors.services?.[index]?.description?.message,
          inputProps: {
            className: 'min-w-40',
            'aria-label': t('a11y.description_label'),
            type: 'text',
            maxLength: 200,
            defaultValue:
              (fields[index] as InvoiceServiceBody).description || '',
            ...register(`services.${index}.description`)
          }
        });
      case 'unit':
        return renderServiceInput({
          isInvalid: !!errors.services?.[index]?.unit,
          errorMessage: errors.services?.[index]?.unit?.message,
          inputProps: {
            className: 'min-w-24',
            'aria-label': t('a11y.unit_label'),
            type: 'text',
            maxLength: 20,
            defaultValue: (fields[index] as InvoiceServiceBody).unit || '',
            ...register(`services.${index}.unit`)
          }
        });
      case 'quantity':
        return renderServiceInput({
          isInvalid: !!errors.services?.[index]?.quantity,
          errorMessage: errors.services?.[index]?.quantity?.message,
          inputProps: {
            className: 'min-w-24',
            'aria-label': t('a11y.quantity_label'),
            type: 'number',
            defaultValue:
              (fields[index] as InvoiceServiceBody).quantity?.toString() || '',
            ...register(`services.${index}.quantity`)
          }
        });
      case 'amount':
        return renderServiceInput({
          isInvalid: !!errors.services?.[index]?.amount,
          errorMessage: errors.services?.[index]?.amount?.message,
          inputProps: {
            className: 'min-w-36',
            'aria-label': t('a11y.amount_label'),
            type: 'number',
            defaultValue:
              (fields[index] as InvoiceServiceBody).amount?.toString() || '',
            ...register(`services.${index}.amount`)
          }
        });
      case 'vatRate':
        return renderServiceInput({
          isInvalid: !!errors.services?.[index]?.vatRate,
          errorMessage: errors.services?.[index]?.vatRate?.message,
          inputProps: {
            className: 'w-20 min-w-20',
            'aria-label': t('a11y.vat_rate_label'),
            type: 'number',
            min: 0,
            max: 100,
            step: '0.01',
            defaultValue:
              (fields[index] as InvoiceServiceBody).vatRate?.toString() || '0',
            ...register(`services.${index}.vatRate`)
          }
        });
      case 'vatExemptionReason':
        return renderServiceInput({
          isInvalid: !!errors.services?.[index]?.vatExemptionReason,
          errorMessage: errors.services?.[index]?.vatExemptionReason?.message,
          inputProps: {
            className: 'min-w-48',
            'aria-label': t('a11y.vat_exemption_reason_label'),
            type: 'text',
            maxLength: 255,
            defaultValue:
              (fields[index] as InvoiceServiceBody).vatExemptionReason || '',
            ...register(`services.${index}.vatExemptionReason`)
          }
        });
      case 'lineTotal':
        return (
          <p className="min-w-24 text-right text-sm font-medium">
            {getCurrencySymbol(currency)}
            {(lineTotals[index] || 0).toFixed(2)}
          </p>
        );
      case 'actions':
        return (
          <div
            aria-label={t('a11y.actions_label')}
            className="relative flex items-center gap-2"
          >
            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <Button
                  onPress={() => handleRemoveService(index)}
                  variant="tertiary"
                  className="text-danger min-w-min cursor-pointer p-3 text-lg active:opacity-50"
                >
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>{t('delete_service')}</Tooltip.Content>
            </Tooltip>
          </div>
        );
      default:
        return;
    }
  };

  return (
    <>
      <Table>
        <TableScrollContainer>
          <TableContent aria-label={t('a11y.table_label')}>
            <TableHeader>
              {INVOICE_SERVICE_COLUMNS.map((column) => (
                <TableColumn key={column.uid} id={column.uid}>
                  {column.name}
                </TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id} id={field.id}>
                  {INVOICE_SERVICE_COLUMNS.map((column) => (
                    <TableCell key={column.uid}>
                      {renderCell(column.uid, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </TableContent>
        </TableScrollContainer>
      </Table>
      {renderBottomContent()}
      {isInvalid && (
        <Chip
          className="mt-[-0.75rem]"
          size="sm"
          variant="tertiary"
          color="danger"
        >
          {errorMessage}
        </Chip>
      )}
    </>
  );
};

export default InvoiceServicesTable;
