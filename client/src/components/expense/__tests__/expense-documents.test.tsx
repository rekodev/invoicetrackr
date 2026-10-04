import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteExpenseAttachmentAction, getExpenseAttachmentAction, getExpenseAttachmentsAction, replaceExpenseAttachmentAction, uploadExpenseAttachmentAction } from '@/lib/actions/expense';
import { attachment } from '@/test/expense-fixtures';
import { withIntl } from '@/test/with-intl';

import ExpenseDocuments from '../expense-documents';

const navigation = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => navigation }));
vi.mock('@/lib/actions/expense', () => ({
  deleteExpenseAttachmentAction: vi.fn(), getExpenseAttachmentAction: vi.fn(), getExpenseAttachmentsAction: vi.fn(),
  replaceExpenseAttachmentAction: vi.fn(), uploadExpenseAttachmentAction: vi.fn()
}));
vi.mock('../expense-document-viewer', () => ({ default: ({ onClose }: { onClose: () => void }) => <button onClick={onClose}>Close preview</button> }));

beforeEach(() => {
  vi.mocked(uploadExpenseAttachmentAction).mockResolvedValue({ ok: true, message: 'Uploaded', data: attachment });
  vi.mocked(replaceExpenseAttachmentAction).mockResolvedValue({ ok: true, message: 'Replaced', data: { ...attachment, originalFileName: 'new.pdf' } });
  vi.mocked(deleteExpenseAttachmentAction).mockResolvedValue({ ok: true, message: 'Removed' });
  vi.mocked(getExpenseAttachmentsAction).mockResolvedValue({ ok: true, message: '', data: [attachment] });
});
const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

describe('expense documents', () => {
  it('shows missing documents and refreshes after adding one file', async () => {
    render(withIntl(<ExpenseDocuments userId={1} expenseId={10} attachments={[]} />));
    expect(screen.getByText('No supporting documents')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Add document' }));
    await userEvent.upload(fileInput(), new File(['pdf'], 'receipt.pdf', { type: 'application/pdf' }));
    await userEvent.click(screen.getByRole('button', { name: 'Upload' }));
    await waitFor(() => expect(navigation.refresh).toHaveBeenCalledOnce());
    expect(uploadExpenseAttachmentAction).toHaveBeenCalledWith(expect.objectContaining({ userId: 1, expenseId: 10, formData: expect.any(FormData) }));
    expect(screen.queryByText('No supporting documents')).not.toBeInTheDocument();
    expect(screen.getByText('receipt.pdf')).toBeInTheDocument();
  });

  it('preserves selected file and old document after a replacement failure', async () => {
    vi.mocked(replaceExpenseAttachmentAction).mockResolvedValueOnce({ ok: false, message: 'Storage unavailable' });
    render(withIntl(<ExpenseDocuments userId={1} expenseId={10} attachments={[attachment]} />));
    await userEvent.click(screen.getByRole('button', { name: 'Replace document' }));
    await userEvent.upload(fileInput(), new File(['pdf'], 'new.pdf', { type: 'application/pdf' }));
    expect(screen.getByText('Replace “receipt.pdf” with “new.pdf”? The previous file will be removed.')).toBeInTheDocument();
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Replace document' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Storage unavailable');
    expect(fileInput().files?.[0]?.name).toBe('new.pdf');
    expect(navigation.refresh).not.toHaveBeenCalled();
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Replace document' }));
    await waitFor(() => expect(navigation.refresh).toHaveBeenCalledOnce());
    expect(screen.getByText('new.pdf')).toBeInTheDocument();
    expect(screen.queryByText('receipt.pdf')).not.toBeInTheDocument();
  });

  it('requires removal confirmation and preserves the document when removal fails', async () => {
    vi.mocked(deleteExpenseAttachmentAction).mockResolvedValueOnce({ ok: false, message: 'Unable to remove' });
    render(withIntl(<ExpenseDocuments userId={1} expenseId={10} attachments={[attachment]} />));
    await userEvent.click(screen.getByRole('button', { name: 'Remove document' }));
    expect(deleteExpenseAttachmentAction).not.toHaveBeenCalled();
    expect(screen.getByText('Remove “receipt.pdf” from this expense? This cannot be undone.')).toBeInTheDocument();
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove document' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to remove');
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove document' }));
    expect(await screen.findByText('No supporting documents')).toBeInTheDocument();
  });

  it('recovers a document-list error without calling it an empty list', async () => {
    render(withIntl(<ExpenseDocuments userId={1} expenseId={10} attachments={null} />));
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load documents');
    expect(screen.queryByText('No supporting documents')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('receipt.pdf')).toBeInTheDocument();
    expect(getExpenseAttachmentsAction).toHaveBeenCalledWith(1, 10);
  });

  it('blocks duplicate uploads and dismissal while saving', async () => {
    let complete!: (_value: Awaited<ReturnType<typeof uploadExpenseAttachmentAction>>) => void;
    vi.mocked(uploadExpenseAttachmentAction).mockReturnValueOnce(new Promise((resolve) => { complete = resolve; }));
    render(withIntl(<ExpenseDocuments userId={1} expenseId={10} attachments={[]} />));
    await userEvent.click(screen.getByRole('button', { name: 'Add document' }));
    await userEvent.upload(fileInput(), new File(['pdf'], 'receipt.pdf', { type: 'application/pdf' }));
    const upload = screen.getByRole('button', { name: 'Upload' });
    await userEvent.click(upload);
    expect(upload).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await userEvent.click(upload);
    expect(uploadExpenseAttachmentAction).toHaveBeenCalledOnce();
    complete({ ok: true, message: '', data: attachment });
    await waitFor(() => expect(navigation.refresh).toHaveBeenCalledOnce());
  });

  it('requests a fresh URL before opening a document in a new tab', async () => {
    vi.mocked(getExpenseAttachmentAction).mockResolvedValue({ ok: true, message: '', data: { ...attachment, previewUrl: 'https://storage/fresh' } });
    const tab = { opener: {}, location: { href: '' }, close: vi.fn() };
    const open = vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
    render(withIntl(<ExpenseDocuments userId={1} expenseId={10} attachments={[attachment]} />));
    await userEvent.click(screen.getByRole('button', { name: 'Open in new tab' }));
    await waitFor(() => expect(tab.location.href).toBe('https://storage/fresh'));
    expect(getExpenseAttachmentAction).toHaveBeenCalledWith({ userId: 1, expenseId: 10, attachmentId: 3 });
    expect(tab.opener).toBeNull();
    open.mockRestore();
  });

  it('downloads using the newly fetched attachment URL', async () => {
    vi.mocked(getExpenseAttachmentAction).mockResolvedValue({ ok: true, message: '', data: { ...attachment, downloadUrl: 'https://storage/download-fresh' } });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.href).toBe('https://storage/download-fresh');
      expect(this.download).toBe('receipt.pdf');
    });
    render(withIntl(<ExpenseDocuments userId={1} expenseId={10} attachments={[attachment]} />));
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    await waitFor(() => expect(click).toHaveBeenCalledOnce());
    click.mockRestore();
  });
});
