'use client';

import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  cn
} from '@heroui/react';
import { ArrowDownTrayIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { JSX, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const t = useTranslations('invoices.pdf');

      return (
        <Button isLoading size="sm" color="secondary" variant="solid">
          {t('buttons.download_pdf')}
        </Button>
      );
    }
  }
);

import { CookieConsentStatus } from '@/lib/types';
import { InvoiceBody } from '@invoicetrackr/types';
import { availableLanguages } from '@/lib/constants/profile';
import { getInvoiceDueStatus } from '@/lib/utils/invoice';
import useCookieConsent from '@/lib/hooks/use-cookie-consent';

import PdfViewerWrapper from '../pdf/pdf-viewer-wrapper';

type Props = {
  invoiceLanguage: string;
  setInvoiceLanguage?: (_lang: string) => void;
  isOpen: boolean;
  onOpenChange: (_isOpen: boolean) => void;
  invoiceData: InvoiceBody;
  userPreferredInvoiceLanguage?: string;
  pdfDocument: JSX.Element | null;
  isPdfDocumentLoading?: boolean;
};

const InvoiceModal = ({
  pdfDocument,
  invoiceLanguage,
  setInvoiceLanguage,
  isOpen,
  onOpenChange,
  invoiceData,
  userPreferredInvoiceLanguage,
  isPdfDocumentLoading
}: Props) => {
  const t = useTranslations('invoices.pdf');
  const { invoiceId } = invoiceData;
  const [isIFrameLoading, setIsIFrameLoading] = useState(false);

  const { cookieConsent } = useCookieConsent();

  const renderModalBody = () => {
    if (isPdfDocumentLoading || !pdfDocument) {
      return <Spinner variant="wave" color="secondary" className="my-6" />;
    }

    return (
      <PdfViewerWrapper
        pdfDocument={pdfDocument}
        isIFrameLoading={isIFrameLoading}
        setIsIFrameLoading={setIsIFrameLoading}
      />
    );
  };

  const renderAlert = () => {
    const { isPastDue, daysPastDue } = getInvoiceDueStatus(invoiceData);

    if (!isPastDue) return null;

    return (
      <Alert
        className="mt-2 py-1 pl-2"
        variant="flat"
        color="danger"
        description={t('past_due_alert', {
          days: daysPastDue,
          dueDate: invoiceData.dueDate
        })}
      />
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      hideCloseButton
      onOpenChange={onOpenChange}
      size="4xl"
      className="flex-1"
      scrollBehavior="outside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col items-start gap-2 pb-2">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">{invoiceId}</span>
            </div>
            <div
              className={cn(
                'bg-default flex items-center gap-1 rounded-lg p-0.5',
                {
                  'p-0': !userPreferredInvoiceLanguage
                }
              )}
            >
              {userPreferredInvoiceLanguage && (
                <>
                  <Select
                    aria-label="Invoice language"
                    size="sm"
                    className="w-22"
                    variant="bordered"
                    startContent={<LanguageIcon className="min-w-5 max-w-5" />}
                    selectedKeys={[invoiceLanguage]}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys).join('');
                      if (selectedKey && setInvoiceLanguage)
                        setInvoiceLanguage(selectedKey);
                      setIsIFrameLoading(true);
                    }}
                  >
                    {availableLanguages.map((lang) => (
                      <SelectItem
                        key={lang.code}
                        textValue={lang.code.toUpperCase()}
                      >
                        {lang.code.toUpperCase()}
                      </SelectItem>
                    ))}
                  </Select>

                  <div className="border-default-400 h-6 border-r" />
                </>
              )}
              {pdfDocument ? (
                <PDFDownloadLink
                  document={pdfDocument}
                  fileName={`${invoiceId}.pdf`}
                >
                  {({ loading }) => {
                    const isLoading = isIFrameLoading || loading;

                    return (
                      <Button
                        startContent={
                          <ArrowDownTrayIcon
                            className={cn('h-5 w-5 dark:text-white', {
                              hidden: isLoading
                            })}
                          />
                        }
                        size="sm"
                        isLoading={isLoading}
                        isDisabled={isLoading}
                        color="secondary"
                        variant="solid"
                        onPress={() => {
                          if (cookieConsent !== CookieConsentStatus.Accepted)
                            return;

                          window.dataLayer?.push({
                            event: 'free_invoice_pdf_download',
                            invoice_id: invoiceData.invoiceId,
                            total_amount: invoiceData.totalAmount
                          });
                        }}
                      >
                        {t('buttons.download_pdf')}
                      </Button>
                    );
                  }}
                </PDFDownloadLink>
              ) : (
                <Button isLoading size="sm" color="secondary" variant="solid">
                  {t('buttons.download_pdf')}
                </Button>
              )}
            </div>
          </div>
          {renderAlert()}
        </ModalHeader>
        <ModalBody>{renderModalBody()}</ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};

export default InvoiceModal;
