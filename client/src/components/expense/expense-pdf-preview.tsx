'use client';

import { Spinner } from '@heroui/react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export default function ExpensePdfPreview({ url, page, width, onLoaded, onError }: {
  url: string; page: number; width: number; onLoaded: (_pages: number) => void; onError: () => void;
}) {
  return <Document file={url} loading={<Spinner />} error={<span />}
    onLoadSuccess={({ numPages }) => onLoaded(numPages)} onLoadError={onError} onSourceError={onError}>
    <Page pageNumber={page} width={width} loading={<Spinner />} error={<span />}
      renderAnnotationLayer={false} renderTextLayer={false} onRenderError={onError} onLoadError={onError} />
  </Document>;
}
