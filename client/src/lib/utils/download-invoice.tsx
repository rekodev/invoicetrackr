import type { InvoiceBody } from '@invoicetrackr/types';

export async function downloadInvoice(
  invoice: InvoiceBody,
  preferredLanguage: string
) {
  const [{ pdf }, { PDFDocument }, { createPdfTranslator }] = await Promise.all(
    [
      import('@react-pdf/renderer'),
      import('@invoicetrackr/pdf'),
      import('@invoicetrackr/pdf/translations')
    ]
  );
  const language = invoice.documentLanguage || preferredLanguage;
  const blob = await pdf(
    <PDFDocument
      t={createPdfTranslator(language)}
      language={language}
      currency={invoice.currency || 'eur'}
      invoiceData={invoice}
      senderSignatureImage={invoice.senderSignature as string}
      receiverSignatureImage={invoice.receiverSignature as string}
    />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.invoiceId || `draft-${invoice.id}`}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
