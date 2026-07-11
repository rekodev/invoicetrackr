'use client';

import {
  BanknotesIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Button, Card, CardContent, CardHeader } from '@heroui/react';
import type { InvoiceBody } from '@invoicetrackr/types';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import type { Currency } from '@/lib/types/currency';
import { calculateInvoiceTotals } from '@/lib/utils';
import { getCurrencySymbol } from '@/lib/utils/currency';

type Props = {
  currency: Currency;
  invoice: InvoiceBody;
  onOpenPdf: () => void;
};

export default function InvoiceSigningSummary({
  currency,
  invoice,
  onOpenPdf
}: Props) {
  const t = useTranslations('invoice_signing');
  const currencySymbol = getCurrencySymbol(currency);
  const calculatedTotals = useMemo(
    () => calculateInvoiceTotals(invoice.services),
    [invoice.services]
  );
  const subtotalAmount =
    invoice.subtotalAmount || calculatedTotals.subtotalAmount;
  const vatAmount = invoice.vatAmount || calculatedTotals.vatAmount;
  const totalAmount = invoice.totalAmount || calculatedTotals.totalAmount;
  const shouldShowVatDetails =
    Number(vatAmount) > 0 ||
    invoice.services.some(
      (service) =>
        Number(service.vatRate ?? 0) > 0 || Boolean(service.vatExemptionReason)
    );

  return (
    <Card className="h-full border shadow-sm">
      <CardHeader className="border-default-200 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <DocumentTextIcon className="text-secondary h-6 w-6" />
          <div>
            <h2 className="font-semibold">{t('summary_title')}</h2>
            <p className="text-muted text-sm">
              {invoice.invoiceId || t('invoice')}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onPress={onOpenPdf}
        >
          <EyeIcon className="h-4 w-4" />
          {t('view_pdf')}
        </Button>
      </CardHeader>
      <CardContent className="gap-6 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {[invoice.sender, invoice.receiver].map((party) => (
            <div key={party.type} className="bg-default-100 rounded-lg p-4">
              <p className="text-muted text-xs font-medium uppercase">
                {t(party.type)}
              </p>
              <p className="mt-2 font-medium">{party.name}</p>
              <p className="text-muted mt-1 text-sm">{party.address}</p>
              <p className="text-muted text-sm">{party.businessNumber}</p>
              {party.vatNumber && (
                <p className="text-muted text-sm">
                  {t('vat_number')}: {party.vatNumber}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            [t('issue_date'), invoice.date],
            [t('due_date'), invoice.dueDate]
          ].map(([label, value]) => (
            <div key={label} className="flex items-center gap-3">
              <CalendarDaysIcon className="text-muted h-5 w-5" />
              <div>
                <p className="text-muted text-xs">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table
            className={`w-full text-left text-sm ${
              shouldShowVatDetails ? 'min-w-[620px]' : 'min-w-[540px]'
            }`}
          >
            <thead className="border-default-200 border-y">
              <tr className="text-muted">
                <th className="px-2 py-3 font-medium">{t('description')}</th>
                <th className="px-2 py-3 font-medium">{t('unit')}</th>
                <th className="px-2 py-3 text-right font-medium">
                  {t('quantity')}
                </th>
                <th className="px-2 py-3 text-right font-medium">
                  {t('amount')}
                </th>
                {shouldShowVatDetails && (
                  <th className="px-2 py-3 text-right font-medium">
                    {t('vat')}
                  </th>
                )}
                <th className="px-2 py-3 text-right font-medium">
                  {t('line_total')}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.services.map((service, index) => {
                const subtotal =
                  Number(service.amount) * Number(service.quantity);
                const lineTotal =
                  subtotal * (1 + Number(service.vatRate ?? 0) / 100);

                return (
                  <tr
                    key={service.id || `${service.description}-${index}`}
                    className="border-default-100 border-b"
                  >
                    <td className="px-2 py-3">{service.description}</td>
                    <td className="px-2 py-3">{service.unit}</td>
                    <td className="px-2 py-3 text-right">{service.quantity}</td>
                    <td className="px-2 py-3 text-right">
                      {currencySymbol}
                      {Number(service.amount).toFixed(2)}
                    </td>
                    {shouldShowVatDetails && (
                      <td className="px-2 py-3 text-right">
                        {Number(service.vatRate ?? 0)}%
                      </td>
                    )}
                    <td className="px-2 py-3 text-right font-medium">
                      {currencySymbol}
                      {lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pr-2">
          <div className="grid min-w-64 grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-sm">
            <p className="text-muted">{t('subtotal')}</p>
            <p className="text-right">
              {currencySymbol}
              {subtotalAmount}
            </p>
            {shouldShowVatDetails && (
              <>
                <p className="text-muted">{t('vat_total')}</p>
                <p className="text-right">
                  {currencySymbol}
                  {vatAmount}
                </p>
              </>
            )}
            <p className="border-default-200 border-t pt-2 font-semibold">
              {t('total')}
            </p>
            <p className="border-default-200 border-t pt-2 text-right font-semibold">
              {currencySymbol}
              {totalAmount}
            </p>
          </div>
        </div>

        {invoice.bankingInformation && (
          <div className="bg-default-100 mt-auto flex gap-3 rounded-lg p-4">
            <BanknotesIcon className="text-muted h-5 w-5 shrink-0" />
            <div className="min-w-0 text-sm">
              <p className="font-medium">{t('payment_details')}</p>
              <div className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-[auto_1fr]">
                <p className="text-muted">{t('bank')}</p>
                <p>{invoice.bankingInformation.name}</p>
                <p className="text-muted">{t('bank_code')}</p>
                <p>{invoice.bankingInformation.code}</p>
                <p className="text-muted">{t('account_number')}</p>
                <p className="break-all">
                  {invoice.bankingInformation.accountNumber}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
