import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { Button, Modal, toast, useOverlayState } from '@heroui/react';
import type { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { issueInvoiceAction } from '@/lib/actions/invoice';

type Props = {
  userId: number;
  invoiceData: InvoiceBody;
};

const IssueInvoiceModal = ({ userId, invoiceData }: Props) => {
  const t = useTranslations('invoices.issue_modal');
  const [isPending, startTransition] = useTransition();
  const state = useOverlayState();

  const handleIssue = () =>
    startTransition(async () => {
      if (!invoiceData.id) return;

      const response = await issueInvoiceAction(userId, Number(invoiceData.id));
      toast(response.message, { variant: response.ok ? 'success' : 'danger' });

      if (response.ok) state.close();
    });

  return (
    <Modal state={state}>
      <Modal.Trigger
        aria-label={t('title')}
        title={t('title')}
        className="text-accent hover:bg-accent/10 flex size-8 cursor-pointer items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2"
      >
        <CheckBadgeIcon className="h-5 w-5" />
      </Modal.Trigger>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{t('title')}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p>{t('description')}</p>
              <p className="text-muted text-sm">{t('email_note')}</p>
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
