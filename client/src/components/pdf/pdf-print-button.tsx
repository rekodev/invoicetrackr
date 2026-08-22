'use client';

import { PrinterIcon } from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { BlobProvider } from '@react-pdf/renderer';
import type { JSX } from 'react';

type Props = {
  document: JSX.Element;
  label: string;
};

export default function PdfPrintButton({ document, label }: Props) {
  return (
    <BlobProvider document={document}>
      {({ url, loading }) => (
        <Button
          size="sm"
          variant="secondary"
          isDisabled={loading || !url}
          className="w-full sm:w-auto"
          onPress={() => {
            if (!url) return;

            const printWindow = window.open(url, '_blank');
            if (!printWindow) return;

            printWindow.addEventListener(
              'load',
              () => {
                printWindow.focus();
                printWindow.print();
              },
              { once: true }
            );
          }}
        >
          <PrinterIcon className="h-5 w-5" />
          {label}
        </Button>
      )}
    </BlobProvider>
  );
}
