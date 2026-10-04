import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getExpenseAttachmentAction } from '@/lib/actions/expense';
import { attachment } from '@/test/expense-fixtures';
import { withIntl } from '@/test/with-intl';

import ExpenseDocumentViewer from '../expense-document-viewer';

vi.mock('@/lib/actions/expense', () => ({ getExpenseAttachmentAction: vi.fn() }));
vi.mock('next/dynamic', () => ({ default: () => ({ page, width, onLoaded, onError }: {
  page: number; width: number; onLoaded: (_pages: number) => void; onError: () => void;
}) => <div><span>PDF page {page}, width {width}</span><button onClick={() => onLoaded(3)}>Load PDF</button><button onClick={onError}>Fail PDF</button></div> }));

beforeEach(() => {
  vi.mocked(getExpenseAttachmentAction).mockResolvedValue({ ok: true, message: '', data: { ...attachment, previewUrl: 'https://storage/fresh' } });
  vi.stubGlobal('ResizeObserver', class {
    constructor(private callback: ResizeObserverCallback) {}
    observe() { this.callback([{ contentRect: { width: 700 } } as ResizeObserverEntry], this as unknown as ResizeObserver); }
    disconnect() {}
  });
});
afterEach(() => vi.unstubAllGlobals());
const props = () => ({ userId: 1, expenseId: 10, document: attachment, onClose: vi.fn(), onDownload: vi.fn(), onOpenTab: vi.fn(), isLinkPending: false });

describe('expense document viewer', () => {
  it('supports all PDF pages, keyboard navigation, zoom, and fit width', async () => {
    render(withIntl(<ExpenseDocumentViewer {...props()} />));
    await userEvent.click(await screen.findByRole('button', { name: 'Load PDF' }));
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('PDF page 2, width 700')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('region', { name: 'Preview' }), { key: 'ArrowRight' });
    expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(screen.getByText('PDF page 3, width 875')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fit to width' }));
    expect(screen.getByText('PDF page 3, width 700')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('retries a failed preview with a fresh signed URL', async () => {
    render(withIntl(<ExpenseDocumentViewer {...props()} />));
    await userEvent.click(await screen.findByRole('button', { name: 'Fail PDF' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to display this document');
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByRole('button', { name: 'Load PDF' });
    expect(getExpenseAttachmentAction).toHaveBeenCalledTimes(2);
  });

  it('zooms images without loading PDF controls and offers download/new-tab actions', async () => {
    const callbacks = props();
    render(withIntl(<ExpenseDocumentViewer {...callbacks} document={{ ...attachment, mimeType: 'image/png', originalFileName: 'receipt.png' }} />));
    const image = await screen.findByRole('img', { name: 'receipt.png' });
    fireEvent.load(image);
    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(image).toHaveStyle({ width: '525px' });
    await userEvent.click(screen.getByRole('button', { name: 'Download' }));
    await userEvent.click(screen.getByRole('button', { name: 'Open in new tab' }));
    expect(callbacks.onDownload).toHaveBeenCalledOnce();
    expect(callbacks.onOpenTab).toHaveBeenCalledOnce();
    fireEvent.error(image);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to display this document'));
  });
});
