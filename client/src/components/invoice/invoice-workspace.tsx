'use client';

import {
  ArrowDownTrayIcon,
  BanknotesIcon,
  LinkIcon,
  NoSymbolIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  buttonVariants,
  Card,
  Chip,
  Modal,
  Spinner,
  toast
} from '@heroui/react';
import type {
  InvoiceEmailDelivery,
  InvoicePayment,
  InvoiceWorkspaceResponse
} from '@invoicetrackr/types';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { type ReactNode, useState, useTransition } from 'react';

import {
  deleteInvoiceAction,
  removeInvoicePaymentAction,
  updateInvoiceStatusAction
} from '@/lib/actions/invoice';
import { captureAnalyticsEvent } from '@/lib/analytics/client';
import { analyticsEvents } from '@/lib/analytics/events';
import { EDIT_INVOICE_PAGE, INVOICES_PAGE } from '@/lib/constants/pages';
import useDynamicPdf from '@/lib/hooks/pdf/use-dynamic-pdf';
import useCookieConsent from '@/lib/hooks/use-cookie-consent';
import { getInvoiceDueStatus, getInvoicePaymentStatus } from '@/lib/utils/invoice';

import PdfViewerWrapper from '../pdf/pdf-viewer-wrapper';
import InvoicePaymentDialog from './invoice-payment-dialog';
import IssueInvoiceModal from './issue-invoice-modal';
import RecipientDetailsRequestModal from './recipient-details-request-modal';
import SendInvoiceEmailModal from './send-invoice-email-modal';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((module) => module.PDFDownloadLink),
  { ssr: false }
);

type Props = {
  userId: number;
  data: InvoiceWorkspaceResponse;
  isEmailVerified: boolean;
  preferredLanguage: string;
};

function WorkspaceSection({
  title,
  children,
  contentClassName = ''
}: {
  title: string;
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <Card className="border">
      <Card.Content className="p-2">
        <h2 className="text-base font-medium">{title}</h2>
        <div className={contentClassName}>{children}</div>
      </Card.Content>
    </Card>
  );
}

