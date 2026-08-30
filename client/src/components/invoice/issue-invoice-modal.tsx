import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import {
  Button,
  buttonVariants,
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

  const trigger = (
    <Modal.Trigger
      aria-label={t('title')}
      className={
        triggerVariant === 'button'
          ? buttonVariants({
              variant: 'primary',
              size: 'sm',
              className: 'w-full sm:w-auto'
            })
          : 'text-accent hover:bg-accent/10 flex size-8 cursor-pointer items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2'
      }
    >
      <CheckBadgeIcon className="h-5 w-5" />
      {triggerVariant === 'button' ? t('confirm') : null}
    </Modal.Trigger>
  );

  return (
    <Modal state={state}>
      {triggerVariant === 'icon' ? (
        <Tooltip delay={0}>
          {trigger}
          <Tooltip.Content>{t('title')}</Tooltip.Content>
        </Tooltip>
      ) : (
        trigger
      )}
      <Modal.Backdrop>
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
    </Modal>
  );
};

export default IssueInvoiceModal;
