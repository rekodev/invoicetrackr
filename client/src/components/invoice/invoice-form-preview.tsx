'use client';

import type { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';

import { Currency } from '@/lib/types/currency';

import PDFDocument from '../pdf/pdf-document';
import InvoiceModal from './invoice-modal';

type Props = {
  currency: Currency;
  invoiceData: InvoiceBody;
  language: string;
  onClose: () => void;
};

export default function InvoiceFormPreview({
  currency,
  invoiceData,
  language,
  onClose
}: Props) {
  const pdfTranslator = useTranslations('invoices.pdf');
  const signature = invoiceData.senderSignature;
  const signatureFileUrl = useMemo(
    () => (signature instanceof File ? URL.createObjectURL(signature) : ''),
    [signature]
  );

  useEffect(() => {
    if (!signatureFileUrl) {
      return;
    }

    return () => URL.revokeObjectURL(signatureFileUrl);
  }, [signatureFileUrl]);

  const senderSignatureImage =
    typeof signature === 'string' ? signature : signatureFileUrl;
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
