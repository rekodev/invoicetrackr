'use client';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
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

import { deleteUserAccount } from '@/api';
import { logOutAction } from '@/lib/actions';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteAccountModal = ({ userId, isOpen, onClose }: Props) => {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () =>
    startTransition(async () => {
      const response = await deleteUserAccount(userId);

      addToast({
        title: response.data.message,
        color: 'errors' in response.data ? 'danger' : 'success'
      });

      if ('errors' in response.data) return;

      logOutAction();
      onClose();
    });

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full justify-end gap-1">
          <Button color="danger" variant="bordered" onPress={onClose}>
            Cancel
          </Button>
          <Button isLoading={isPending} color="danger" onPress={handleSubmit}>
            Delete Permanently
          </Button>
        </div>
      </div>
    </ModalFooter>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-end gap-2">
          <ExclamationTriangleIcon className="text-danger-400 h-6 w-6" />
          Delete Account?
        </ModalHeader>
        <ModalBody>
          Your account and all associated data will be permanently deleted. This
          action cannot be undone.
        </ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default DeleteAccountModal;
