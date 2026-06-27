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
import {
  ArrowDownTrayIcon,
  LanguageIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { JSX, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import type { InvoiceBody, InvoiceStatus } from '@invoicetrackr/types';
import { analyticsEvents } from '@/lib/analytics/events';
import { availableLanguages } from '@/lib/constants/profile';
import { captureAnalyticsEvent } from '@/lib/analytics/client';
import { getInvoiceDueStatus } from '@/lib/utils/invoice';
import useCookieConsent from '@/lib/hooks/use-cookie-consent';

import PdfViewerWrapper from '../pdf/pdf-viewer-wrapper';

const PDFDownloadLink = dynamic(
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

const statusIndicatorClassMap: Record<
  InvoiceStatus,
  { dot: string; text: string }
> = {
  paid: { dot: 'bg-success', text: 'text-success' },
  pending: { dot: 'bg-warning', text: 'text-warning' },
  canceled: { dot: 'bg-danger', text: 'text-danger' }
};

type Props = {
  invoiceLanguage: string;
  setInvoiceLanguage?: (_lang: string) => void;
  isOpen: boolean;
  onOpenChange: (_isOpen: boolean) => void;
  invoiceData: InvoiceBody;
  userPreferredInvoiceLanguage?: string;
  pdfDocument: JSX.Element | null;
  pdfUrl?: string | null;
  isPdfDocumentLoading?: boolean;
  showFooterStatus?: boolean;
};

const InvoiceModal = ({
  pdfDocument,
  invoiceLanguage,
  setInvoiceLanguage,
  isOpen,
  onOpenChange,
  invoiceData,
  userPreferredInvoiceLanguage,
  pdfUrl,
  isPdfDocumentLoading,
  showFooterStatus = false
}: Props) => {
  const t = useTranslations('invoices.pdf');
  const tTable = useTranslations('invoices.table');
  const { invoiceId } = invoiceData;
  const [isIFrameLoading, setIsIFrameLoading] = useState(false);

  const { cookieConsent } = useCookieConsent();

  const renderModalBody = () => {
    if (isPdfDocumentLoading || (!pdfUrl && !pdfDocument)) {
      return (
        <div className="flex aspect-[794/1123] w-full items-center justify-center lg:min-h-[1123px]">
          <Spinner />
        </div>
      );
    }

    return (
      <PdfViewerWrapper
        pdfDocument={pdfDocument}
        pdfUrl={pdfUrl}
        isIFrameLoading={isIFrameLoading}
        setIsIFrameLoading={setIsIFrameLoading}
      />
    );
  };

  const renderAlert = () => {
    const { isPastDue, daysPastDue } = getInvoiceDueStatus(invoiceData);

    if (!isPastDue) return null;

    return (
      <Alert className="bg-transparent p-0 shadow-none" status="danger">
        <Alert.Indicator />
        <Alert.Content className="justify-center">
          <Alert.Description className="text-danger-soft-foreground font-medium">
            {t('past_due_alert', {
              days: daysPastDue,
              dueDate: invoiceData.dueDate
            })}
          </Alert.Description>
        </Alert.Content>
      </Alert>
    );
  };

  const renderFooterStatus = () => {
    if (!showFooterStatus) return null;

    const statusClasses = statusIndicatorClassMap[invoiceData.status];

    return (
      <div
        className={cn(
          'flex items-center gap-2 text-xs font-medium',
          statusClasses.text
        )}
      >
        <span
          className={cn(
            'inline-flex h-2 w-2 shrink-0 rounded-full',
            statusClasses.dot
          )}
        />
        {tTable(`status.${invoiceData.status}`)}
      </div>
    );
  };

  const pastDueAlert = renderAlert();

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && onOpenChange(false)}
      >
        <Modal.Container size="cover">
          <Modal.Dialog
            className={cn(
              'grid h-full overflow-hidden p-0',
              pastDueAlert
                ? 'grid-rows-[auto_auto_minmax(0,1fr)_auto]'
                : 'grid-rows-[auto_minmax(0,1fr)_auto]'
            )}
          >
            <Modal.Header className="border-default-200 bg-overlay/95 flex flex-col items-start gap-2 border-b px-5 py-3 backdrop-blur-xl sm:px-6">
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {invoiceId}
                    </span>
                    {invoiceData.receiver.name && (
                      <span className="text-muted block truncate text-xs">
                        {invoiceData.receiver.name}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={cn('flex shrink-0 items-center gap-1.5', {
                    'p-0': !userPreferredInvoiceLanguage
                  })}
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
                    <PDFDownloadLink
                      document={pdfDocument}
                      fileName={`${invoiceId}.pdf`}
                    >
                      {({ loading }) => {
                        const isLoading = isIFrameLoading || loading;

                        return (
                          <Button
                            size="sm"
                            isDisabled={isLoading}
                            variant="primary"
                            onPress={() => {
                              if (cookieConsent !== 'accepted') return;

                              captureAnalyticsEvent(
                                analyticsEvents.pdfDownloaded,
                                {
                                  source: invoiceData.id
                                    ? 'saved_invoice'
                                    : 'free_invoice',
                                  invoice_status: invoiceData.status,
                                  line_count: invoiceData.services.length
                                }
                              );
                            }}
                          >
                            <ArrowDownTrayIcon className="h-5 w-5 dark:text-white" />
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
                  <div className="border-default-400 mx-1 h-6 border-r" />
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={t('buttons.close')}
                    onPress={() => onOpenChange(false)}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Modal.Header>
            {pastDueAlert && (
              <div className="border-danger-soft bg-danger/5 flex border-b px-5 py-2 sm:px-6">
                {pastDueAlert}
              </div>
            )}
            <div className="bg-default-100 scrollbar min-h-0 overflow-y-auto overscroll-contain">
              <div className="flex min-h-full justify-center px-4 py-8 sm:px-10 sm:py-10">
                <div className="w-full max-w-[794px] rounded-sm bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.18),0_4px_12px_-4px_rgba(0,0,0,0.08)]">
                  {renderModalBody()}
                </div>
              </div>
            </div>
            <footer className="border-default-200 bg-overlay grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t px-5 py-3 sm:px-6">
              <div className="text-muted flex min-w-0 items-center gap-2 text-xs">
                {renderFooterStatus()}
              </div>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => onOpenChange(false)}
              >
                {t('buttons.close')}
              </Button>
            </footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default InvoiceModal;
