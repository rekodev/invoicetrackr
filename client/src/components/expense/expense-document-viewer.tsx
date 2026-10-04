'use client';

import { Button, Modal, Spinner } from '@heroui/react';
import type { ExpenseAttachment } from '@invoicetrackr/types';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { getExpenseAttachmentAction } from '@/lib/actions/expense';

const PdfPreview = dynamic(() => import('./expense-pdf-preview'), { ssr: false, loading: () => <Spinner /> });

export default function ExpenseDocumentViewer({ userId, expenseId, document, onClose, onDownload, onOpenTab, isLinkPending }: {
  userId: number; expenseId: number; document: ExpenseAttachment;
  onClose: () => void; onDownload: () => void; onOpenTab: () => void; isLinkPending: boolean;
}) {
  const t = useTranslations('expenses.workspace.documents');
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [width, setWidth] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const isPdf = document.mimeType === 'application/pdf';

  const observeContainer = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let active = true;
    setUrl(null); setError(''); setImageLoading(true);
    const load = async () => {
      try {
        const result = await getExpenseAttachmentAction({ userId, expenseId, attachmentId: document.id });
        if (!active) return;
        if (!result.ok || !result.data?.previewUrl) { setError(result.message || t('load_failed')); return; }
        setUrl(result.data.previewUrl);
      } catch { if (active) setError(t('load_failed')); }
    };
    void load();
    return () => { active = false; };
  }, [userId, expenseId, document.id, attempt, t]);

  const fail = () => setError(t('preview_failed'));
  const previous = () => setPage((value) => Math.max(1, value - 1));
  const next = () => setPage((value) => Math.min(pages || 1, value + 1));

  return <Modal.Backdrop isOpen onOpenChange={(open) => !open && onClose()}>
    <Modal.Container size="cover" scroll="inside"><Modal.Dialog>
      <Modal.CloseTrigger />
      <Modal.Header><Modal.Heading className="break-words pr-8">{document.originalFileName}</Modal.Heading></Modal.Header>
      <Modal.Body>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {isPdf ? <>
            <Button size="sm" variant="secondary" isDisabled={page <= 1 || !pages || Boolean(error)} onPress={previous}>{t('previous_page')}</Button>
            <span aria-live="polite" className="text-sm tabular-nums">{t('page_count', { page, pages })}</span>
            <Button size="sm" variant="secondary" isDisabled={page >= pages || !pages || Boolean(error)} onPress={next}>{t('next_page')}</Button>
          </> : null}
          <Button size="sm" aria-label={t('zoom_out')} variant="secondary" isDisabled={zoom <= 50} onPress={() => setZoom((value) => value - 25)}>−</Button>
          <span aria-live="polite" className="text-sm tabular-nums">{zoom}%</span>
          <Button size="sm" aria-label={t('zoom_in')} variant="secondary" isDisabled={zoom >= 200} onPress={() => setZoom((value) => value + 25)}>+</Button>
          <Button size="sm" variant="tertiary" onPress={() => setZoom(100)}>{t('fit_width')}</Button>
        </div>
        <div ref={observeContainer} tabIndex={0} role="region" aria-label={t('preview')} className="min-h-64 overflow-auto"
          onKeyDown={(event) => {
            if (!isPdf || !pages || error) return;
            if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
            if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
          }}>
          {error ? <div className="space-y-3">
            <p role="alert" className="text-danger">{error}</p>
            <Button variant="secondary" onPress={() => { setPages(0); setPage(1); setAttempt((value) => value + 1); }}>{t('retry')}</Button>
          </div> : !url || !width ? <Spinner aria-label={t('loading')} /> : isPdf ?
            <PdfPreview key={`${url}-${attempt}`} url={url} page={page} width={Math.max(1, width * zoom / 100)} onLoaded={setPages} onError={fail} /> :
            <>
              {imageLoading ? <Spinner aria-label={t('loading')} /> : null}
              {/* Native img keeps authenticated URLs out of the Next image optimizer cache. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={document.originalFileName} style={{ width: width * zoom / 100, maxWidth: 'none' }}
                onLoad={() => setImageLoading(false)} onError={fail} />
            </>}
        </div>
      </Modal.Body>
      <Modal.Footer className="flex flex-wrap gap-2">
        <Button variant="secondary" isDisabled={isLinkPending} onPress={onDownload}>{t('download')}</Button>
        <Button variant="secondary" isDisabled={isLinkPending} onPress={onOpenTab}>{t('open_tab')}</Button>
        <Button variant="tertiary" onPress={onClose}>{t('close')}</Button>
      </Modal.Footer>
    </Modal.Dialog></Modal.Container>
  </Modal.Backdrop>;
}
