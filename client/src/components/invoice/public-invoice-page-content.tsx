'use client';

import { Button, addToast, useDisclosure } from '@heroui/react';
import type { InvoiceBody, PublicInvoice } from '@invoicetrackr/types';
import { useMemo, useState, useTransition } from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

import { createPublicInvoicePayment, signPublicInvoice } from '@/api/invoice';
import type { Currency } from '@/lib/types/currency';
import InvoiceModal from '@/components/invoice/invoice-modal';
import { isResponseError } from '@/lib/utils/error';
import useDynamicPdf from '@/lib/hooks/pdf/use-dynamic-pdf';

import InvoiceSigningHeader from '@/components/invoice/signing/invoice-signing-header';
import InvoiceSigningPanel from '@/components/invoice/signing/invoice-signing-panel';
import InvoiceSigningSummary from '@/components/invoice/signing/invoice-signing-summary';

type Props = {
  publicInvoice: PublicInvoice;
};

export default function PublicInvoicePageContent({ publicInvoice }: Props) {
  const t = useTranslations('invoice_signing');
  const pdfTranslator = useTranslations('invoices.pdf');
  const [invoice, setInvoice] = useState<InvoiceBody>(publicInvoice.invoice);
  const [signature, setSignature] = useState<File | string | undefined>(
    publicInvoice.invoice.receiverSignature || undefined
  );
  const [isSigningPending, startSigningTransition] = useTransition();
  const [isPaymentPending, startPaymentTransition] = useTransition();
  const {
    isOpen: isPdfModalOpen,
    onOpen: openPdfModal,
    onOpenChange: setIsPdfModalOpen
  } = useDisclosure();
  const invoiceLanguage = useMemo(
    () => publicInvoice.preferredInvoiceLanguage || publicInvoice.language,
    [publicInvoice.language, publicInvoice.preferredInvoiceLanguage]
  );
  const isSigned = Boolean(
    invoice.receiverSignature || invoice.recipientSignedAt
  );
  const currency = publicInvoice.currency as Currency;
  const { pdfDocument, isPdfDocumentLoading } = useDynamicPdf({
    currency,
    defaultTranslator: pdfTranslator,
    invoiceLanguage,
    invoiceData: invoice,
    senderSignatureImage: invoice.senderSignature as string,
    receiverSignatureImage:
      typeof signature === 'string'
        ? signature
        : invoice.receiverSignature || ''
  });

  const handlePay = () => {
    startPaymentTransition(async () => {
      const response = await createPublicInvoicePayment(publicInvoice.token);

      if (isResponseError(response)) {
        addToast({
          title: response.data.message,
          color: 'danger'
        });
        return;
      }

      window.location.assign(response.data.url);
    });
  };

  const handleSign = () => {
    if (!signature || typeof signature === 'string') {
      addToast({
        title: t('signature_required'),
        color: 'danger'
      });

      return;
    }

    startSigningTransition(async () => {
      const response = await signPublicInvoice({
        token: publicInvoice.token,
        signature
      });

      addToast({
        title: response.data.message,
        color: isResponseError(response) ? 'danger' : 'success'
      });

      if (isResponseError(response)) return;

      setInvoice(response.data.invoice);
      setSignature(response.data.invoice.receiverSignature || undefined);
    });
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <InvoiceSigningHeader invoice={invoice} isSigned={isSigned} />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <InvoiceSigningSummary
          currency={currency}
          invoice={invoice}
          onOpenPdf={openPdfModal}
        />
        <aside className="flex flex-col gap-4">
          <section className="border-default-200 rounded-lg border bg-white p-4 shadow-sm dark:bg-black">
            <div className="flex items-start gap-3">
              <span className="bg-secondary/10 text-secondary grid h-9 w-9 shrink-0 place-items-center rounded-lg">
                <CreditCardIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold">
                  {t('payment_action_title')}
                </h2>
                <p className="text-default-500 mt-1 text-sm">
                  {publicInvoice.payment.available
                    ? t('payment_action_online')
                    : invoice.status === 'paid'
                      ? t('payment_action_paid')
                      : t('payment_action_bank')}
                </p>
              </div>
            </div>
            {publicInvoice.payment.available && (
              <Button
                className="mt-4 w-full"
                color="secondary"
                isLoading={isPaymentPending}
                onPress={handlePay}
              >
                {t('pay_invoice')}
              </Button>
            )}
          </section>

          {publicInvoice.signing.requested && (
            <InvoiceSigningPanel
              invoice={invoice}
              isPending={isSigningPending}
              isSigned={isSigned}
              onSign={handleSign}
              onSignatureChange={setSignature}
              pdfDocument={pdfDocument}
              signature={signature}
            />
          )}
        </aside>
      </section>

      <InvoiceModal
        isOpen={isPdfModalOpen}
        onOpenChange={setIsPdfModalOpen}
        invoiceData={invoice}
        invoiceLanguage={invoiceLanguage}
        pdfDocument={pdfDocument}
        isPdfDocumentLoading={isPdfDocumentLoading}
      />
    </main>
  );
}
