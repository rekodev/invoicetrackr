'use client';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  addToast
} from '@heroui/react';
import type { InvoiceBody, PublicInvoiceSigning } from '@invoicetrackr/types';
import { useMemo, useState, useTransition } from 'react';
import {
  CheckCircleIcon,
  PencilSquareIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import type { Currency } from '@/lib/types/currency';
import PdfViewerWrapper from '@/components/pdf/pdf-viewer-wrapper';
import SignaturePad from '@/components/signature-pad';
import { isResponseError } from '@/lib/utils/error';
import { signPublicInvoice } from '@/api/invoice';
import useDynamicPdf from '@/lib/hooks/pdf/use-dynamic-pdf';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const t = useTranslations('invoices.pdf');

      return (
        <Button color="secondary" isLoading>
          {t('buttons.download_pdf')}
        </Button>
      );
    }
  }
);

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
  const [isIFrameLoading, setIsIFrameLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const invoiceLanguage = useMemo(
    () => signing.preferredInvoiceLanguage || signing.language,
    [signing.language, signing.preferredInvoiceLanguage]
  );
  const isSigned = Boolean(
    invoice.receiverSignature || invoice.recipientSignedAt
  );

  const { pdfDocument, isPdfDocumentLoading } = useDynamicPdf({
    currency: signing.currency as Currency,
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
      addToast({
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
      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-default-500 text-sm">{t('eyebrow')}</p>
            <h1 className="text-2xl font-semibold">
              {t('title', { senderName: invoice.sender.name })}
            </h1>
          </div>
          {isSigned && (
            <Chip
              color="success"
              variant="flat"
              startContent={<CheckCircleIcon className="h-4 w-4" />}
            >
              {t('signed_status')}
            </Chip>
          )}
        </div>
        <p className="text-default-600 max-w-3xl text-sm">
          {t('subtitle', { invoiceId: invoice.invoiceId || '' })}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="dark:border-default-100 border shadow-sm">
          <CardBody className="h-[760px] p-0">
            {pdfDocument && !isPdfDocumentLoading ? (
              <PdfViewerWrapper
                pdfDocument={pdfDocument}
                isIFrameLoading={isIFrameLoading}
                setIsIFrameLoading={setIsIFrameLoading}
              />
            ) : (
              <div className="text-default-500 flex h-full items-center justify-center text-sm">
                {t('loading_pdf')}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="dark:border-default-100 h-fit border shadow-sm">
          <CardHeader className="flex flex-col items-start gap-1">
            <h2 className="text-lg font-semibold">{t('panel_title')}</h2>
            <p className="text-default-500 text-sm">{t('panel_description')}</p>
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="text-sm">
                <p className="text-default-500">{t('sender')}</p>
                <p className="font-medium">{invoice.sender.name}</p>
                {invoice.sender.email && (
                  <p className="text-default-500">{invoice.sender.email}</p>
                )}
              </div>
              <div className="text-sm">
                <p className="text-default-500">{t('receiver')}</p>
                <p className="font-medium">{invoice.receiver.name}</p>
                {invoice.receiver.email && (
                  <p className="text-default-500">{invoice.receiver.email}</p>
                )}
              </div>
            </div>

            <Divider />

            <div className="text-sm">
              <p className="text-default-500 mb-2">{t('method_title')}</p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="flat"
                  color="secondary"
                  className="h-auto justify-start px-3 py-3"
                  startContent={<PencilSquareIcon className="h-5 w-5" />}
                >
                  {t('draw_signature')}
                </Button>
                <Button
                  variant="bordered"
                  isDisabled
                  className="h-auto justify-between px-3 py-3"
                  startContent={<ShieldCheckIcon className="h-5 w-5" />}
                  endContent={
                    <Chip size="sm" variant="flat">
                      {t('coming_soon')}
                    </Chip>
                  }
                >
                  {t('electronic_signature')}
                </Button>
              </div>
            </div>

            <SignaturePad
              signature={signature}
              onSignatureChange={setSignature}
              isChipVisible={false}
            />

            <Button
              color="secondary"
              isDisabled={isPending || isSigned}
              isLoading={isPending}
              onPress={handleSign}
            >
              {isSigned ? t('already_signed') : t('sign_button')}
            </Button>

            {pdfDocument && (
              <PDFDownloadLink
                document={pdfDocument}
                fileName={`${invoice.invoiceId || 'invoice'}.pdf`}
              >
                <Button variant="bordered" className="w-full">
                  {t('download_pdf')}
                </Button>
              </PDFDownloadLink>
            )}
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
