'use client';

import { InvoiceBody } from '@invoicetrackr/types';
import { usePDF } from '@react-pdf/renderer';
import { createTranslator, useLocale } from 'next-intl';
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
};

export default function useDynamicPdf({
  defaultTranslator,
  currency,
  invoiceLanguage,
  invoiceData,
  senderSignatureImage,
  receiverSignatureImage
}: Props) {
  const locale = useLocale();
  const [loadedTranslator, setLoadedTranslator] = useState<{
    language: string;
    translator: ReturnType<typeof createTranslator>;
  }>();

  useEffect(() => {
    if (invoiceLanguage === locale) return;

    let isCancelled = false;

    import(`../../../../messages/${invoiceLanguage}.json`).then((mod) => {
      if (isCancelled) return;

      setLoadedTranslator({
        language: invoiceLanguage,
        translator: createTranslator({
          locale: invoiceLanguage,
          messages: mod.default,
          namespace: 'invoices.pdf'
        })
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [invoiceLanguage, locale]);

  const pdfDocumentTranslator =
    invoiceLanguage === locale
      ? defaultTranslator
      : loadedTranslator?.language === invoiceLanguage
        ? loadedTranslator.translator
        : undefined;

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
    if (!pdfDocument) return;

    setPdfRequest({
      document: pdfDocument,
      previousUrl: latestPdfUrlRef.current
    });
    updatePdfInstance(pdfDocument);
  }, [pdfDocument, updatePdfInstance]);

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
    completedPdfDocument === pdfDocument && Boolean(pdfInstance.url);

  return {
    pdfDocument,
    pdfUrl: isPdfDocumentReady ? pdfInstance.url : null,
    isPdfDocumentLoading:
      Boolean(invoiceData) &&
      (!pdfDocumentTranslator ||
        !pdfDocument ||
        pdfInstance.loading ||
        !isPdfDocumentReady)
  };
}
