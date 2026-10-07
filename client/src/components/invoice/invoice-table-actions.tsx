'use client';

import {
  ArrowDownTrayIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  LinkIcon,
  NoSymbolIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  Dropdown,
  Label,
  Modal,
  Separator,
  Spinner,
  toast
} from '@heroui/react';
import type { InvoiceListItem } from '@invoicetrackr/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useContext, useState, useTransition } from 'react';

import { updateInvoiceStatusAction } from '@/lib/actions/invoice';
import { captureAnalyticsEvent } from '@/lib/analytics/client';
import { AnalyticsConsentContext } from '@/lib/analytics/consent-context';
import { analyticsEvents } from '@/lib/analytics/events';
import {
  EDIT_INVOICE_PAGE,
  INVOICE_WORKSPACE_PAGE
} from '@/lib/constants/pages';
import { useInvoiceWorkspaceLoader } from '@/lib/hooks/invoice/use-invoice-workspace-loader';
import { downloadInvoice } from '@/lib/utils/download-invoice';
import { getReminderRecipient } from '@/lib/utils/invoice';

import DeleteInvoiceModal from './delete-invoice-modal';
import InvoicePaymentDialog from './invoice-payment-dialog';
import IssueInvoiceModal from './issue-invoice-modal';
import RecipientDetailsRequestModal from './recipient-details-request-modal';
import SendInvoiceEmailModal from './send-invoice-email-modal';

type Dialog =
  | 'issue'
  | 'request'
  | 'invoice'
  | 'reminder'
  | 'payment'
  | 'delete'
  | 'cancel';

