import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Modal,
  toast,
  Tooltip,
  useOverlayState
} from '@heroui/react';
import type { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { issueInvoiceAction } from '@/lib/actions/invoice';

type Props = {
  userId: number;
  invoiceData: InvoiceBody;
  triggerVariant?: 'button' | 'icon';
  onIssued?: () => void;
};

const IssueInvoiceModal = ({
  userId,
  invoiceData,
  triggerVariant = 'icon',
  onIssued
}: Props) => {
  const t = useTranslations('invoices.issue_modal');
  const [isPending, startTransition] = useTransition();
  const state = useOverlayState();

  const handleIssue = () =>
    startTransition(async () => {
      if (!invoiceData.id) return;

      const response = await issueInvoiceAction(userId, Number(invoiceData.id));
      toast(response.message, { variant: response.ok ? 'success' : 'danger' });

      if (response.ok) {
        state.close();
        onIssued?.();
      }
    });

  const triggerButton = (
    <Button
      aria-label={t('title')}
      className={
        triggerVariant === 'button'
          ? 'w-full whitespace-nowrap sm:w-auto'
          : 'text-accent'
      }
      isIconOnly={triggerVariant === 'icon'}
      size="sm"
      type="button"
      variant={triggerVariant === 'button' ? 'primary' : 'tertiary'}
      onPress={state.open}
    >
      <CheckBadgeIcon className="h-5 w-5" />
      {triggerVariant === 'button' ? t('confirm') : null}
    </Button>
  );

  const trigger =
    triggerVariant === 'icon' ? (
      <Tooltip delay={0}>
        {triggerButton}
        <Tooltip.Content>{t('title')}</Tooltip.Content>
      </Tooltip>
    ) : (
      triggerButton
    );

  return (
    <>
      {trigger}
      <Modal.Backdrop
        isOpen={state.isOpen}
        onOpenChange={state.setOpen}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{t('title')}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p>{t('description')}</p>
            </Modal.Body>
            <Modal.Footer>
              <div className="flex w-full flex-col-reverse justify-end gap-2 sm:flex-row">
                <Button
                  className="w-full sm:w-auto"
                  variant="outline"
                  onPress={state.close}
                >
                  {t('cancel')}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  isPending={isPending}
                  variant="primary"
                  onPress={handleIssue}
                >
                  {t('confirm')}
                </Button>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
};

export default IssueInvoiceModal;
