'use client';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider
} from '@heroui/react';
import { PencilSquareIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
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

      return (
        <Button color="secondary" isLoading>
          {t('buttons.download_pdf')}
        </Button>
      );
    }
  }
);

type Props = {
  invoice: InvoiceBody;
  isPending: boolean;
  isSigned: boolean;
  onSign: () => void;
  onSignatureChange: (_signature: File | string) => void;
  pdfDocument: JSX.Element | null;
  signature?: File | string;
};

export default function InvoiceSigningPanel({
  invoice,
  isPending,
  isSigned,
  onSign,
  onSignatureChange,
  pdfDocument,
  signature
}: Props) {
  const t = useTranslations('invoice_signing');

  return (
    <Card className="dark:border-default-100 h-full border shadow-sm">
      <CardHeader className="flex flex-col items-start gap-1 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold">{t('panel_title')}</h2>
        <p className="text-default-500 text-sm">{t('panel_description')}</p>
      </CardHeader>
      <Divider />
      <CardBody className="flex flex-1 flex-col gap-5 px-5 py-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {[invoice.sender, invoice.receiver].map((party) => (
            <div key={party.type} className="text-sm">
              <p className="text-default-500">{t(party.type)}</p>
              <p className="font-medium">{party.name}</p>
              {party.email && <p className="text-default-500">{party.email}</p>}
            </div>
          ))}
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
          onSignatureChange={onSignatureChange}
          isChipVisible={false}
        />

        <div className="border-default-200 mt-auto flex flex-col gap-2 border-t pt-5">
          <Button
            color="secondary"
            isDisabled={isPending || isSigned}
            isLoading={isPending}
            onPress={onSign}
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
        </div>
      </CardBody>
    </Card>
  );
}
