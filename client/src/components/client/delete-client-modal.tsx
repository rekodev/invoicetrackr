'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  addToast
} from '@heroui/react';
import { useTransition } from 'react';

import { deleteClientAction } from '@/lib/actions/client';
import { ClientModel } from '@/lib/types/models/client';

type Props = {
  userId: number;
  clientData: ClientModel;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteClientModal = ({ userId, isOpen, onClose, clientData }: Props) => {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () =>
    startTransition(async () => {
      if (!clientData.id) return;

      const response = await deleteClientAction({
        userId,
        clientId: clientData.id
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
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button isLoading={isPending} color="danger" onPress={handleSubmit}>
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
          Are you sure you want to delete {clientData.name}?
        </ModalHeader>
        <ModalBody>
          This client will be deleted immediately. You can&apos;t undo this
          action.
        </ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default DeleteClientModal;
