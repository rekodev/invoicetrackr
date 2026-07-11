'use client';

import { Button, Modal, toast } from '@heroui/react';
import { ClientBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { deleteClientAction } from '@/lib/actions/client';

type Props = {
  userId: number;
  clientData: ClientBody;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteClientModal = ({ userId, isOpen, onClose, clientData }: Props) => {
  const t = useTranslations('clients.delete_modal');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () =>
    startTransition(async () => {
      if (!clientData.id) return;

      const response = await deleteClientAction({
        userId,
        clientId: clientData.id
      });

      toast(response.message || '', {
        variant: response.ok ? 'success' : 'danger'
      });

      if (!response.ok) return;

      onClose();
    });

  const renderModalFooter = () => (
    <Modal.Footer>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full flex-col-reverse justify-end gap-2 sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onPress={onClose}
          >
            {t('cancel')}
          </Button>
          <Button
            isPending={isPending}
            variant="danger"
            className="w-full sm:w-auto"
            onPress={handleSubmit}
          >
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
              {t('description', { clientName: clientData.name })}
            </Modal.Body>
            {renderModalFooter()}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default DeleteClientModal;
