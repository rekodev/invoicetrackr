import { PDFDocument, pdfStyles } from '@invoicetrackr/pdf';
import { renderInvoicePdf } from '@invoicetrackr/pdf/server';
import { createPdfTranslator } from '@invoicetrackr/pdf/translations';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { invoiceFactory } from '../../test/factories/invoice';

const texts = (node: unknown): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(texts).join(' ');
  if (node && typeof node === 'object' && 'props' in node) {
    const props = node.props;
    if (props && typeof props === 'object' && 'children' in props) return texts(props.children);
  }
  return '';
};

describe('shared invoice PDF', () => {
  const originalFont = pdfStyles.page.fontFamily;
  beforeEach(() => {
    // Built-in fonts keep rendering tests independent of CDN availability.
    // Production continues using the existing Roboto font family.
    pdfStyles.page.fontFamily = 'Helvetica';
  });
  afterEach(() => { pdfStyles.page.fontFamily = originalFont; });

  it('renders the saved invoice as a PDF using its saved currency and language', async () => {
    const invoice = invoiceFactory.build({ lifecycleStatus: 'issued', documentLanguage: 'en',
      currency: 'eur', senderSignature: null, receiverSignature: null });
    const buffer = await renderInvoicePdf(invoice);
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('preserves Lithuanian characters, VAT, notes, and saved party details in the document tree', () => {
    const invoice = invoiceFactory.build({ lifecycleStatus: 'issued', documentLanguage: 'lt', currency: 'eur',
      sender: { name: 'Živilė Šimkutė', vatNumber: 'LT123456789' }, notes: 'Ačiū už bendradarbiavimą',
      subtotalAmount: '100.00', vatAmount: '21.00', totalAmount: '121.00',
      services: [{ description: 'Kūrybinės paslaugos', unit: 'hour', amount: '100.00', quantity: '1', vatRate: '21.00' }] });
    const tree = PDFDocument({ invoiceData: invoice, language: 'lt', currency: 'eur',
      t: createPdfTranslator('lt'), senderSignatureImage: '' });
    expect(texts(tree)).toContain('PVM SĄSKAITA FAKTŪRA');
    expect(texts(tree)).toContain('Živilė Šimkutė');
    expect(texts(tree)).toContain('Kūrybinės paslaugos');
    expect(texts(tree)).toContain('121.00');
    expect(texts(tree)).toContain('Ačiū už bendradarbiavimą');
    expect(texts(tree)).not.toContain('JUODRAŠTIS');
  });

  it('renders long invoices with automatic page wrapping', async () => {
    const invoice = invoiceFactory.build({ lifecycleStatus: 'issued', documentLanguage: 'en', currency: 'eur',
      senderSignature: null, receiverSignature: null,
      services: Array.from({ length: 60 }, (_, index) => ({ description: `Service ${index + 1} with a long description`,
        unit: 'hour', amount: '10.00', quantity: '1', vatRate: '21.00' })) });
    const buffer = await renderInvoicePdf(invoice);
    expect(buffer.toString('latin1').match(/\/Type \/Page\b/g)?.length).toBeGreaterThan(1);
  });

  it.each(['file:///etc/passwd', 'http://127.0.0.1/private', 'https://example.com/image.png'])('rejects unsafe stored image sources: %s', async (source) => {
    const invoice = invoiceFactory.build({ senderSignature: source });
    expect(() => renderInvoicePdf(invoice)).toThrow();
  });
});
