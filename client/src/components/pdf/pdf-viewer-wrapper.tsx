'use client';

import { Dispatch, JSX, SetStateAction, useEffect, useRef } from 'react';
import { Spinner, cn } from '@heroui/react';
import { PDFViewer } from '@react-pdf/renderer';

type Props = {
  isIFrameLoading: boolean;
  setIsIFrameLoading: Dispatch<SetStateAction<boolean>>;
  pdfDocument: JSX.Element;
};

export default function PdfViewerWrapper({
  pdfDocument,
  isIFrameLoading,
  setIsIFrameLoading
}: Props) {
  const iFrameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const iFrame = iFrameRef.current;
    if (!iFrame) return;

    if (iFrame.contentDocument?.readyState === 'complete') {
      setIsIFrameLoading(false);
      return;
    }

    setIsIFrameLoading(true);

    const handleLoad = () => setIsIFrameLoading(false);

    iFrame.addEventListener('load', handleLoad);

    return () => {
      iFrame.removeEventListener('load', handleLoad);
    };
  }, [setIsIFrameLoading]);

  return (
    <>
      <Spinner
        variant="wave"
        color="secondary"
        className={cn('my-6', {
          hidden: !isIFrameLoading
        })}
      />
      {/* @ts-ignore */}
      <PDFViewer
        showToolbar={false}
        innerRef={iFrameRef}
        className={cn('aspect-[210/297]', {
          hidden: isIFrameLoading
        })}
      >
        {pdfDocument}
      </PDFViewer>
    </>
  );
}
