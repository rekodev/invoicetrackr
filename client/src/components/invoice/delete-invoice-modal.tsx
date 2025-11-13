import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  addToast
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { deleteInvoiceAction } from '@/lib/actions/invoice';
import { Invoice } from '@invoicetrackr/types';

type Props = {
  userId: number;
  invoiceData: Invoice;
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
        invoiceId: invoiceData.id
      });

      addToast({
        title: response.message || '',
        color: response.ok ? 'success' : 'danger'
      });

      if (!response.ok) return;

      onClose();
    });

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full justify-end gap-1">
          <Button color="danger" onPress={onClose}>
            {t('cancel')}
          </Button>
          <Button
            isLoading={isPending}
            color="secondary"
            onPress={handleSubmit}
          >
            {t('confirm')}
          </Button>
        </div>
      </div>
    </ModalFooter>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          {t('title')}
        </ModalHeader>
        <ModalBody>
          {t('description', { invoiceId: invoiceData.invoiceId })}
        </ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default DeleteInvoiceModal;
