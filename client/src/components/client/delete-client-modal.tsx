'use client';

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

import { deleteClientAction } from '@/lib/actions/client';
import { UiState } from '@/lib/constants/ui-state';
import { ClientModel } from '@/lib/types/models/client';

type Props = {
  userId: number;
  clientData: ClientModel;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteClientModal = ({ userId, isOpen, onClose, clientData }: Props) => {
  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleSubmit = async () => {
    if (!clientData.id) return;

    setUiState(UiState.Pending);

    const response = await deleteClientAction({
      userId,
      clientId: clientData.id
    });
    setSubmissionMessage(response.message);

    if ('error' in response) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);
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
          <Button color="danger" onPress={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={uiState === UiState.Pending}
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
