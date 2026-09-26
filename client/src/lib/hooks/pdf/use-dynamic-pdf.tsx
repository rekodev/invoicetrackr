'use client';

import { createPdfTranslator } from '@invoicetrackr/pdf/translations';
import type { InvoiceBody } from '@invoicetrackr/types';
import { usePDF } from '@react-pdf/renderer';
import type { createTranslator } from 'next-intl';
import { JSX, useEffect, useMemo, useRef, useState } from 'react';

import PDFDocument from '@/components/pdf/pdf-document';
import { Currency } from '@/lib/types/currency';

type Props = {
  defaultTranslator: ReturnType<typeof createTranslator>;
  invoiceLanguage: string;
  currency: Currency;
  invoiceData?: InvoiceBody;
  senderSignatureImage: string;
  receiverSignatureImage?: string;
  generatePdfUrl?: boolean;
};

export default function useDynamicPdf({
  currency,
  invoiceLanguage,
  invoiceData,
  senderSignatureImage,
  receiverSignatureImage,
  generatePdfUrl = true
}: Props) {
  const pdfDocumentTranslator = useMemo(() => createPdfTranslator(invoiceLanguage), [invoiceLanguage]);

  const pdfDocument = useMemo(() => {
    if (!invoiceData || !pdfDocumentTranslator) return null;

    return (
      <PDFDocument
        t={pdfDocumentTranslator}
        language={invoiceLanguage}
        currency={currency}
        invoiceData={invoiceData}
        senderSignatureImage={senderSignatureImage}
        receiverSignatureImage={receiverSignatureImage}
      />
    );
  }, [
    currency,
    invoiceData,
    invoiceLanguage,
    pdfDocumentTranslator,
    receiverSignatureImage,
    senderSignatureImage
  ]);

  const [pdfInstance, updatePdfInstance] = usePDF();
  const latestPdfUrlRef = useRef<string | null>(pdfInstance.url || null);
  latestPdfUrlRef.current = pdfInstance.url || null;
  const [pdfRequest, setPdfRequest] = useState<{
    document: JSX.Element;
    previousUrl: string | null;
  }>();
  const [completedPdfDocument, setCompletedPdfDocument] =
    useState<JSX.Element | null>(null);

  useEffect(() => {
    if (!pdfDocument || !generatePdfUrl) return;

    setPdfRequest({
      document: pdfDocument,
      previousUrl: latestPdfUrlRef.current
    });
    updatePdfInstance(pdfDocument);
  }, [generatePdfUrl, pdfDocument, updatePdfInstance]);

  useEffect(() => {
    if (
      !pdfRequest ||
      pdfInstance.loading ||
      !pdfInstance.url ||
      pdfInstance.url === pdfRequest.previousUrl
    )
      return;

    setCompletedPdfDocument(pdfRequest.document);
  }, [pdfInstance.loading, pdfInstance.url, pdfRequest]);

  const isPdfDocumentReady =
    !generatePdfUrl ||
    (completedPdfDocument === pdfDocument && Boolean(pdfInstance.url));

  return {
    pdfDocument,
    pdfUrl:
      generatePdfUrl && isPdfDocumentReady ? pdfInstance.url : null,
    isPdfDocumentLoading:
      Boolean(invoiceData) &&
      (!pdfDocumentTranslator ||
        !pdfDocument ||
        pdfInstance.loading ||
        !isPdfDocumentReady)
  };
}
