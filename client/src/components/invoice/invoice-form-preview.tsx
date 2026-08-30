'use client';

import type { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { Currency } from '@/lib/types/currency';

import PDFDocument from '../pdf/pdf-document';
import InvoiceModal from './invoice-modal';

type Props = {
  currency: Currency;
  invoiceData: InvoiceBody;
  language: string;
  senderSignatureImage: string;
  signatureObjectUrl?: string;
  onClose: () => void;
};

export default function InvoiceFormPreview({
  currency,
  invoiceData,
  language,
  senderSignatureImage,
  signatureObjectUrl,
  onClose
}: Props) {
  const pdfTranslator = useTranslations('invoices.pdf');

  useEffect(() => {
    return () => {
      if (signatureObjectUrl) URL.revokeObjectURL(signatureObjectUrl);
    };
  }, [signatureObjectUrl]);
  const pdfDocument = (
    <PDFDocument
      currency={currency}
      invoiceData={invoiceData}
      senderSignatureImage={senderSignatureImage}
      t={pdfTranslator}
      language={language}
    />
  );

  return (
    <InvoiceModal
      pdfDocument={pdfDocument}
      invoiceData={invoiceData}
      invoiceLanguage={language}
      isOpen
      onOpenChange={(isOpen) => !isOpen && onClose()}
    />
  );
}
