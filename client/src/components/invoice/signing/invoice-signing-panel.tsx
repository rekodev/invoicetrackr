'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Separator
} from '@heroui/react';
import {
  CheckCircleIcon,
  CreditCardIcon,
  PencilSquareIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import type { InvoiceBody } from '@invoicetrackr/types';
import type { JSX } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import SignaturePad from '@/components/signature-pad';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const t = useTranslations('invoices.pdf');

      return <Button isPending>{t('buttons.download_pdf')}</Button>;
    }
  }
);

type Props = {
  invoice: InvoiceBody;
  isPaid: boolean;
  isPaymentAvailable: boolean;
  isPaymentPending: boolean;
  isPending: boolean;
  isSigningRequested: boolean;
  isSigned: boolean;
  onPay: () => void;
  onSign: () => void;
  onSignatureChange: (_signature: File | string) => void;
  pdfDocument: JSX.Element | null;
  signature?: File | string;
};

export default function InvoiceSigningPanel({
  invoice,
  isPaid,
  isPaymentAvailable,
  isPaymentPending,
  isPending,
  isSigningRequested,
  isSigned,
  onPay,
  onSign,
  onSignatureChange,
  pdfDocument,
  signature
}: Props) {
  const t = useTranslations('invoice_signing');

  return (
    <Card className="h-full border shadow-sm">
      <CardHeader className="flex flex-col items-start gap-1 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold">{t('panel_title')}</h2>
        <p className="text-default-500 text-sm">{t('panel_description')}</p>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-1 flex-col gap-5 px-5 py-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {[invoice.sender, invoice.receiver].map((party) => (
            <div key={party.type} className="text-sm">
              <p className="text-default-500">{t(party.type)}</p>
              <p className="font-medium">{party.name}</p>
              {party.email && <p className="text-default-500">{party.email}</p>}
            </div>
          ))}
        </div>

        <Separator />

        <section className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span
              className={
                isPaid
                  ? 'bg-success/10 text-success grid h-9 w-9 shrink-0 place-items-center rounded-lg'
                  : 'bg-secondary/10 text-secondary grid h-9 w-9 shrink-0 place-items-center rounded-lg'
              }
            >
              {isPaid ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <CreditCardIcon className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold">
                {isPaid
                  ? t('payment_action_paid_title')
                  : t('payment_action_title')}
              </h3>
              <p className="text-default-500 mt-1 text-sm leading-5">
                {isPaymentAvailable
                  ? t('payment_action_online')
                  : isPaid
                    ? t('payment_action_paid_subtitle')
                    : t('payment_action_bank')}
              </p>
            </div>
          </div>
          {isPaymentAvailable && (
            <Button
              className="w-full"
              isPending={isPaymentPending}
              onPress={onPay}
            >
              {t('pay_invoice')}
            </Button>
          )}
        </section>

        {isSigningRequested && (
          <>
            <Separator />

            {isSigned ? (
              <section className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="bg-success/10 text-success grid h-9 w-9 shrink-0 place-items-center rounded-lg">
                    <CheckCircleIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">
                      {t('signature_received_title')}
                    </h3>
                    <p className="text-default-500 mt-1 text-sm leading-5">
                      {t('signature_received_subtitle')}
                    </p>
                  </div>
                </div>

                <SignaturePad
                  signature={signature}
                  onSignatureChange={onSignatureChange}
                  isChipVisible={false}
                  isReadOnly
                />
              </section>
            ) : (
              <section className="flex flex-col gap-4">
                <div className="text-sm">
                  <p className="text-default-500 mb-2">{t('method_title')}</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="secondary"
                      className="h-auto justify-start px-3 py-3"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                      {t('draw_signature')}
                    </Button>
                    <Button
                      variant="outline"
                      isDisabled
                      className="h-auto justify-between px-3 py-3"
                    >
                      <ShieldCheckIcon className="h-5 w-5" />
                      {t('electronic_signature')}
                      <Chip size="sm" variant="soft">
                        {t('coming_soon')}
                      </Chip>
                    </Button>
                  </div>
                </div>

                <SignaturePad
                  signature={signature}
                  onSignatureChange={onSignatureChange}
                  isChipVisible={false}
                />

                <Button
                  isDisabled={isPending}
                  isPending={isPending}
                  onPress={onSign}
                >
                  {t('sign_button')}
                </Button>
              </section>
            )}
          </>
        )}

        <div className="border-default-200 mt-auto flex flex-col gap-2 border-t pt-5">
          {pdfDocument && (
            <PDFDownloadLink
              document={pdfDocument}
              fileName={`${invoice.invoiceId || 'invoice'}.pdf`}
            >
              <Button variant="outline" className="w-full">
                {t('download_pdf')}
              </Button>
            </PDFDownloadLink>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
