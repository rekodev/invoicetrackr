'use client';

import { ArrowDownTrayIcon, LanguageIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem
} from '@heroui/react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { useTranslations } from 'next-intl';

import { CookieConsentStatus } from '@/lib/types';
import { InvoiceBody } from '@invoicetrackr/types';
import { availableLanguages } from '@/lib/constants/profile';
import useCookieConsent from '@/lib/hooks/use-cookie-consent';

import PDFDocument from '../pdf/pdf-document';
import { useState } from 'react';

type Props = {
  currency: string;
  language: string;
  isOpen: boolean;
  onOpenChange: (_isOpen: boolean) => void;
  invoiceData: InvoiceBody;
  senderSignatureImage: string;
  userPreferredInvoiceLanguage?: string;
};

const InvoiceModal = ({
  currency,
  language,
  isOpen,
  onOpenChange,
  invoiceData,
  senderSignatureImage,
  userPreferredInvoiceLanguage
}: Props) => {
  const t = useTranslations('invoices.pdf');
  const { invoiceId } = invoiceData;

  const [invoiceLanguage, setInvoiceLanguage] = useState(
    userPreferredInvoiceLanguage || language
  );

  const { cookieConsent } = useCookieConsent();

  const renderPdfDocument = () => (
    <PDFDocument
      t={t}
      language={invoiceLanguage}
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
        <ModalHeader className="flex flex-col items-start gap-2 pb-2">
          <div className="flex items-center gap-4">
            <span className="text-xl font-semibold">{invoiceId}</span>
            {/* // TODO: Improve select UX/UI */}
            {userPreferredInvoiceLanguage && (
              <Select
                aria-label="Invoice language"
                size="sm"
                variant="faded"
                className="w-40"
                startContent={<LanguageIcon className="h-4 w-4" />}
                selectedKeys={[invoiceLanguage]}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys).join('');
                  if (selectedKey) {
                    setInvoiceLanguage(selectedKey);
                  }
                }}
              >
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.code} textValue={lang.code}>
                    {/* // TODO: Add translation */}
                    {lang.nameTranslationKey}
                  </SelectItem>
                ))}
              </Select>
            )}
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
          </div>
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
