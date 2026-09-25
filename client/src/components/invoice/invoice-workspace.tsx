'use client';

import { ArrowDownTrayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import {
  Button,
  buttonVariants,
  Card,
  Chip,
  Input,
  Label,
  Modal,
  Spinner,
  TextField,
  toast
} from '@heroui/react';
import type {
  InvoicePayment,
  InvoiceWorkspaceResponse
} from '@invoicetrackr/types';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import {
  deleteInvoiceAction,
  removeInvoicePaymentAction,
  saveInvoicePaymentAction,
  updateInvoiceStatusAction
} from '@/lib/actions/invoice';
import { captureAnalyticsEvent } from '@/lib/analytics/client';
import { analyticsEvents } from '@/lib/analytics/events';
import { EDIT_INVOICE_PAGE, INVOICES_PAGE } from '@/lib/constants/pages';
import useDynamicPdf from '@/lib/hooks/pdf/use-dynamic-pdf';
import useCookieConsent from '@/lib/hooks/use-cookie-consent';
import { getInvoiceDueStatus } from '@/lib/utils/invoice';

import PdfViewerWrapper from '../pdf/pdf-viewer-wrapper';
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

const today = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Vilnius',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
};

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
  const due = getInvoiceDueStatus(invoice);
  const isIssued = lifecycle === 'issued';
  const isDraft = lifecycle === 'draft';
  const isPaid = balance.outstandingAmount === '0.00' && isIssued;
  const isPartial = Number(balance.paidAmount) > 0 && !isPaid;
  const status =
    lifecycle === 'voided'
      ? table('lifecycle_status.voided')
      : isDraft
        ? table('lifecycle_status.draft')
        : isPaid
          ? table('status.paid')
          : due.isPastDue
            ? t('overdue')
            : isPartial
              ? t('partial')
              : table('status.pending');
  const [isIFrameLoading, setIsIFrameLoading] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [recipientDetailsOpen, setRecipientDetailsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<InvoicePayment | null>(
    null
  );
  const [confirmAction, setConfirmAction] = useState<
    'cancel' | 'delete' | 'remove-payment' | null
  >(null);
  const [paymentToRemove, setPaymentToRemove] = useState<number | null>(null);
  const [paymentDate, setPaymentDate] = useState(today());
  const [amount, setAmount] = useState(balance.outstandingAmount);
  const [bankReference, setBankReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const { pdfDocument, pdfUrl, isPdfDocumentLoading } = useDynamicPdf({
    currency: 'eur',
    defaultTranslator: pdfTranslator,
    invoiceLanguage: invoice.documentLanguage || preferredLanguage,
    invoiceData: invoice,
    senderSignatureImage: invoice.senderSignature as string,
    receiverSignatureImage: invoice.receiverSignature as string
  });

  const openPayment = (payment?: InvoicePayment) => {
    setEditingPayment(payment || null);
    setPaymentDate(payment?.paymentDate || today());
    setAmount(payment?.amount || balance.outstandingAmount);
    setBankReference(payment?.bankReference || '');
    setNotes(payment?.notes || '');
    setPaymentOpen(true);
  };

  const savePayment = () =>
    startTransition(async () => {
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;
      const response = await saveInvoicePaymentAction({
        userId,
        invoiceId,
        paymentId: editingPayment?.id,
        payment: {
          paymentDate,
          amount: numericAmount.toFixed(2),
          bankReference,
          notes
        }
      });
      toast(response.ok ? t('saved') : response.message, {
        variant: response.ok ? 'success' : 'danger'
      });
      if (response.ok) {
        setPaymentOpen(false);
        router.refresh();
      }
    });

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
        if (response.ok) router.refresh();
      } else if (confirmAction === 'cancel') {
        const response = await updateInvoiceStatusAction({
          userId,
          invoiceId,
          newStatus: 'canceled'
        });
        toast(response.message, {
          variant: response.ok ? 'success' : 'danger'
        });
        if (response.ok) router.refresh();
      } else if (confirmAction === 'delete') {
        const response = await deleteInvoiceAction({ userId, invoiceId });
        toast(response.message, {
          variant: response.ok ? 'success' : 'danger'
        });
        if (response.ok) router.push(INVOICES_PAGE);
      }
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
      <Link
        href={INVOICES_PAGE}
        className="text-muted inline-flex w-fit items-center gap-2 text-sm hover:underline"
      >
        <ArrowLeftIcon className="size-4" />
        {t('back')}
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">
            {invoice.invoiceId || t('draft')}
          </h1>
          <p className="text-muted text-sm">
            {invoice.receiver.name} · {t('due', { date: invoice.dueDate })}
          </p>
        </div>
        <Chip
          variant="soft"
          color={
            lifecycle === 'voided'
              ? 'danger'
              : isPaid
                ? 'success'
                : due.isPastDue
                  ? 'danger'
                  : 'accent'
          }
        >
          {status}
        </Chip>
      </header>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="border-default-200 min-w-0 overflow-hidden rounded-lg border bg-white">
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
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="border">
            <Card.Header>
              <Card.Title>
                {t('invoice_total')}: €{Number(invoice.totalAmount).toFixed(2)}
              </Card.Title>
            </Card.Header>
            <Card.Content className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t('paid')}</span>
                <strong>€{balance.paidAmount}</strong>
              </div>
              <div className="flex justify-between">
                <span>{t('outstanding')}</span>
                <strong>€{balance.outstandingAmount}</strong>
              </div>
            </Card.Content>
          </Card>
          <Card className="border">
            <Card.Content className="flex flex-col gap-2 py-4">
              {isDraft ? (
                <>
                  <Link
                    href={EDIT_INVOICE_PAGE(invoiceId)}
                    className={buttonVariants({ variant: 'secondary' })}
                  >
                    {t('edit')}
                  </Link>
                  <IssueInvoiceModal
                    userId={userId}
                    invoiceData={invoice}
                    triggerVariant="button"
                    onIssued={() => router.refresh()}
                  />
                  <Button
                    variant="tertiary"
                    onPress={() => setRecipientDetailsOpen(true)}
                  >
                    {tableActions('tooltip_request_details')}
                  </Button>
                </>
              ) : null}
              {isIssued ? (
                <>
                  <Button
                    variant="primary"
                    isDisabled={!isEmailVerified}
                    onPress={() => setSendOpen(true)}
                  >
                    {t('send')}
                  </Button>
                  {!isEmailVerified ? (
                    <p className="text-muted text-sm">
                      {t('verify_email_to_send')}
                    </p>
                  ) : null}
                  {Number(balance.outstandingAmount) > 0 ? (
                    <Button variant="secondary" onPress={() => openPayment()}>
                      {t('record_payment')}
                    </Button>
                  ) : null}
                  {data.canCopyPublicLink ? (
                    <Button
                      variant="tertiary"
                      onPress={async () => {
                        await navigator.clipboard.writeText(
                          `${window.location.origin}/invoices/public/${invoice.publicInvoiceToken}`
                        );
                        toast(t('copied'), { variant: 'success' });
                      }}
                    >
                      {t('copy_link')}
                    </Button>
                  ) : null}
                </>
              ) : null}
              {pdfDocument ? (
                <PDFDownloadLink
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
                  variant="danger-soft"
                  onPress={() => setConfirmAction('delete')}
                >
                  {t('delete_draft')}
                </Button>
              ) : null}
              {isIssued && payments.length === 0 ? (
                <Button
                  variant="danger-soft"
                  onPress={() => setConfirmAction('cancel')}
                >
                  {t('cancel_invoice')}
                </Button>
              ) : null}
            </Card.Content>
          </Card>
          <Card className="border">
            <Card.Header>
              <Card.Title>{t('payment_history')}</Card.Title>
            </Card.Header>
            <Card.Content>
              {payments.length ? (
                <ul className="divide-default-200 divide-y text-sm">
                  {payments.map((payment) => (
                    <li key={payment.id} className="space-y-1 py-3">
                      <div className="flex justify-between gap-2">
                        <strong>€{payment.amount}</strong>
                        <span>{payment.paymentDate}</span>
                      </div>
                      {payment.bankReference ? (
                        <p className="text-muted">{payment.bankReference}</p>
                      ) : null}
                      {payment.notes ? (
                        <p className="text-muted">{payment.notes}</p>
                      ) : null}
                      {isIssued ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="tertiary"
                            onPress={() => openPayment(payment)}
                          >
                            {t('edit_payment')}
                          </Button>
                          <Button
                            size="sm"
                            variant="tertiary"
                            onPress={() => {
                              setPaymentToRemove(payment.id);
                              setConfirmAction('remove-payment');
                            }}
                          >
                            {t('remove_payment')}
                          </Button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted text-sm">{t('no_payments')}</p>
              )}
            </Card.Content>
          </Card>
          <Card className="border">
            <Card.Header>
              <Card.Title>{t('delivery_history')}</Card.Title>
            </Card.Header>
            <Card.Content>
              {deliveries.length ? (
                <ul className="space-y-3 text-sm">
                  {deliveries.map((delivery) => (
                    <li key={delivery.id}>
                      <p>
                        {delivery.kind === 'reminder'
                          ? t('reminder_email')
                          : t('invoice_email')}{' '}
                        · {t('sent_to', { recipient: delivery.recipient })}
                      </p>
                      <p className="text-muted">
                        {delivery.status === 'failed' ||
                        delivery.status === 'bounced'
                          ? t('email_failed')
                          : delivery.status === 'queued'
                            ? t('email_queued')
                            : t('email_sent')}
                        {delivery.sentAt ? ' · ' : null}
                        {delivery.sentAt
                          ? new Intl.DateTimeFormat(locale, {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            }).format(new Date(delivery.sentAt))
                          : null}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted text-sm">{t('no_deliveries')}</p>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
      {pdfDocument && (
        <SendInvoiceEmailModal
          isOpen={sendOpen}
          onClose={() => {
            setSendOpen(false);
            router.refresh();
          }}
          pdfDocument={pdfDocument}
          userId={userId}
          invoice={invoice}
          currency="eur"
          isEmailVerified={isEmailVerified}
        />
      )}
      {isDraft && (
        <RecipientDetailsRequestModal
          userId={userId}
          invoice={invoice}
          isOpen={recipientDetailsOpen}
          onOpenChange={setRecipientDetailsOpen}
        />
      )}
      <Modal.Backdrop
        isOpen={paymentOpen}
        onOpenChange={(open) => !open && setPaymentOpen(false)}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {editingPayment ? t('edit_payment') : t('record_payment')}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-3">
              <p className="text-muted text-sm">{t('bank_transfer')}</p>
              <TextField>
                <Label>{t('payment_date')}</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  max={today()}
                  onChange={(event) => setPaymentDate(event.target.value)}
                />
              </TextField>
              <TextField>
                <Label>{t('payment_amount')}</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </TextField>
              <TextField>
                <Label>{t('payment_reference')}</Label>
                <Input
                  value={bankReference}
                  onChange={(event) => setBankReference(event.target.value)}
                />
              </TextField>
              <TextField>
                <Label>{t('payment_note')}</Label>
                <Input
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </TextField>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" onPress={() => setPaymentOpen(false)}>
                {t('close')}
              </Button>
              <Button
                isPending={isPending}
                isDisabled={!paymentDate || !amount || Number(amount) <= 0}
                onPress={savePayment}
              >
                {t('save_payment')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
      <Modal.Backdrop
        isOpen={Boolean(confirmAction)}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{confirmTitle}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p>{confirmDescription}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" onPress={() => setConfirmAction(null)}>
                {t('close')}
              </Button>
              <Button variant="danger" isPending={isPending} onPress={confirm}>
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
