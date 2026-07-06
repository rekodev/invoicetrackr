'use client';

import {
  DEFAULT_CURRENCY,
  type InvoiceBody,
  type PublicInvoice
} from '@invoicetrackr/types';
import { useMemo, useState, useTransition } from 'react';
import { toast } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useTranslations } from 'next-intl';

import InvoiceModal from '@/components/invoice/invoice-modal';
import { isResponseError } from '@/lib/utils/error';
import { signPublicInvoice } from '@/api/invoice';
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
  const {
    isOpen: isPdfModalOpen,
    open: openPdfModal,
    setOpen: setIsPdfModalOpen
  } = useOverlayState();
  const invoiceLanguage = useMemo(
    () => publicInvoice.preferredInvoiceLanguage || publicInvoice.language,
    [publicInvoice.language, publicInvoice.preferredInvoiceLanguage]
  );
  const isSigned = Boolean(
    invoice.receiverSignature || invoice.recipientSignedAt
  );
  const isPaid = Boolean(invoice.status === 'paid');
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
      toast(t('signature_required'), { variant: 'danger' });

      return;
    }

    startSigningTransition(async () => {
      const response = await signPublicInvoice({
        token: publicInvoice.token,
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
        <aside className="flex flex-col gap-4">
          <InvoiceSigningPanel
            invoice={invoice}
            isPaid={isPaid}
            isPending={isSigningPending}
            isSigningRequested={publicInvoice.signing.requested}
            isSigned={isSigned}
            onSign={handleSign}
            payment={publicInvoice.payment}
            currency={currency}
            onSignatureChange={setSignature}
            pdfDocument={pdfDocument}
            signature={signature}
          />
        </aside>
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
