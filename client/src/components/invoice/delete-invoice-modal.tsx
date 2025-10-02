import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react';
import { useTransition } from 'react';

import { deleteInvoiceAction } from '@/lib/actions/invoice';
import { InvoiceModel } from '@/lib/types/models/invoice';

type Props = {
  userId: number;
  invoiceData: InvoiceModel;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteInvoiceModal = ({
  userId,
  isOpen,
  onClose,
  invoiceData
}: Props) => {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () =>
    startTransition(async () => {
      const response = await deleteInvoiceAction({
        userId,
        invoiceId: invoiceData.id
      });

      addToast({
        title: response.message,
        color: 'errors' in response ? 'danger' : 'success'
      });

      if ('errors' in response) return;

      onClose();
    });

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full justify-end gap-1">
          <Button color="danger" onPress={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={isPending}
            color="secondary"
            onPress={handleSubmit}
          >
            Delete
          </Button>
        </div>
      </div>
    </ModalFooter>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          Are you sure you want to delete {invoiceData.invoiceId}?
        </ModalHeader>
        <ModalBody>
          This invoice will be deleted immediately. You can&apos;t undo this
          action.
        </ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default DeleteInvoiceModal;