export default function InvoiceWorkspace({
  userId,
  data,
  isEmailVerified,
  preferredLanguage
}: Props) {
  const t = useTranslations('invoices.workspace');
  const pdfTranslator = useTranslations('invoices.pdf');
  const table = useTranslations('invoices.table');
  const tableActions = useTranslations('invoices.cell.actions');
  const locale = useLocale();
  const router = useRouter();
  const { cookieConsent } = useCookieConsent();
  const { invoice, balance, payments, deliveries } = data;
  const invoiceId = Number(invoice.id);
  const lifecycle = invoice.lifecycleStatus || 'draft';
  const due = getInvoiceDueStatus({ ...invoice, ...balance });
  const isIssued = lifecycle === 'issued';
  const isDraft = lifecycle === 'draft';
  const paymentStatus = getInvoicePaymentStatus({ ...invoice, ...balance });
  const isPaid = paymentStatus === 'paid';
  const supportsPayments = (invoice.currency || 'eur') === 'eur';
  const latestPaymentDate = payments.reduce((latest, payment) => payment.paymentDate > latest ? payment.paymentDate : latest, '');
  const currencySymbol = (invoice.currency || 'eur') === 'eur' ? '€' : '$';
  const needsPaymentReplacement = isDraft && invoice.paymentMode === 'crypto';
  const status = isDraft || lifecycle === 'voided'
    ? table(`lifecycle_status.${lifecycle}`)
    : table(`status.${paymentStatus}`);
  const [isIFrameLoading, setIsIFrameLoading] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [emailKind, setEmailKind] = useState<'invoice' | 'reminder'>('invoice');
  const [emailDelivery, setEmailDelivery] = useState<InvoiceEmailDelivery>();
  const openEmail = (kind: 'invoice' | 'reminder', delivery?: InvoiceEmailDelivery) => {
    setEmailKind(kind);
    setEmailDelivery(delivery);
    setSendOpen(true);
  };
  const [recipientDetailsOpen, setRecipientDetailsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<InvoicePayment | null>(
    null
  );
  const [confirmAction, setConfirmAction] = useState<
    'cancel' | 'delete' | 'remove-payment' | null
  >(null);
  const [confirmError, setConfirmError] = useState('');
  const [paymentToRemove, setPaymentToRemove] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const { pdfDocument, pdfUrl, isPdfDocumentLoading } = useDynamicPdf({
    currency: invoice.currency || 'eur',
    invoiceLanguage: invoice.documentLanguage || preferredLanguage,
    invoiceData: invoice,
    senderSignatureImage: invoice.senderSignature as string,
    receiverSignatureImage: invoice.receiverSignature as string
  });

  const openPayment = (payment?: InvoicePayment) => {
    setEditingPayment(payment || null);
    setPaymentOpen(true);
  };

  const refreshPaymentWorkspace = () => {
    setPaymentOpen(false);
    router.refresh();
  };

  const confirm = () =>
    startTransition(async () => {
      if (confirmAction === 'remove-payment' && paymentToRemove !== null) {
        const response = await removeInvoicePaymentAction(
          userId,
          invoiceId,
          paymentToRemove
        );
        toast(response.message, {
          variant: response.ok ? 'success' : 'danger'
        });
        if (!response.ok) { setConfirmError(response.message); return; }
        router.refresh();
      } else if (confirmAction === 'cancel') {
        const response = await updateInvoiceStatusAction({
          userId,
          invoiceId,
          newStatus: 'canceled'
        });
        toast(response.message, {
          variant: response.ok ? 'success' : 'danger'
        });
        if (!response.ok) { setConfirmError(response.message); return; }
        router.refresh();
      } else if (confirmAction === 'delete') {
        const response = await deleteInvoiceAction({ userId, invoiceId });
        toast(response.message, {
          variant: response.ok ? 'success' : 'danger'
        });
        if (response.ok) router.push(INVOICES_PAGE);
      }
      setConfirmError('');
      setConfirmAction(null);
      setPaymentToRemove(null);
    });

  const confirmTitle =
    confirmAction === 'cancel'
      ? t('cancel_title')
      : confirmAction === 'delete'
        ? t('delete_title')
        : t('remove_title');
  const confirmDescription =
    confirmAction === 'cancel'
      ? t('cancel_description')
      : confirmAction === 'delete'
        ? t('delete_description')
        : t('remove_description');

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">
            {invoice.invoiceId || t('draft')}
          </h1>
          <p className="text-muted text-sm">
            {invoice.receiver.name} · {t('due', { date: invoice.dueDate })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip
            variant="soft"
            color={
              lifecycle === 'voided'
                ? 'danger'
                : isPaid
                  ? 'success'
                  : 'accent'
            }
          >
            {status}
          </Chip>
          {due.isPastDue ? <Chip variant="soft" color="danger">{t('overdue')}</Chip> : null}
        </div>
      </header>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 overflow-hidden border p-0">
          {isPdfDocumentLoading ? (
            <div className="flex aspect-[794/1123] items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <PdfViewerWrapper
              pdfDocument={pdfDocument}
              pdfUrl={pdfUrl}
              isIFrameLoading={isIFrameLoading}
              setIsIFrameLoading={setIsIFrameLoading}
            />
          )}
        </Card>
        <div className="flex min-w-0 flex-col gap-4">
          <WorkspaceSection
            title={t('invoice_total')}
            contentClassName="mt-2 flex flex-col gap-2"
          >
            <div className="flex justify-between gap-3">
              <p className="text-muted text-sm">{t('paid')}</p>
              <p className="font-medium tabular-nums">{currencySymbol}{balance.paidAmount}</p>
            </div>
            <div className="flex justify-between gap-3">
              <p className="text-muted text-sm">{t('outstanding')}</p>
              <p className="font-medium tabular-nums">
                {currencySymbol}{balance.outstandingAmount}
              </p>
            </div>
            {isPaid && latestPaymentDate ? <p className="text-muted text-sm">{t('paid_date', { date: latestPaymentDate })}</p> : null}
          </WorkspaceSection>
          <WorkspaceSection
            title={t('actions')}
            contentClassName="mt-2 flex flex-col gap-2"
          >
            {isDraft ? (
              <>
                <Link
                  href={EDIT_INVOICE_PAGE(invoiceId)}
                  className={buttonVariants({
                    variant: 'secondary',
                    className: 'w-full justify-center'
                  })}
                >
                  <PencilSquareIcon className="size-4" />
                  {t('edit')}
                </Link>
                {!needsPaymentReplacement && <IssueInvoiceModal
                  userId={userId}
                  invoiceData={invoice}
                  triggerVariant="button"
                  onIssued={() => router.refresh()}
                />}
                <Button
                  className="w-full justify-center"
                  variant="tertiary"
                  isDisabled={needsPaymentReplacement}
                  onPress={() => setRecipientDetailsOpen(true)}
                >
                  <UserPlusIcon className="size-4" />
                  {tableActions('tooltip_request_details')}
                </Button>
              </>
            ) : null}
            {isIssued ? (
              <>
                <Button
                  className="w-full justify-center"
                  variant="primary"
                  isDisabled={!isEmailVerified}
                  onPress={() => openEmail('invoice')}
                >
                  <PaperAirplaneIcon className="size-4" />
                  {t('send')}
                </Button>
                {!isEmailVerified ? (
                  <p className="text-muted text-sm">
                    {t('verify_email_to_send')}
                  </p>
                ) : null}
                {Number(balance.outstandingAmount) > 0 ? (
                  <Button className="w-full justify-center" variant="secondary"
                    isDisabled={!isEmailVerified} onPress={() => openEmail('reminder')}>
                    <PaperAirplaneIcon className="size-4" />
                    {t('send_reminder')}
                  </Button>
                ) : null}
                {data.canCopyPublicLink ? (
                  <Button
                    className="w-full justify-center"
                    variant="tertiary"
                    onPress={async () => {
                      await navigator.clipboard.writeText(
                        `${window.location.origin}/invoices/public/${invoice.publicInvoiceToken}`
                      );
                      toast(t('copied'), { variant: 'success' });
                    }}
                  >
                    <LinkIcon className="size-4" />
                    {t('copy_link')}
                  </Button>
                ) : null}
              </>
            ) : null}
            {isIssued && !supportsPayments ? <p className="text-muted text-sm">{t('eur_only')}</p> : null}
            {pdfDocument ? (
              <PDFDownloadLink
                className="block w-full"
                document={pdfDocument}
                fileName={`${invoice.invoiceId || `draft-${invoiceId}`}.pdf`}
              >
                {({ loading }) => (
                  <Button
                    className="w-full"
                    variant="secondary"
                    isDisabled={loading || isPdfDocumentLoading}
                    onPress={() => {
                      if (cookieConsent !== 'accepted') return;
                      captureAnalyticsEvent(analyticsEvents.pdfDownloaded, {
                        source: 'saved_invoice',
                        invoice_status: invoice.status,
                        line_count: invoice.services.length
                      });
                    }}
                  >
                    <ArrowDownTrayIcon className="size-4" />
                    {pdfTranslator('buttons.download_pdf')}
                  </Button>
                )}
              </PDFDownloadLink>
            ) : null}
            {isDraft ? (
              <Button
                className="w-full justify-center"
                variant="danger-soft"
                onPress={() => setConfirmAction('delete')}
              >
                <TrashIcon className="size-4" />
                {t('delete_draft')}
              </Button>
            ) : null}
            {isIssued && payments.length === 0 ? (
              <Button
                className="w-full justify-center"
                variant="danger-soft"
                onPress={() => setConfirmAction('cancel')}
              >
                <NoSymbolIcon className="size-4" />
                {t('cancel_invoice')}
              </Button>
            ) : null}
          </WorkspaceSection>
          {isIssued || payments.length > 0 ? (
            <Card className="gap-0 overflow-hidden border p-0" role="region" aria-labelledby={`invoice-payments-${invoiceId}`}>
              <Card.Header className="gap-3 border-b p-5">
                <div className="flex w-full flex-wrap items-center justify-between gap-2">
                  <h2 id={`invoice-payments-${invoiceId}`} className="text-lg font-semibold">{t('payment_history')}</h2>
                  <Chip size="sm" variant="soft">{t('payment_count', { count: payments.length })}</Chip>
                </div>
                {isIssued && supportsPayments && Number(balance.outstandingAmount) > 0 ? (
                  <Button className="w-full" size="sm" variant="secondary" onPress={() => openPayment()}>
                    <BanknotesIcon className="size-4" />
                    {t('record_payment')}
                  </Button>
                ) : null}
              </Card.Header>
              {payments.length > 0 ? (
                <ul className="divide-y">
                  {payments.map((payment) => (
                    <li key={payment.id} className="space-y-3 p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p className="text-xl font-semibold tabular-nums">{currencySymbol}{payment.amount}</p>
                        <time className="text-muted text-xs tabular-nums" dateTime={payment.paymentDate}>{payment.paymentDate}</time>
                      </div>
                      {payment.bankReference || payment.notes ? (
                        <div className="space-y-1">
                          {payment.bankReference ? (
                            <p className="text-sm font-medium break-words">{payment.bankReference}</p>
                          ) : null}
                          {payment.notes ? (
                            <p className="text-muted text-xs leading-relaxed break-words whitespace-pre-wrap">{payment.notes}</p>
                          ) : null}
                        </div>
                      ) : null}
                      {isIssued && supportsPayments ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            aria-label={t('edit_payment')}
                            size="sm"
                            variant="secondary"
                            isDisabled={isPending}
                            onPress={() => openPayment(payment)}
                          >
                            <PencilSquareIcon className="size-4" />
                            {t('edit_payment_short')}
                          </Button>
                          <Button
                            aria-label={t('remove_payment')}
                            size="sm"
                            variant="ghost"
                            isDisabled={isPending}
                            onPress={() => {
                              setPaymentToRemove(payment.id);
                              setConfirmAction('remove-payment');
                            }}
                          >
                            <TrashIcon className="size-4" />
                            {t('remove_payment_short')}
                          </Button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <Card.Content className="p-5">
                  <p className="text-muted text-sm">{t('no_payments')}</p>
                </Card.Content>
              )}
            </Card>
          ) : null}
          {deliveries.length > 0 ? (
            <WorkspaceSection
              title={t('delivery_history')}
              contentClassName="mt-2"
            >
              <ul className="space-y-3 text-sm">
                {deliveries.map((delivery) => (
                  <li key={delivery.id}>
                    <p>
                      {delivery.kind === 'reminder'
                        ? t('reminder_email')
                        : t('invoice_email')}{' '}
                      · {t('recipient', { recipient: delivery.recipient })}
                    </p>
                    <p className="text-muted">
                      {delivery.status === 'failed' ||
                      delivery.status === 'bounced'
                        ? t('email_failed')
                        : delivery.status === 'unknown'
                          ? t('email_unknown')
                        : delivery.status === 'queued'
                          ? t('email_queued')
                          : t('email_sent')}
                      {delivery.sentAt || delivery.createdAt ? ' · ' : null}
                      {delivery.sentAt || delivery.createdAt
                        ? new Intl.DateTimeFormat(locale, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          }).format(new Date((delivery.sentAt || delivery.createdAt)!))
                        : null}
                    </p>
                    {delivery.providerMessageId ? <p className="text-muted break-all text-xs">
                      {t('message_id', { id: delivery.providerMessageId })}
                    </p> : null}
                    {delivery.failureCode ? <p className="text-muted text-xs">
                      {delivery.failureCode === 'reminder-no-longer-payable' ? t('email_reminder_paid')
                        : delivery.failureCode === 'preparation-failed' ? t('email_preparation_failed')
                        : ['provider-unknown', 'superseded-unknown'].includes(delivery.failureCode) ? t('email_unknown') : t('email_provider_failed')}
                    </p> : null}
                    {isIssued && (delivery.kind !== 'reminder' || Number(balance.outstandingAmount) > 0
                      || (['queued', 'unknown'].includes(delivery.status)
                        && !['superseded-unknown', 'reminder-no-longer-payable'].includes(delivery.failureCode || ''))) ? (
                      <Button size="sm" variant="tertiary" isDisabled={!isEmailVerified}
                        onPress={() => openEmail(delivery.kind === 'reminder' ? 'reminder' : 'invoice', delivery)}>
                        {['queued', 'unknown'].includes(delivery.status)
                          && !['superseded-unknown', 'reminder-no-longer-payable'].includes(delivery.failureCode || '')
                          ? t('recover_email') : ['failed', 'bounced'].includes(delivery.status) ? t('retry_email') : t('resend_email')}
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </WorkspaceSection>
          ) : null}
        </div>
      </div>
      {sendOpen && (
        <SendInvoiceEmailModal
          onClose={() => {
            setSendOpen(false);
            router.refresh();
          }}
          userId={userId}
          invoice={invoice}
          isEmailVerified={isEmailVerified}
          kind={emailKind}
          delivery={emailDelivery}
          outstandingAmount={balance.outstandingAmount}
          recipientEmail={emailKind === 'reminder'
            ? deliveries.find((delivery) => ['sent', 'delivered'].includes(delivery.status))?.recipient
            : undefined}
        />
      )}
      {isDraft && !needsPaymentReplacement && (
        <RecipientDetailsRequestModal
          userId={userId}
          invoice={invoice}
          isOpen={recipientDetailsOpen}
          onOpenChange={setRecipientDetailsOpen}
        />
      )}
      {paymentOpen ? (
        <InvoicePaymentDialog userId={userId} invoiceId={invoiceId}
          outstandingAmount={balance.outstandingAmount} payment={editingPayment}
          onClose={() => setPaymentOpen(false)}
          onRefresh={refreshPaymentWorkspace}
          onSaved={refreshPaymentWorkspace} />
      ) : null}
      <Modal.Backdrop
        isOpen={Boolean(confirmAction)}
        isDismissable={!isPending}
        isKeyboardDismissDisabled={isPending}
        onOpenChange={(open) => { if (!open && !isPending) { setConfirmError(''); setConfirmAction(null); } }}
      >
        <Modal.Container>
          <Modal.Dialog>
            {!isPending ? <Modal.CloseTrigger /> : null}
            <Modal.Header>
              <Modal.Heading>{confirmTitle}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p>{confirmDescription}</p>
              {confirmError ? <p role="alert" className="text-danger text-sm">{confirmError}</p> : null}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" isDisabled={isPending} onPress={() => { setConfirmError(''); setConfirmAction(null); }}>
                {t('close')}
              </Button>
              <Button variant="danger" isPending={isPending} isDisabled={isPending} onPress={confirm}>
                {confirmAction === 'cancel'
                  ? t('cancel_invoice')
                  : confirmAction === 'delete'
                    ? t('delete_draft')
                    : t('remove_payment')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </section>
  );
}
