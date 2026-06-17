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
  pdfDocument: JSX.Element | null;
  pdfUrl?: string | null;
};

type PdfComponents = Pick<typeof import('react-pdf'), 'Document' | 'Page'>;

let cachedPdfComponents: PdfComponents | undefined;

const PdfPreviewLoader = () => (
  <div className="flex aspect-[794/1123] w-full items-center justify-center lg:min-h-[1123px]">
    <Spinner />
  </div>
);

export default function PdfViewerWrapper({
  pdfDocument,
  pdfUrl,
  isIFrameLoading,
  setIsIFrameLoading
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pdfComponents, setPdfComponents] = useState<PdfComponents | undefined>(
    cachedPdfComponents
  );

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
      if (cachedPdfComponents) {
        setPdfComponents(cachedPdfComponents);
        return;
      }

      const { Document, Page, pdfjs } = await import('react-pdf');

      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();

      cachedPdfComponents = { Document, Page };
      setPdfComponents(cachedPdfComponents);
    };

    loadPdfComponents();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex w-full items-center justify-center overflow-visible"
    >
      {pdfUrl ? (
        pdfComponents && containerWidth ? (
          <pdfComponents.Document
            file={pdfUrl}
            loading={<PdfPreviewLoader />}
            onLoadSuccess={() => setIsIFrameLoading(false)}
            onLoadError={() => setIsIFrameLoading(false)}
          >
            <pdfComponents.Page
              pageNumber={1}
              width={containerWidth}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </pdfComponents.Document>
        ) : (
          <PdfPreviewLoader />
        )
      ) : (
        <>
          {!pdfDocument ? (
            <PdfPreviewLoader />
          ) : (
            <BlobProvider document={pdfDocument}>
              {({ url, loading }) => {
                if (loading || !url || !containerWidth || !pdfComponents) {
                  return <PdfPreviewLoader />;
                }

                const { Document, Page } = pdfComponents;

                return (
                  <Document
                    file={url}
                    loading={<PdfPreviewLoader />}
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
          )}
        </>
      )}
      {isIFrameLoading && <span className="sr-only">Loading PDF preview</span>}
    </div>
  );
}
