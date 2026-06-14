import { Button, Modal, toast } from '@heroui/react';
import { InvoiceBody } from '@invoicetrackr/types';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { deleteInvoiceAction } from '@/lib/actions/invoice';

type Props = {
  userId: number;
  invoiceData: InvoiceBody;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteInvoiceModal = ({
  userId,
  isOpen,
  onClose,
  invoiceData
}: Props) => {
  const t = useTranslations('invoices.delete_modal');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () =>
    startTransition(async () => {
      const response = await deleteInvoiceAction({
        userId,
        invoiceId: Number(invoiceData.id)
      });

      toast(response.message, { variant: response.ok ? 'success' : 'danger' });

      if (!response.ok) return;

      onClose();
    });

  const renderModalFooter = () => (
    <Modal.Footer>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full justify-end gap-1">
          <Button variant="outline" onPress={onClose}>
            {t('cancel')}
          </Button>
          <Button isPending={isPending} variant="danger" onPress={handleSubmit}>
            {t('confirm')}
          </Button>
        </div>
      </div>
    </Modal.Footer>
  );

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{t('title')}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {t('description', { invoiceId: invoiceData.invoiceId || '' })}
            </Modal.Body>
            {renderModalFooter()}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default DeleteInvoiceModal;
