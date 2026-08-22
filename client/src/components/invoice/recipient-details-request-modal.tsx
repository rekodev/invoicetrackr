'use client';

import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { Button, Input, Label, Modal, TextField, toast } from '@heroui/react';
import type { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { createRecipientDetailsRequestAction } from '@/lib/actions/invoice';

type Props = {
  userId: number;
  invoice: InvoiceBody;
  isOpen: boolean;
  onOpenChange: (_isOpen: boolean) => void;
};

type PendingAction = 'copy' | 'send' | null;

export default function RecipientDetailsRequestModal({
  userId,
  invoice,
  isOpen,
  onOpenChange
}: Props) {
  const t = useTranslations('invoices.cell.actions');
  const [recipientEmail, setRecipientEmail] = useState(
    invoice.receiver.email || ''
  );
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isPending, startTransition] = useTransition();

  const createRequest = (sendEmail: boolean) => {
    if (!invoice.id) return;

    const action: Exclude<PendingAction, null> = sendEmail ? 'send' : 'copy';
    setPendingAction(action);
    startTransition(async () => {
      try {
        const response = await createRecipientDetailsRequestAction(
          userId,
          Number(invoice.id),
          recipientEmail.trim() || undefined,
          sendEmail
        );

        if (response.ok && response.data?.url && !sendEmail) {
          await navigator.clipboard.writeText(response.data.url);
        }

        toast(
          response.ok
            ? t(sendEmail ? 'details_request_emailed' : 'details_link_copied')
            : response.message,
          { variant: response.ok ? 'success' : 'danger' }
        );

        if (response.ok) onOpenChange(false);
      } catch {
        toast(t('request_details_failed'), { variant: 'danger' });
      } finally {
        setPendingAction(null);
      }
    });
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && onOpenChange(false)}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{t('request_details_title')}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <p className="text-muted text-sm">
                  {t('request_details_description')}
                </p>
                <TextField variant="secondary">
                  <Label>{t('recipient_email')}</Label>
                  <Input
                    type="email"
                    value={recipientEmail}
                    placeholder={t('recipient_email_placeholder')}
                    onChange={(event) => setRecipientEmail(event.target.value)}
                  />
                </TextField>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="tertiary"
                  className="w-full sm:w-auto"
                  isDisabled={isPending}
                  onPress={() => onOpenChange(false)}
                >
                  {t('cancel')}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  isDisabled={isPending}
                  isPending={pendingAction === 'copy'}
                  onPress={() => createRequest(false)}
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                  {t('copy_link')}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  isDisabled={isPending || !recipientEmail.trim()}
                  isPending={pendingAction === 'send'}
                  onPress={() => createRequest(true)}
                >
                  {t('send_email')}
                </Button>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
