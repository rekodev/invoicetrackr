'use client';

import {
  Alert,
  Button,
  ListBox,
  ListBoxItem,
  Modal,
  Select,
  Spinner,
  cn
} from '@heroui/react';
import { ArrowDownTrayIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { JSX, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const PDFDownloadLink = dynamic(
  // @ts-ignore
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const t = useTranslations('invoices.pdf');

      return (
        <Button isPending size="sm" variant="primary">
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
      return <Spinner className="my-6" />;
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
      <Alert className="mt-2 py-1 pl-2" status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>
            {t('past_due_alert', {
              days: daysPastDue,
              dueDate: invoiceData.dueDate
            })}
          </Alert.Description>
        </Alert.Content>
      </Alert>
    );
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && onOpenChange(false)}
      >
        <Modal.Container size="cover" scroll="outside">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header className="flex flex-col items-start gap-2 pb-2">
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">{invoiceId}</span>
                </div>
                <div
                  className={cn(
                    'bg-default flex shrink-0 items-center gap-1 rounded-lg p-0.5',
                    {
                      'p-0': !userPreferredInvoiceLanguage
                    }
                  )}
                >
                  {userPreferredInvoiceLanguage && (
                    <>
                      <Select
                        aria-label="Invoice language"
                        className="min-w-28"
                        variant="secondary"
                        value={invoiceLanguage}
                        onChange={(key) => {
                          const selectedKey = key ? String(key) : '';
                          if (selectedKey && setInvoiceLanguage)
                            setInvoiceLanguage(selectedKey);
                          setIsIFrameLoading(true);
                        }}
                      >
                        <Select.Trigger>
                          <LanguageIcon className="min-w-5 max-w-5" />
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {availableLanguages.map((lang) => (
                              <ListBoxItem
                                key={lang.code}
                                id={lang.code}
                                textValue={lang.code.toUpperCase()}
                              >
                                {lang.code.toUpperCase()}
                                <ListBoxItem.Indicator />
                              </ListBoxItem>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>

                      <div className="border-default-400 h-6 border-r" />
                    </>
                  )}
                  {pdfDocument ? (
                    // @ts-ignore
                    <PDFDownloadLink
                      document={pdfDocument}
                      fileName={`${invoiceId}.pdf`}
                    >
                      {/* @ts-ignore */}
                      {({ loading }) => {
                        const isLoading = isIFrameLoading || loading;

                        return (
                          <Button
                            size="sm"
                            isDisabled={isLoading}
                            variant="primary"
                            onPress={() => {
                              if (
                                cookieConsent !== CookieConsentStatus.Accepted
                              )
                                return;

                              window.dataLayer?.push({
                                event: 'free_invoice_pdf_download',
                                invoice_id: invoiceData.invoiceId,
                                total_amount: invoiceData.totalAmount
                              });
                            }}
                          >
                            {!isLoading && (
                              <ArrowDownTrayIcon className="h-5 w-5 dark:text-white" />
                            )}
                            {t('buttons.download_pdf')}
                          </Button>
                        );
                      }}
                    </PDFDownloadLink>
                  ) : (
                    <Button isPending size="sm" variant="primary">
                      {t('buttons.download_pdf')}
                    </Button>
                  )}
                </div>
              </div>
              {renderAlert()}
            </Modal.Header>
            <Modal.Body>{renderModalBody()}</Modal.Body>
            <Modal.Footer />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default InvoiceModal;
