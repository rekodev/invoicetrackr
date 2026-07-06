'use client';

import {
  DEFAULT_CURRENCY,
  type InvoiceBody,
  type PublicInvoiceSigning
} from '@invoicetrackr/types';
import { toast, useOverlayState } from '@heroui/react';
import { useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import InvoiceModal from '@/components/invoice/invoice-modal';
import { isResponseError } from '@/lib/utils/error';
import { signPublicInvoice } from '@/api/invoice';
import useDynamicPdf from '@/lib/hooks/pdf/use-dynamic-pdf';

import InvoiceSigningHeader from '@/components/invoice/signing/invoice-signing-header';
import InvoiceSigningPanel from '@/components/invoice/signing/invoice-signing-panel';
import InvoiceSigningSummary from '@/components/invoice/signing/invoice-signing-summary';

type Props = {
  signing: PublicInvoiceSigning;
};

export default function InvoiceSigningPageContent({ signing }: Props) {
  const t = useTranslations('invoice_signing');
  const pdfTranslator = useTranslations('invoices.pdf');
  const [invoice, setInvoice] = useState<InvoiceBody>(signing.invoice);
  const [signature, setSignature] = useState<File | string | undefined>(
    signing.invoice.receiverSignature || undefined
  );
  const [isPending, startTransition] = useTransition();
  const {
    isOpen: isPdfModalOpen,
    open: openPdfModal,
    setOpen: setIsPdfModalOpen
  } = useOverlayState();
  const invoiceLanguage = useMemo(
    () => signing.preferredInvoiceLanguage || signing.language,
    [signing.language, signing.preferredInvoiceLanguage]
  );
  const isSigned = Boolean(
    invoice.receiverSignature || invoice.recipientSignedAt
  );
  const currency = DEFAULT_CURRENCY;
  const { pdfDocument, pdfUrl, isPdfDocumentLoading } = useDynamicPdf({
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

  const handleSign = () => {
    if (!signature || typeof signature === 'string') {
      ({
        title: t('signature_required'),
        color: 'danger'
      });

      return;
    }

    startTransition(async () => {
      const response = await signPublicInvoice({
        token: signing.token,
        signature
      });

      toast(response.data.message, {
        variant: isResponseError(response) ? 'danger' : 'success'
      });

      if (isResponseError(response)) return;

      setInvoice(response.data.invoice);
      setSignature(response.data.invoice.receiverSignature || undefined);
    });
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <InvoiceSigningHeader invoice={invoice} />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <InvoiceSigningSummary
          currency={currency}
          invoice={invoice}
          onOpenPdf={openPdfModal}
        />
        <InvoiceSigningPanel
          invoice={invoice}
          currency={currency}
          isPaid={invoice.status === 'paid'}
          isPending={isPending}
          isSigningRequested
          isSigned={isSigned}
          onSign={handleSign}
          onSignatureChange={setSignature}
          payment={{
            configuredMode: 'disabled',
            resolvedMode: 'disabled',
            provider: null,
            available: false,
            manualReference: null
          }}
          pdfDocument={pdfDocument}
          signature={signature}
        />
      </section>

      <InvoiceModal
        isOpen={isPdfModalOpen}
        onOpenChange={setIsPdfModalOpen}
        invoiceData={invoice}
        invoiceLanguage={invoiceLanguage}
        pdfDocument={pdfDocument}
        pdfUrl={pdfUrl}
        isPdfDocumentLoading={isPdfDocumentLoading}
        showFooterStatus
      />
    </main>
  );
}
