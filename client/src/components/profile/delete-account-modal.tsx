'use client';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react';
import { useState } from 'react';

import { deleteUserAccount } from '@/api';
import { logOutAction } from '@/lib/actions';
import { UiState } from '@/lib/constants/ui-state';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteAccountModal = ({ userId, isOpen, onClose }: Props) => {
  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleSubmit = async () => {
    setUiState(UiState.Pending);

    const response = await deleteUserAccount(userId);
    setSubmissionMessage(response.data.message);

    if ('errors' in response.data) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);
    logOutAction();
    onClose();
  };

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex w-full items-center justify-between">
        {submissionMessage && (
          <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
            {submissionMessage}
          </Chip>
        )}
        <div className="flex w-full justify-end gap-1">
          <Button color="danger" variant="bordered" onPress={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={uiState === UiState.Pending}
            color="danger"
            onPress={handleSubmit}
          >
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
          <ExclamationTriangleIcon className="h-6 w-6 text-danger-400" />
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
