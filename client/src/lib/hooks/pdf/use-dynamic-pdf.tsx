'use client';

import { useEffect, useState, useTransition } from 'react';
import { InvoiceBody } from '@invoicetrackr/types';
import { createTranslator } from 'next-intl';

import { Currency } from '@/lib/types/currency';
import PDFDocument from '@/components/pdf/pdf-document';

type Props = {
  defaultTranslator: ReturnType<typeof createTranslator>;
  invoiceLanguage: string;
  currency: Currency;
  invoiceData?: InvoiceBody;
  senderSignatureImage: string;
};

export default function useDynamicPdf({
  defaultTranslator,
  currency,
  invoiceLanguage,
  invoiceData,
  senderSignatureImage
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [pdfDocumentTranslator, setPdfDocumentTranslator] =
    useState<ReturnType<typeof createTranslator>>();

  useEffect(() => {
    function loadMessages() {
      startTransition(async () => {
        const mod = await import(
          `../../../../messages/${invoiceLanguage}.json`
        );
        const loadedMessages = mod.default;

        const translator = createTranslator({
          locale: invoiceLanguage,
          messages: loadedMessages,
          namespace: 'invoices.pdf'
        });

        startTransition(() => {
          setPdfDocumentTranslator(() => translator);
        });
      });
    }

    loadMessages();
  }, [invoiceLanguage]);

  const renderPdfDocument = () => {
    if (!invoiceData) return null;

    return (
      <PDFDocument
        t={pdfDocumentTranslator || defaultTranslator}
        language={invoiceLanguage}
        currency={currency}
        invoiceData={invoiceData}
        senderSignatureImage={senderSignatureImage}
      />
    );
  };

  return {
    pdfDocument: renderPdfDocument(),
    isPdfDocumentLoading: !pdfDocumentTranslator || isPending
  };
}
