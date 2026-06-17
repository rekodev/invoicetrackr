'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { InvoiceBody } from '@invoicetrackr/types';
import { createTranslator } from 'next-intl';
import { usePDF } from '@react-pdf/renderer';

import { Currency } from '@/lib/types/currency';
import PDFDocument from '@/components/pdf/pdf-document';

type Props = {
  defaultTranslator: ReturnType<typeof createTranslator>;
  invoiceLanguage: string;
  currency: Currency;
  invoiceData?: InvoiceBody;
  senderSignatureImage: string;
  receiverSignatureImage?: string;
};

export default function useDynamicPdf({
  defaultTranslator,
  currency,
  invoiceLanguage,
  invoiceData,
  senderSignatureImage,
  receiverSignatureImage
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

  const pdfDocument = useMemo(() => {
    if (!invoiceData) return null;

    return (
      <PDFDocument
        t={pdfDocumentTranslator || defaultTranslator}
        language={invoiceLanguage}
        currency={currency}
        invoiceData={invoiceData}
        senderSignatureImage={senderSignatureImage}
        receiverSignatureImage={receiverSignatureImage}
      />
    );
  }, [
    currency,
    defaultTranslator,
    invoiceData,
    invoiceLanguage,
    pdfDocumentTranslator,
    receiverSignatureImage,
    senderSignatureImage
  ]);

  const [pdfInstance, updatePdfInstance] = usePDF();

  useEffect(() => {
    if (!pdfDocument) return;

    updatePdfInstance(pdfDocument);
  }, [pdfDocument, updatePdfInstance]);

  return {
    pdfDocument,
    pdfUrl: pdfInstance.url,
    isPdfDocumentLoading:
      !pdfDocumentTranslator || isPending || pdfInstance.loading
  };
}
