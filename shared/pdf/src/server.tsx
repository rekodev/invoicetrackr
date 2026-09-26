import type { InvoiceBody } from '@invoicetrackr/types';
import { renderToBuffer } from '@react-pdf/renderer';

import PDFDocument from './pdf-document';
import { createPdfTranslator } from './translations';

const assertStoredImage = (source: unknown) => {
  if (!source) return;
  if (typeof source !== 'string') throw new Error('Invalid invoice image');
  if (/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(source)) return;
  const url = new URL(source);
  if (url.protocol !== 'https:' || !['res.cloudinary.com', 'asset.cloudinary.com'].includes(url.hostname)
    || url.username || url.password || (url.port && url.port !== '443'))
    throw new Error('Invoice image must use the trusted upload provider');
};

export const renderInvoicePdf = (invoice: InvoiceBody) => {
  // Saved image fields must never become arbitrary filesystem or internal URL reads.
  [invoice.sender.logoUrl, invoice.senderSignature, invoice.receiverSignature].forEach(assertStoredImage);
  return renderToBuffer(
    <PDFDocument
      invoiceData={invoice}
      t={createPdfTranslator(invoice.documentLanguage || 'lt')}
      language={invoice.documentLanguage || 'lt'}
      currency={invoice.currency || 'eur'}
      senderSignatureImage={invoice.senderSignature || ''}
      receiverSignatureImage={invoice.receiverSignature || ''}
    />
  );
};
