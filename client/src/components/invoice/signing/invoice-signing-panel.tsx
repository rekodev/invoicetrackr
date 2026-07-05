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
import type { InvoiceBody, PublicInvoicePayment } from '@invoicetrackr/types';
import type { JSX } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import type { Currency } from '@/lib/types/currency';
import IconContainer from '@/components/ui/icon-container';
import SignaturePad from '@/components/signature-pad';
import { getCurrencySymbol } from '@/lib/utils/currency';

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
  currency: Currency;
  invoice: InvoiceBody;
  isPaid: boolean;
  isPaymentCancelled: boolean;
  isPaymentPending: boolean;
  isPending: boolean;
  isSigningRequested: boolean;
  isSigned: boolean;
  onPay: () => void;
  onSign: () => void;
  onSignatureChange: (_signature: File | string) => void;
  payment: PublicInvoicePayment;
  pdfDocument: JSX.Element | null;
  signature?: File | string;
};

export default function InvoiceSigningPanel({
  currency,
  invoice,
  isPaid,
  isPaymentCancelled,
  isPaymentPending,
  isPending,
  isSigningRequested,
  isSigned,
  onPay,
  onSign,
  onSignatureChange,
  payment,
  pdfDocument,
  signature
}: Props) {
  const t = useTranslations('invoice_signing');
  const currencySymbol = getCurrencySymbol(currency);
  const shouldShowPaymentSection =
    isPaid || payment.resolvedMode !== 'disabled';
  const paymentIssueMessage = isPaymentCancelled
    ? t('payment_cancelled')
    : payment.failedAt
      ? t('payment_failed')
      : null;

  return (
    <Card className="h-full border shadow-sm">
      <CardHeader className="flex flex-col items-start gap-1 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold">{t('panel_title')}</h2>
        <p className="text-muted text-sm">{t('panel_description')}</p>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-1 flex-col gap-5 px-5 py-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {[invoice.sender, invoice.receiver].map((party) => (
            <div key={party.type} className="text-sm">
              <p className="text-muted">{t(party.type)}</p>
              <p className="font-medium">{party.name}</p>
              {party.email && <p className="text-muted">{party.email}</p>}
            </div>
          ))}
        </div>

        <Separator />

        {shouldShowPaymentSection && (
          <section className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <IconContainer
                variant={isPaid ? 'success' : 'secondary'}
                className="rounded-lg"
              >
                {isPaid ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <CreditCardIcon className="h-5 w-5" />
                )}
              </IconContainer>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">
                  {isPaid
                    ? t('payment_action_paid_title')
                    : t('payment_action_title')}
                </h3>
                <p className="text-muted mt-1 text-sm leading-5">
                  {isPaid
                    ? t('payment_action_paid_subtitle')
                    : payment.resolvedMode === 'online'
                      ? t('payment_action_online')
                      : t('payment_action_bank')}
                </p>
              </div>
            </div>

            {paymentIssueMessage && !isPaid && (
              <p className="text-danger text-sm leading-5">
                {paymentIssueMessage}
              </p>
            )}

            {payment.resolvedMode === 'online' && !isPaid && (
              <Button
                className="w-full"
                isPending={isPaymentPending}
                onPress={onPay}
              >
                {t('pay_invoice')}
              </Button>
            )}

            {payment.resolvedMode === 'manual' && !isPaid && (
              <div className="bg-default-100 grid gap-x-4 gap-y-1 rounded-lg p-4 text-sm sm:grid-cols-[auto_1fr]">
                <p className="text-muted">{t('amount_due')}</p>
                <p className="font-medium">
                  {currencySymbol}
                  {invoice.totalAmount}
                </p>
                <p className="text-muted">{t('due_date')}</p>
                <p>{invoice.dueDate}</p>
                <p className="text-muted">{t('bank')}</p>
                <p>{invoice.bankingInformation.name}</p>
                <p className="text-muted">{t('bank_code')}</p>
                <p>{invoice.bankingInformation.code}</p>
                <p className="text-muted">{t('account_number')}</p>
                <p className="break-all">
                  {invoice.bankingInformation.accountNumber}
                </p>
                <p className="text-muted">{t('payment_reference')}</p>
                <p className="break-all">{payment.manualReference}</p>
              </div>
            )}
          </section>
        )}

        {shouldShowPaymentSection && isSigningRequested && <Separator />}

        {isSigningRequested && (
          <>
            {isSigned ? (
              <section className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <IconContainer variant="success" className="rounded-lg">
                    <CheckCircleIcon className="h-5 w-5" />
                  </IconContainer>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">
                      {t('signature_received_title')}
                    </h3>
                    <p className="text-muted mt-1 text-sm leading-5">
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
                  <p className="text-muted mb-2">{t('method_title')}</p>
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
