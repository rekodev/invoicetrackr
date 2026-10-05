'use client';

import { ArrowDownTrayIcon, ArrowTopRightOnSquareIcon, EllipsisHorizontalIcon, EyeIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button, Card, Chip, Dropdown, Label, Modal, Separator, toast } from '@heroui/react';
import type { ExpenseAttachment } from '@invoicetrackr/types';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState, useTransition } from 'react';

import EmptyState from '@/components/empty-state';
import FileDropzone from '@/components/ui/file-dropzone';
import { deleteExpenseAttachmentAction, getExpenseAttachmentAction, getExpenseAttachmentsAction, replaceExpenseAttachmentAction, uploadExpenseAttachmentAction } from '@/lib/actions/expense';

import ExpenseDocumentViewer from './expense-document-viewer';

type DocumentDialog = { kind: 'add' } | { kind: 'replace' | 'remove'; document: ExpenseAttachment };

export default function ExpenseDocuments({ userId, expenseId, attachments }: {
  userId: number; expenseId: number; attachments: ExpenseAttachment[] | null;
}) {
  const t = useTranslations('expenses.workspace.documents');
  const locale = useLocale();
  const router = useRouter();
  const [documents, setDocuments] = useState(attachments);
  const [dialog, setDialog] = useState<DocumentDialog | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [listError, setListError] = useState('');
  const [preview, setPreview] = useState<ExpenseAttachment | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, startLoading] = useTransition();
  const busy = useRef(false);

  useEffect(() => { setDocuments(attachments); }, [attachments]);

  const openDialog = (value: DocumentDialog) => {
    setError(''); setFile(null); setDialog(value);
  };
  const closeDialog = () => {
    if (busy.current) return;
    setDialog(null); setError(''); setFile(null);
  };
  const retryList = () => startLoading(async () => {
    setListError('');
    try {
      const result = await getExpenseAttachmentsAction(userId, expenseId);
      if (!result.ok || !result.data) { setListError(result.message || t('load_failed')); return; }
      setDocuments(result.data);
    } catch { setListError(t('load_failed')); }
  });
  const save = () => {
    if (!dialog || busy.current) return;
    const operation = dialog;
    if (operation.kind !== 'remove') {
      if (!file) { setError(t('select_file')); return; }
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) { setError(t('invalid_type')); return; }
      if (file.size > 10 * 1024 * 1024) { setError(t('too_large')); return; }
    }
    busy.current = true;
    startTransition(async () => {
      setError('');
      try {
        const formData = new FormData();
        if (file) formData.append('file', file);
        if (operation.kind === 'remove') {
          const result = await deleteExpenseAttachmentAction({ userId, expenseId, attachmentId: operation.document.id });
          if (!result.ok) { setError(result.message); return; }
          setDocuments((current) => current?.filter((item) => item.id !== operation.document.id) ?? null);
          if (preview?.id === operation.document.id) setPreview(null);
          toast(result.message, { variant: 'success' });
        } else {
          const result = operation.kind === 'replace'
            ? await replaceExpenseAttachmentAction({ userId, expenseId, attachmentId: operation.document.id, formData })
            : await uploadExpenseAttachmentAction({ userId, expenseId, formData });
          if (!result.ok || !result.data) { setError(result.message || t('save_failed')); return; }
          const saved = result.data;
          setDocuments((current) => operation.kind === 'replace'
            ? current?.map((item) => item.id === saved.id ? saved : item) ?? null
            : current ? [saved, ...current] : null);
          if (operation.kind === 'replace' && preview?.id === operation.document.id) setPreview(null);
          toast(result.message, { variant: 'success' });
        }
        setDialog(null); setFile(null);
        router.refresh();
      } catch { setError(t('save_failed')); }
      finally { busy.current = false; }
    });
  };
  const openFile = (document: ExpenseAttachment, download: boolean) => {
    // Reserve a tab during the user gesture; asynchronous URL lookup must not be blocked as a popup.
    const tab = download ? null : window.open('about:blank', '_blank');
    if (tab) tab.opener = null;
    startLoading(async () => {
      try {
        const result = await getExpenseAttachmentAction({ userId, expenseId, attachmentId: document.id });
        const url = download ? result.data?.downloadUrl : result.data?.previewUrl;
        if (!result.ok || !url) { tab?.close(); toast(result.message || t('load_failed'), { variant: 'danger' }); return; }
        if (download) {
          const link = window.document.createElement('a');
          link.href = url; link.download = document.originalFileName;
          window.document.body.appendChild(link); link.click(); link.remove();
        } else if (tab) tab.location.href = url;
        else toast(t('popup_blocked'), { variant: 'danger' });
      } catch { tab?.close(); toast(t('load_failed'), { variant: 'danger' }); }
    });
  };
  const date = (value?: string | null) => value ? new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium', timeStyle: 'short'
  }).format(new Date(value)) : null;

  return <Card className="gap-0 overflow-hidden border p-0">
    <Card.Header className="flex-row flex-wrap items-center justify-between gap-2 border-b p-4">
      <div className="flex items-center gap-2">
        <h2 className="font-medium">{t('title')}</h2>
        {documents ? <Chip size="sm" variant="soft">{documents.length}</Chip> : null}
      </div>
      {documents?.length !== 0 ? <Button size="sm" isIconOnly aria-label={t('add')} isDisabled={isPending} onPress={() => openDialog({ kind: 'add' })}><PlusIcon className="size-4" /></Button> : null}
    </Card.Header>
    <Card.Content className="p-0">
      {documents === null ? <div className="space-y-2 p-4">
        <p role="alert" className="text-danger text-sm">{listError || t('load_failed')}</p>
        <Button variant="secondary" size="sm" isPending={isLoading} isDisabled={isLoading} onPress={retryList}>{t('retry')}</Button>
      </div> : documents.length === 0 ? <EmptyState
        title={t('missing')}
        description={t('missing_description')}
        className="min-h-0 px-4 py-6"
        action={<Button size="sm" variant="secondary" isDisabled={isPending} onPress={() => openDialog({ kind: 'add' })}><PlusIcon className="size-4" />{t('add')}</Button>}
      /> : <ul className="divide-y">
        {documents.map((document) => <li key={document.id} className="flex items-start gap-2 p-4">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-sm font-medium" title={document.originalFileName}>{document.originalFileName}</p>
            <p className="text-muted text-xs">{document.mimeType === 'application/pdf' ? 'PDF' : document.mimeType === 'image/png' ? 'PNG' : 'JPEG'} · {new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(document.fileSize / 1024)} KB</p>
            {document.uploadedAt ? <p className="text-muted text-xs">{t('uploaded', { date: date(document.uploadedAt)! })}</p> : null}
            {document.updatedAt && document.updatedAt !== document.uploadedAt ? <p className="text-muted text-xs">{t('updated', { date: date(document.updatedAt)! })}</p> : null}
          </div>
          <Dropdown>
            <Button size="sm" isIconOnly variant="tertiary" aria-label={t('actions', { name: document.originalFileName })} isDisabled={isLoading || isPending}>
              <EllipsisHorizontalIcon className="size-4" />
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu aria-label={t('actions', { name: document.originalFileName })}>
                <Dropdown.Item id="preview" textValue={t('preview')} onAction={() => setPreview(document)}><EyeIcon className="size-4" /><Label>{t('preview')}</Label></Dropdown.Item>
                <Dropdown.Item id="download" textValue={t('download')} onAction={() => openFile(document, true)}><ArrowDownTrayIcon className="size-4" /><Label>{t('download')}</Label></Dropdown.Item>
                <Dropdown.Item id="open-tab" textValue={t('open_tab')} onAction={() => openFile(document, false)}><ArrowTopRightOnSquareIcon className="size-4" /><Label>{t('open_tab')}</Label></Dropdown.Item>
                <Separator className="-ms-1.5 w-[calc(100%+0.75rem)]" />
                <Dropdown.Item id="replace" textValue={t('replace')} onAction={() => openDialog({ kind: 'replace', document })}><PencilSquareIcon className="size-4" /><Label>{t('replace')}</Label></Dropdown.Item>
                <Dropdown.Item id="remove" textValue={t('remove')} variant="danger" className="hover:bg-danger-soft data-[hovered=true]:bg-danger-soft" onAction={() => openDialog({ kind: 'remove', document })}><TrashIcon className="text-danger size-4" /><Label>{t('remove')}</Label></Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </li>)}
      </ul>}
    </Card.Content>
    {preview ? <ExpenseDocumentViewer key={preview.id} userId={userId} expenseId={expenseId} document={preview}
      onClose={() => setPreview(null)} onDownload={() => openFile(preview, true)} onOpenTab={() => openFile(preview, false)} isLinkPending={isLoading} /> : null}
    <Modal.Backdrop isOpen={Boolean(dialog)} isDismissable={!isPending} isKeyboardDismissDisabled={isPending} onOpenChange={(open) => !open && closeDialog()}>
      <Modal.Container size="lg"><Modal.Dialog>
        {!isPending ? <Modal.CloseTrigger /> : null}
        <Modal.Header><Modal.Heading>{dialog ? t(dialog.kind) : t('add')}</Modal.Heading></Modal.Header>
        <Modal.Body>
          {dialog?.kind === 'remove' ? <p className="break-words">{t('confirm_remove', { name: dialog.document.originalFileName })}</p> : <>
            {dialog?.kind === 'replace' ? <p className="break-words">{t('confirm_replace', { name: dialog.document.originalFileName, replacement: file?.name ?? t('select_file') })}</p> : null}
            <fieldset disabled={isPending}>
              <FileDropzone title={t('dropzone_title')} hint={t('hint')} actionLabel={t('select_file')}
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" selectedFile={file}
                onFileChange={(value) => { if (!busy.current) { setFile(value); setError(''); } }} />
            </fieldset>
          </>}
          {error ? <p role="alert" className="text-danger text-sm">{error}</p> : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="tertiary" isDisabled={isPending} onPress={closeDialog}>{t('cancel')}</Button>
          <Button variant={dialog?.kind === 'remove' ? 'danger' : 'primary'} isPending={isPending} isDisabled={isPending}
            onPress={save}>{dialog ? t(dialog.kind === 'add' ? 'upload' : dialog.kind) : t('upload')}</Button>
        </Modal.Footer>
      </Modal.Dialog></Modal.Container>
    </Modal.Backdrop>
  </Card>;
}
