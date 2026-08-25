'use client';

import type { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

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
  const [signatureFileUrl, setSignatureFileUrl] = useState('');
  const signature = invoiceData.senderSignature;

  useEffect(() => {
    if (!(signature instanceof File)) {
      setSignatureFileUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(signature);
    setSignatureFileUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [signature]);

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
