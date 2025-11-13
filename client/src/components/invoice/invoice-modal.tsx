'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader
} from '@heroui/react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

import { CookieConsentStatus } from '@/lib/types';
import { Invoice } from '@invoicetrackr/types';
import useCookieConsent from '@/lib/hooks/use-cookie-consent';

import PDFDocument from '../pdf/pdf-document';

type Props = {
  currency: string;
  language: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoiceData: Invoice;
  senderSignatureImage: string;
};

const InvoiceModal = ({
  currency,
  language,
  isOpen,
  onOpenChange,
  invoiceData,
  senderSignatureImage
}: Props) => {
  const t = useTranslations('invoices.pdf');
  const { invoiceId } = invoiceData;

  const { cookieConsent } = useCookieConsent();

  const renderPdfDocument = () => (
    <PDFDocument
      t={t}
      language={language}
      currency={currency}
      invoiceData={invoiceData}
      senderSignatureImage={senderSignatureImage}
      bankAccount={invoiceData.bankingInformation}
    />
  );

  return (
    <Modal
      className="max-h-[84.84vh] min-w-[50%] pb-4"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-4 pb-2">
          {invoiceId}
          <PDFDownloadLink
            document={renderPdfDocument()}
            fileName={`${invoiceId}.pdf`}
          >
            <Button
              startContent={
                <ArrowDownTrayIcon className="h-4 w-4 dark:text-white" />
              }
              size="sm"
              variant="faded"
              onPress={() => {
                if (cookieConsent !== CookieConsentStatus.Accepted) return;

                window.dataLayer?.push({
                  event: 'free_invoice_pdf_download',
                  invoice_id: invoiceData.invoiceId,
                  total_amount: invoiceData.totalAmount
                });
              }}
            >
              {t('buttons.download_pdf')}
            </Button>
          </PDFDownloadLink>
        </ModalHeader>
        <ModalBody className="overflow-y-scroll">
          <PDFViewer className="aspect-[210/297]">
            {renderPdfDocument()}
          </PDFViewer>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InvoiceModal;
