import type { InvoiceBody } from '@invoicetrackr/types';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useDynamicPdf from '../use-dynamic-pdf';

const { pdfState, updatePdf } = vi.hoisted(() => ({
  pdfState: { url: 'blob:old', loading: false },
  updatePdf: vi.fn()
}));
vi.mock('@react-pdf/renderer', () => ({ usePDF: () => [pdfState, updatePdf] }));
vi.mock('@/components/pdf/pdf-document', () => ({ default: () => null }));

const invoice = { invoiceId: 'SF007' } as InvoiceBody;
const options = {
  invoiceData: invoice,
  invoiceLanguage: 'lt',
  currency: 'eur' as const,
  senderSignatureImage: ''
};

describe('PDF readiness', () => {
  beforeEach(() => {
    pdfState.url = 'blob:old';
    pdfState.loading = false;
    updatePdf.mockClear();
  });

  it('hides the previous PDF until the current document has finished rendering', () => {
    const { result, rerender } = renderHook((props) => useDynamicPdf(props), { initialProps: options });
    expect(result.current.pdfUrl).toBeNull();
    expect(result.current.isPdfDocumentLoading).toBe(true);

    pdfState.url = 'blob:lt';
    rerender(options);
    expect(result.current.pdfUrl).toBe('blob:lt');

    rerender({ ...options, invoiceLanguage: 'en' });
    expect(result.current.pdfUrl).toBeNull();

    pdfState.url = 'blob:en';
    rerender({ ...options, invoiceLanguage: 'en' });
    expect(result.current.pdfUrl).toBe('blob:en');
    expect(result.current.isPdfDocumentLoading).toBe(false);
  });

  it('returns the document without generating a URL when generation is disabled', () => {
    const { result } = renderHook(() => useDynamicPdf({ ...options, generatePdfUrl: false }));
    expect(result.current.pdfDocument).not.toBeNull();
    expect(result.current.pdfUrl).toBeNull();
    expect(result.current.isPdfDocumentLoading).toBe(false);
    expect(updatePdf).not.toHaveBeenCalled();
  });
});