export default function InvoiceTableActions({
  invoice,
  userId,
  isEmailVerified,
  preferredLanguage
}: {
  invoice: InvoiceListItem;
  userId: number;
  isEmailVerified: boolean;
  preferredLanguage: string;
}) {
  const t = useTranslations('invoices.cell.actions');
  const workspace = useTranslations('invoices.workspace');
  const router = useRouter();
  const consent = useContext(AnalyticsConsentContext);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [loading, startLoading] = useTransition();
  const [downloading, startDownload] = useTransition();
  const [pending, startMutation] = useTransition();
  const invoiceId = Number(invoice.id);
  const { data, setData, error, setError, load } = useInvoiceWorkspaceLoader({
    userId,
    invoiceId,
    fallbackError: t('load_failed')
  });
  const close = () => {
    setDialog(null);
    setError('');
  };
  const refresh = () => {
    close();
    setData(null);
    router.refresh();
  };
  const draft =
    Boolean(data) && (data?.invoice.lifecycleStatus || 'draft') === 'draft';
  const issued = data?.invoice.lifecycleStatus === 'issued';
  const legacyCrypto = data?.invoice.paymentMode === 'crypto';
  const payable = issued && Number(data?.balance.outstandingAmount) > 0;
  const editable = draft || (issued && data.payments.length === 0);
  const itemClassName =
    'hover:bg-danger-soft data-[hovered=true]:bg-danger-soft';

  return (
    <>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <Link
          href={INVOICE_WORKSPACE_PAGE(invoiceId)}
          aria-label={t('tooltip_view')}
          className="text-muted hover:text-foreground inline-flex items-center"
        >
          <EyeIcon className="size-5" />
        </Link>
        <Button
          size="sm"
          variant="ghost"
          isIconOnly
          aria-label={t('tooltip_download')}
          isPending={downloading}
          isDisabled={downloading}
          onPress={() =>
            startDownload(async () => {
              setError('');
              const fresh = await load();
              if (!fresh) {
                toast(t('load_failed'), { variant: 'danger' });
                return;
              }
              try {
                await downloadInvoice(fresh.invoice, preferredLanguage);
                if (consent?.consentStatus === 'accepted')
                  captureAnalyticsEvent(analyticsEvents.pdfDownloaded, {
                    source: 'saved_invoice',
                    invoice_status: fresh.invoice.status,
                    line_count: fresh.invoice.services.length
                  });
              } catch {
                toast(t('download_failed'), { variant: 'danger' });
              }
            })
          }
        >
          <ArrowDownTrayIcon className="size-5" />
        </Button>
        {(invoice.lifecycleStatus || 'draft') !== 'voided' ? (
          <Dropdown
            onOpenChange={(open) => {
              if (open) {
                setData(null);
                setError('');
                startLoading(async () => {
                  await load();
                });
              }
            }}
          >
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              aria-label={t('more_actions')}
            >
              <EllipsisHorizontalIcon className="size-5" />
            </Button>
            <Dropdown.Popover>
              {loading ? (
                <div className="flex justify-center p-4">
                  <Spinner size="sm" />
                </div>
              ) : error ? (
                <div className="max-w-xs space-y-2 p-3">
                  <p role="alert" className="text-danger text-sm">
                    {error}
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => {
                      setError('');
                      startLoading(async () => {
                        await load();
                      });
                    }}
                  >
                    {t('retry')}
                  </Button>
                </div>
              ) : data ? (
                <Dropdown.Menu aria-label={t('more_actions')}>
                  {draft && !legacyCrypto ? (
                    <>
                      <Dropdown.Item
                        id="issue"
                        textValue={t('tooltip_issue')}
                        onAction={() => setDialog('issue')}
                      >
                        <CheckBadgeIcon className="size-4" />
                        <Label>{t('tooltip_issue')}</Label>
                      </Dropdown.Item>
                      <Dropdown.Item
                        id="request"
                        textValue={t('tooltip_request_details')}
                        onAction={() => setDialog('request')}
                      >
                        <UserPlusIcon className="size-4" />
                        <Label>{t('tooltip_request_details')}</Label>
                      </Dropdown.Item>
                    </>
                  ) : null}
                  {issued ? (
                    <>
                      <Dropdown.Item
                        id="send"
                        textValue={workspace('send')}
                        isDisabled={!isEmailVerified}
                        onAction={() => setDialog('invoice')}
                      >
                        <PaperAirplaneIcon className="size-4" />
                        <Label>{workspace('send')}</Label>
                      </Dropdown.Item>
                      {payable ? (
                        <Dropdown.Item
                          id="reminder"
                          textValue={workspace('send_reminder')}
                          isDisabled={!isEmailVerified}
                          onAction={() => setDialog('reminder')}
                        >
                          <PaperAirplaneIcon className="size-4" />
                          <Label>{workspace('send_reminder')}</Label>
                        </Dropdown.Item>
                      ) : null}
                      {data.canCopyPublicLink ? (
                        <Dropdown.Item
                          id="copy"
                          textValue={workspace('copy_link')}
                          onAction={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                `${window.location.origin}/invoices/public/${data.invoice.publicInvoiceToken}`
                              );
                              toast(workspace('copied'), {
                                variant: 'success'
                              });
                            } catch {
                              toast(t('copy_failed'), { variant: 'danger' });
                            }
                          }}
                        >
                          <LinkIcon className="size-4" />
                          <Label>{workspace('copy_link')}</Label>
                        </Dropdown.Item>
                      ) : null}
                      {payable && (data.invoice.currency || 'eur') === 'eur' ? (
                        <Dropdown.Item
                          id="payment"
                          textValue={workspace('record_payment')}
                          onAction={() => setDialog('payment')}
                        >
                          <BanknotesIcon className="size-4" />
                          <Label>{workspace('record_payment')}</Label>
                        </Dropdown.Item>
                      ) : null}
                    </>
                  ) : null}
                  {editable && (!draft || !legacyCrypto) ? (
                    <Separator className="-ms-1.5 w-[calc(100%+0.75rem)]" />
                  ) : null}
                  {draft ? (
                    <>
                      <Dropdown.Item
                        id="edit"
                        href={EDIT_INVOICE_PAGE(invoiceId)}
                        textValue={workspace('edit')}
                      >
                        <PencilSquareIcon className="size-4" />
                        <Label>{workspace('edit')}</Label>
                      </Dropdown.Item>
                      <Dropdown.Item
                        id="delete"
                        variant="danger"
                        className={itemClassName}
                        textValue={workspace('delete_draft')}
                        onAction={() => setDialog('delete')}
                      >
                        <TrashIcon className="text-danger size-4" />
                        <Label>{workspace('delete_draft')}</Label>
                      </Dropdown.Item>
                    </>
                  ) : null}
                  {issued && data.payments.length === 0 ? (
                    <Dropdown.Item
                      id="cancel"
                      variant="danger"
                      className={itemClassName}
                      textValue={workspace('cancel_invoice')}
                      onAction={() => {
                        setError('');
                        setDialog('cancel');
                      }}
                    >
                      <NoSymbolIcon className="text-danger size-4" />
                      <Label>{workspace('cancel_invoice')}</Label>
                    </Dropdown.Item>
                  ) : null}
                  {!draft && !issued ? (
                    <Dropdown.Item
                      id="view"
                      href={INVOICE_WORKSPACE_PAGE(invoiceId)}
                      textValue={t('tooltip_view')}
                    >
                      <EyeIcon className="size-4" />
                      <Label>{t('tooltip_view')}</Label>
                    </Dropdown.Item>
                  ) : null}
                </Dropdown.Menu>
              ) : null}
            </Dropdown.Popover>
          </Dropdown>
        ) : null}
      </div>
      {data && dialog === 'issue' ? (
        <IssueInvoiceModal
          userId={userId}
          invoiceData={data.invoice}
          triggerVariant="none"
          isOpen
          onOpenChange={(open) => !open && close()}
          onIssued={refresh}
        />
      ) : null}
      {data && dialog === 'request' ? (
        <RecipientDetailsRequestModal
          userId={userId}
          invoice={data.invoice}
          isOpen
          onOpenChange={(open) => !open && close()}
        />
      ) : null}
      {data && (dialog === 'invoice' || dialog === 'reminder') ? (
        <SendInvoiceEmailModal
          userId={userId}
          invoice={data.invoice}
          isEmailVerified={isEmailVerified}
          kind={dialog}
          outstandingAmount={data.balance.outstandingAmount}
          recipientEmail={
            dialog === 'reminder'
              ? getReminderRecipient(data.deliveries)
              : undefined
          }
          onClose={refresh}
        />
      ) : null}
      {data && dialog === 'payment' ? (
        <InvoicePaymentDialog
          userId={userId}
          invoiceId={invoiceId}
          outstandingAmount={data.balance.outstandingAmount}
          payment={null}
          onClose={close}
          onRefresh={refresh}
          onSaved={refresh}
        />
      ) : null}
      {data && dialog === 'delete' ? (
        <DeleteInvoiceModal
          userId={userId}
          invoiceData={data.invoice}
          isOpen
          onClose={refresh}
        />
      ) : null}
      <Modal.Backdrop
        isOpen={dialog === 'cancel'}
        isDismissable={!pending}
        isKeyboardDismissDisabled={pending}
        onOpenChange={(open) => !open && !pending && close()}
      >
        <Modal.Container>
          <Modal.Dialog>
            {!pending ? <Modal.CloseTrigger /> : null}
            <Modal.Header>
              <Modal.Heading>{workspace('cancel_title')}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p>{workspace('cancel_description')}</p>
              {error ? (
                <p role="alert" className="text-danger text-sm">
                  {error}
                </p>
              ) : null}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" isDisabled={pending} onPress={close}>
                {workspace('close')}
              </Button>
              <Button
                variant="danger"
                isPending={pending}
                isDisabled={pending}
                onPress={() =>
                  startMutation(async () => {
                    try {
                      const result = await updateInvoiceStatusAction({
                        userId,
                        invoiceId,
                        newStatus: 'canceled'
                      });
                      if (!result.ok) {
                        setError(result.message);
                        return;
                      }
                      toast(result.message, { variant: 'success' });
                      refresh();
                    } catch {
                      setError(t('action_failed'));
                    }
                  })
                }
              >
                {workspace('cancel_invoice')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
