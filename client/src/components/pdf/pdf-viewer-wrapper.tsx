'use client';

import {
  Dispatch,
  JSX,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from 'react';
import { BlobProvider } from '@react-pdf/renderer';
import { Spinner } from '@heroui/react';

type Props = {
  isIFrameLoading: boolean;
  setIsIFrameLoading: Dispatch<SetStateAction<boolean>>;
  pdfDocument: JSX.Element;
};

type PdfComponents = Pick<typeof import('react-pdf'), 'Document' | 'Page'>;

export default function PdfViewerWrapper({
  pdfDocument,
  isIFrameLoading,
  setIsIFrameLoading
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pdfComponents, setPdfComponents] = useState<PdfComponents>();

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const loadPdfComponents = async () => {
      const { Document, Page, pdfjs } = await import('react-pdf');

      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();

      setPdfComponents({ Document, Page });
    };

    loadPdfComponents();
  }, []);

  return (
    <div ref={containerRef} className="flex w-full justify-center">
      <BlobProvider document={pdfDocument}>
        {({ url, loading }) => {
          if (loading || !url || !containerWidth || !pdfComponents) {
            return (
              <Spinner variant="wave" color="secondary" className="my-6" />
            );
          }

          const { Document, Page } = pdfComponents;

          return (
            <Document
              file={url}
              loading={
                <Spinner variant="wave" color="secondary" className="my-6" />
              }
              onLoadSuccess={() => setIsIFrameLoading(false)}
              onLoadError={() => setIsIFrameLoading(false)}
            >
              <Page
                pageNumber={1}
                width={containerWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </Document>
          );
        }}
      </BlobProvider>
      {isIFrameLoading && <span className="sr-only">Loading PDF preview</span>}
    </div>
  );
}
